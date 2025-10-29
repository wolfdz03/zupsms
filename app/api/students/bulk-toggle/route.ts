import { NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { studentIds, isActive } = body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "studentIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    // Update all students in a single query
    const updatedStudents = await db
      .update(students)
      .set({ isActive })
      .where(inArray(students.id, studentIds))
      .returning();

    return NextResponse.json({
      success: true,
      count: updatedStudents.length,
      updatedStudents,
    });
  } catch (error) {
    console.error("Error bulk toggling students:", error);
    return NextResponse.json(
      { error: "Failed to update students" },
      { status: 500 }
    );
  }
}


