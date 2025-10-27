import { NextResponse } from "next/server";
import { db } from "@/db";
import { smsLogs, students } from "@/db/schema";
import { sql, eq, and, gte, like, or } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const days = searchParams.get("days"); // last N days filter
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where conditions
    const conditions = [];

    if (status && status !== "all") {
      conditions.push(eq(smsLogs.status, status));
    }

    if (days) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      conditions.push(gte(smsLogs.sentAt, daysAgo));
    }

    if (search) {
      conditions.push(
        or(
          like(smsLogs.phone, `%${search}%`),
          like(smsLogs.message, `%${search}%`)
        )
      );
    }

    // Get logs with student names
    const logs = await db
      .select({
        id: smsLogs.id,
        phone: smsLogs.phone,
        message: smsLogs.message,
        status: smsLogs.status,
        sentAt: smsLogs.sentAt,
        studentId: smsLogs.studentId,
        studentName: students.fullName,
      })
      .from(smsLogs)
      .leftJoin(students, eq(smsLogs.studentId, students.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`${smsLogs.sentAt} DESC`)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(smsLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json({
      logs,
      total: Number(totalResult?.count || 0),
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching SMS logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch SMS logs" },
      { status: 500 }
    );
  }
}

