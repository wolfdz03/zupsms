import { NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";

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

