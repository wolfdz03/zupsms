import { NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, email, dayOfWeek, startTime, tutorId, isActive } = body;

    // Validation
    if (!fullName || !phone || !dayOfWeek || !startTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If tutorId is provided, check if tutor has capacity (max 5 students)
    if (tutorId) {
      const tutorStudents = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(students)
        .where(eq(students.tutorId, tutorId));

      if (tutorStudents[0].count >= 5) {
        return NextResponse.json(
          { error: "Ce tuteur a atteint sa capacité maximale (5 étudiants)" },
          { status: 400 }
        );
      }
    }

    const [newStudent] = await db
      .insert(students)
      .values({
        fullName,
        phone,
        email: email || null,
        dayOfWeek,
        startTime,
        tutorId: tutorId || null,
        isActive: isActive ?? true,
      })
      .returning();

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}

