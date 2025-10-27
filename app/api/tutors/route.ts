import { NextResponse } from "next/server";
import { db } from "@/db";
import { tutors, students } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// GET all tutors with student count
export async function GET() {
  try {
    const allTutors = await db
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
      .groupBy(tutors.id, tutors.name, tutors.email, tutors.avatarUrl, tutors.createdAt)
      .orderBy(tutors.name);

    return NextResponse.json(allTutors);
  } catch (error) {
    console.error("Error fetching tutors:", error);
    return NextResponse.json({ error: "Failed to fetch tutors" }, { status: 500 });
  }
}

// POST create new tutor
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, avatarUrl } = body;

    // Validation
    if (!name || !email || !avatarUrl) {
      return NextResponse.json(
        { error: "Name, email, and avatar are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingTutor = await db
      .select()
      .from(tutors)
      .where(eq(tutors.email, email))
      .limit(1);

    if (existingTutor.length > 0) {
      return NextResponse.json(
        { error: "A tutor with this email already exists" },
        { status: 400 }
      );
    }

    const [newTutor] = await db
      .insert(tutors)
      .values({
        name,
        email,
        avatarUrl,
      })
      .returning();

    return NextResponse.json(newTutor, { status: 201 });
  } catch (error) {
    console.error("Error creating tutor:", error);
    return NextResponse.json({ error: "Failed to create tutor" }, { status: 500 });
  }
}

