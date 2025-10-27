import { NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    // Get current student
    const student = await db.query.students.findFirst({
      where: eq(students.id, id),
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Toggle is_active
    const [updatedStudent] = await db
      .update(students)
      .set({ isActive: !student.isActive })
      .where(eq(students.id, id))
      .returning();

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("Error toggling student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

