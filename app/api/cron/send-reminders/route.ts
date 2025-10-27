import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, smsLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendSMS, formatMessage } from "@/lib/sweego";

// Map day numbers to French day names
const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron or authorized
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🕐 Running SMS reminder cron job...");

    // Get current settings
    const currentSettings = await db.query.settings.findFirst();
    if (!currentSettings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 500 });
    }

    const offsetMinutes = currentSettings.smsOffsetMinutes;
    const template = currentSettings.smsTemplate;

    // Get current time and day in Paris timezone (or adjust as needed)
    const now = new Date();
    const currentDay = DAY_NAMES[now.getDay()];
    
    // Calculate target time (now + offset)
    const targetTime = new Date(now.getTime() + offsetMinutes * 60 * 1000);
    const targetHour = targetTime.getHours().toString().padStart(2, "0");
    const targetMinute = targetTime.getMinutes().toString().padStart(2, "0");
    const targetTimeStr = `${targetHour}:${targetMinute}`;

    console.log(`Current day: ${currentDay}, Target time: ${targetTimeStr}`);

    // Find all active students for today whose session starts at target time (within 5-minute window)
    const allStudents = await db.query.students.findMany({
      where: and(
        eq(students.dayOfWeek, currentDay as "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche"),
        eq(students.isActive, true)
      ),
    });

    // Filter students whose start time matches (within 5-minute window for flexibility)
    const studentsToNotify = allStudents.filter((student) => {
      const studentTime = student.startTime.substring(0, 5); // HH:MM format
      const [studentHour, studentMin] = studentTime.split(":").map(Number);
      const [targetHour, targetMin] = targetTimeStr.split(":").map(Number);

      const studentTotalMin = studentHour * 60 + studentMin;
      const targetTotalMin = targetHour * 60 + targetMin;

      // Check if within 5-minute window
      const diff = Math.abs(studentTotalMin - targetTotalMin);
      return diff <= 5;
    });

    console.log(`Found ${studentsToNotify.length} students to notify`);

    const results = [];

    for (const student of studentsToNotify) {
      try {
        // Format message
        const message = formatMessage(template, {
          student_name: student.fullName,
          start_time: student.startTime.substring(0, 5),
          day: currentDay,
        });

        // Send SMS
        const result = await sendSMS(student.phone, message);

        // Log the SMS
        await db.insert(smsLogs).values({
          studentId: student.id,
          phone: student.phone,
          message: message,
          status: result.success ? "sent" : "failed",
        });

        results.push({
          studentId: student.id,
          name: student.fullName,
          phone: student.phone,
          status: result.success ? "sent" : "failed",
          error: result.error,
        });

        console.log(`SMS to ${student.fullName}: ${result.success ? "✅ sent" : "❌ failed"}`);
      } catch (error: unknown) {
        console.error(`Error sending SMS to ${student.fullName}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.push({
          studentId: student.id,
          name: student.fullName,
          phone: student.phone,
          status: "error",
          error: errorMessage,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      currentDay,
      targetTime: targetTimeStr,
      studentsNotified: studentsToNotify.length,
      results,
    });
  } catch (error: unknown) {
    console.error("Error in cron job:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to send reminders";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

