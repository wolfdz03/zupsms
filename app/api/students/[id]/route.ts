import { NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
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

    return NextResponse.json(updatedStudent);
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

