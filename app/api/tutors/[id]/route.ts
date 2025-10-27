import { NextResponse } from "next/server";
import { db } from "@/db";
import { tutors, students } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// GET single tutor with student count
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tutorWithCount = await db
      .select({
        id: tutors.id,
        name: tutors.name,
        email: tutors.email,
        avatarUrl: tutors.avatarUrl,
        createdAt: tutors.createdAt,
        studentCount: sql<number>`cast(count(${students.id}) as int)`,
      })
      .from(tutors)
      .leftJoin(students, eq(tutors.id, students.tutorId))
      .where(eq(tutors.id, id))
      .groupBy(tutors.id, tutors.name, tutors.email, tutors.avatarUrl, tutors.createdAt)
      .limit(1);

    if (tutorWithCount.length === 0) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    return NextResponse.json(tutorWithCount[0]);
  } catch (error) {
    console.error("Error fetching tutor:", error);
    return NextResponse.json({ error: "Failed to fetch tutor" }, { status: 500 });
  }
}

// PATCH update tutor
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, avatarUrl } = body;

    // Check if tutor exists
    const existingTutor = await db
      .select()
      .from(tutors)
      .where(eq(tutors.id, id))
      .limit(1);

    if (existingTutor.length === 0) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    // If email is being changed, check if new email already exists
    if (email && email !== existingTutor[0].email) {
      const emailExists = await db
        .select()
        .from(tutors)
        .where(eq(tutors.email, email))
        .limit(1);

      if (emailExists.length > 0) {
        return NextResponse.json(
          { error: "A tutor with this email already exists" },
          { status: 400 }
        );
      }
    }

    const [updatedTutor] = await db
      .update(tutors)
      .set({
        ...(name && { name }),
        ...(email && { email }),
        ...(avatarUrl && { avatarUrl }),
      })
      .where(eq(tutors.id, id))
      .returning();

    return NextResponse.json(updatedTutor);
  } catch (error) {
    console.error("Error updating tutor:", error);
    return NextResponse.json({ error: "Failed to update tutor" }, { status: 500 });
  }
}

// DELETE tutor
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if tutor has assigned students
    const assignedStudents = await db
      .select()
      .from(students)
      .where(eq(students.tutorId, id))
      .limit(1);

    if (assignedStudents.length > 0) {
      // Unassign students before deleting
      await db
        .update(students)
        .set({ tutorId: null })
        .where(eq(students.tutorId, id));
    }

    const [deletedTutor] = await db
      .delete(tutors)
      .where(eq(tutors.id, id))
      .returning();

    if (!deletedTutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Tutor deleted successfully" });
  } catch (error) {
    console.error("Error deleting tutor:", error);
    return NextResponse.json({ error: "Failed to delete tutor" }, { status: 500 });
  }
}

