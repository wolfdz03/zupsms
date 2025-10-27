import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, tutors } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const allStudents = await db
      .select({
        id: students.id,
        fullName: students.fullName,
        phone: students.phone,
        email: students.email,
        dayOfWeek: students.dayOfWeek,
        startTime: students.startTime,
        tutorId: students.tutorId,
        isActive: students.isActive,
        createdAt: students.createdAt,
        tutor: {
          id: tutors.id,
          name: tutors.name,
          email: tutors.email,
          avatarUrl: tutors.avatarUrl,
        },
      })
      .from(students)
      .leftJoin(tutors, eq(students.tutorId, tutors.id))
      .orderBy(asc(students.startTime));

    return NextResponse.json(allStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

