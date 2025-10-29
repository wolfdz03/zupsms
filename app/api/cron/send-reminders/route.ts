import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, smsLogs } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendSMS, formatMessage } from "@/lib/sms";

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
    const templateId = currentSettings.smsTemplate;

    // Get current time and day in Paris timezone
    const now = new Date();
    
    // Convert to Paris timezone (Europe/Paris)
    const parisFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      hour12: false,
    });
    
    const parts = parisFormatter.formatToParts(now);
    const parisHour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
    const parisMin = parseInt(parts.find(p => p.type === "minute")?.value || "0");
    const parisDay = parseInt(parts.find(p => p.type === "day")?.value || "0");
    
    // Get day of week for Paris timezone
    const nowParis = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
    const currentDay = DAY_NAMES[nowParis.getDay()];
    
    // Calculate target time (now + offset) in Paris timezone
    const targetTotalMin = parisHour * 60 + parisMin + offsetMinutes;
    const targetHour = Math.floor(targetTotalMin / 60) % 24;
    const targetMinute = targetTotalMin % 60;
    const targetTimeStr = `${targetHour.toString().padStart(2, "0")}:${targetMinute.toString().padStart(2, "0")}`;

    console.log(`📅 Current day: ${currentDay}, Current time (Paris): ${parisHour.toString().padStart(2, "0")}:${parisMin.toString().padStart(2, "0")}`);
    console.log(`⏰ SMS offset: ${offsetMinutes} minutes`);
    console.log(`🎯 Target time (when session starts): ${targetTimeStr}`);
    console.log(`📱 SMS will be sent ${offsetMinutes} minutes before session starts`);

    // Find all active students for today whose session starts at target time (within 5-minute window)
    const allStudents = await db.query.students.findMany({
      where: and(
        eq(students.dayOfWeek, currentDay as "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche"),
        eq(students.isActive, true)
      ),
    });

    // Debug logging
    console.log(`Total active students found for ${currentDay}: ${allStudents.length}`);
    allStudents.forEach(student => {
      console.log(`  - ${student.fullName}: ${student.startTime} (${student.dayOfWeek})`);
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
      const matches = diff <= 5;
      
      if (matches) {
        console.log(`  ✓ Match: ${student.fullName} (${studentTime} vs target ${targetTimeStr}, diff: ${diff}min)`);
      }
      
      return matches;
    });

    console.log(`Found ${studentsToNotify.length} students to notify`);

    if (studentsToNotify.length === 0 && allStudents.length > 0) {
      console.log(`⚠️  No students found with start time matching ${targetTimeStr} (±5 minutes)`);
      console.log(`Available student times for ${currentDay}:`);
      const uniqueTimes = [...new Set(allStudents.map(s => s.startTime.substring(0, 5)))];
      uniqueTimes.forEach(time => console.log(`  - ${time}`));
    }

    if (allStudents.length === 0) {
      console.log(`ℹ️  No active students found for ${currentDay}`);
    }

    const results = [];

    for (const student of studentsToNotify) {
      try {
        // CRITICAL: Check if SMS has already been sent to this student today
        // Check if SMS already sent today - use select query instead of findFirst
        const existingSmsList = await db
          .select()
          .from(smsLogs)
          .where(and(
            eq(smsLogs.studentId, student.id),
            eq(smsLogs.status, "sent")
          ))
          .orderBy(desc(smsLogs.sentAt))
          .limit(1);
        
        const existingSms = existingSmsList[0] || null;

        // Check if the existing SMS was sent today
        if (existingSms && existingSms.sentAt) {
          const existingSmsDate = existingSms.sentAt;
          const isToday = 
            existingSmsDate.getFullYear() === now.getFullYear() &&
            existingSmsDate.getMonth() === now.getMonth() &&
            existingSmsDate.getDate() === now.getDate();
          
          if (isToday) {
            console.log(`⏭️  SMS already sent to ${student.fullName} today, skipping...`);
            results.push({
              studentId: student.id,
              name: student.fullName,
              phone: student.phone,
              status: "skipped",
              reason: "Already sent today",
            });
            continue;
          }
        }

        // Send SMS with template variables (using Sweego variable names: jour, heure)
        const result = await sendSMS(student.phone, {
          jour: currentDay,
          heure: student.startTime.substring(0, 5),
        }, templateId);

        // Log the SMS (template now contains Sweego template ID)
        const logMessage = `[Sweego Template: ${templateId}] Variables: jour=${currentDay}, heure=${student.startTime.substring(0, 5)}`;

        await db.insert(smsLogs).values({
          studentId: student.id,
          phone: student.phone,
          message: logMessage,
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

