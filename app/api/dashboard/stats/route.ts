import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, smsLogs, tutors } from "@/db/schema";
import { eq, count, sql, and, gte, isNotNull } from "drizzle-orm";

export async function GET() {
  try {
    // Get total students count
    const [totalStudentsResult] = await db
      .select({ count: count() })
      .from(students);

    // Get active students count
    const [activeStudentsResult] = await db
      .select({ count: count() })
      .from(students)
      .where(eq(students.isActive, true));

    // Get total tutors count
    const [totalTutorsResult] = await db
      .select({ count: count() })
      .from(tutors);

    // Get students with assigned tutors
    const [assignedStudentsResult] = await db
      .select({ count: count() })
      .from(students)
      .where(isNotNull(students.tutorId));

    // Get SMS sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [smsSentTodayResult] = await db
      .select({ count: count() })
      .from(smsLogs)
      .where(
        and(
          gte(smsLogs.sentAt, today),
          eq(smsLogs.status, "sent")
        )
      );

    // Get SMS sent this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const [smsSentWeekResult] = await db
      .select({ count: count() })
      .from(smsLogs)
      .where(
        and(
          gte(smsLogs.sentAt, weekAgo),
          eq(smsLogs.status, "sent")
        )
      );

    // Get upcoming sessions (students with sessions today)
    const currentDay = today.toLocaleDateString("fr-FR", { weekday: "long" }).toLowerCase();
    const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format

    const upcomingSessions = await db
      .select()
      .from(students)
      .where(
        and(
          eq(students.dayOfWeek, currentDay as "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche"),
          eq(students.isActive, true),
          sql`${students.startTime} > ${currentTime}`
        )
      )
      .limit(5);

    // Get recent SMS logs
    const recentLogs = await db
      .select({
        id: smsLogs.id,
        phone: smsLogs.phone,
        message: smsLogs.message,
        status: smsLogs.status,
        sentAt: smsLogs.sentAt,
        studentId: smsLogs.studentId,
      })
      .from(smsLogs)
      .orderBy(sql`${smsLogs.sentAt} DESC`)
      .limit(5);

    const totalTutors = totalTutorsResult?.count || 0;
    const assignedStudents = assignedStudentsResult?.count || 0;
    const totalStudents = totalStudentsResult?.count || 0;
    const maxCapacity = totalTutors * 5; // Each tutor can have max 5 students
    const utilizationRate = maxCapacity > 0 ? Math.round((assignedStudents / maxCapacity) * 100) : 0;

    return NextResponse.json({
      totalStudents,
      activeStudents: activeStudentsResult?.count || 0,
      inactiveStudents: totalStudents - (activeStudentsResult?.count || 0),
      smsSentToday: smsSentTodayResult?.count || 0,
      smsSentThisWeek: smsSentWeekResult?.count || 0,
      totalTutors,
      assignedStudents,
      utilizationRate,
      upcomingSessions,
      recentActivity: recentLogs,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

