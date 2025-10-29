import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, tutors, smsLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { fullName, phone, email, dayOfWeek, startTime, tutorId, isActive } = body;

    const [updatedStudent] = await db
      .update(students)
      .set({
        fullName,
        phone,
        email: email || null,
        dayOfWeek,
        startTime,
        tutorId: tutorId || null,
        isActive,
      })
      .where(eq(students.id, id))
      .returning();

    if (!updatedStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Fetch the student with tutor relationship (same structure as GET route)
    const [studentWithTutor] = await db
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
      .where(eq(students.id, id));

    if (!studentWithTutor) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Normalize tutor to null if tutor.id is null (no tutor assigned)
    const response = {
      ...studentWithTutor,
      tutor: studentWithTutor.tutor?.id ? studentWithTutor.tutor : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // First, delete all related SMS logs to avoid foreign key constraint issues
    await db
      .delete(smsLogs)
      .where(eq(smsLogs.studentId, id));
    
    // Then delete the student
    const [deletedStudent] = await db
      .delete(students)
      .where(eq(students.id, id))
      .returning();

    if (!deletedStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}

