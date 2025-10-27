import { NextResponse } from "next/server";
import { db } from "@/db";
import { messageTemplates } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// GET all templates
export async function GET() {
  try {
    const allTemplates = await db
      .select()
      .from(messageTemplates)
      .orderBy(desc(messageTemplates.isDefault), desc(messageTemplates.createdAt));

    return NextResponse.json(allTemplates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    // If database connection fails, return empty array instead of error
    // This allows the UI to still work even if templates can't be loaded
    return NextResponse.json([]);
  }
}

// POST create new template
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, content, isDefault } = body;

    // Validation
    if (!name || !content) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 }
      );
    }

    // If this template is being set as default, unset all others
    if (isDefault) {
      await db
        .update(messageTemplates)
        .set({ isDefault: false })
        .where(eq(messageTemplates.isDefault, true));
    }

    const [newTemplate] = await db
      .insert(messageTemplates)
      .values({
        name,
        content,
        isDefault: isDefault || false,
      })
      .returning();

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

