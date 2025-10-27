import { NextResponse } from "next/server";
import { db } from "@/db";
import { messageTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET single template
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [template] = await db
      .select()
      .from(messageTemplates)
      .where(eq(messageTemplates.id, id))
      .limit(1);

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 });
  }
}

// PATCH update template
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, content, isDefault } = body;

    // Check if template exists
    const [existingTemplate] = await db
      .select()
      .from(messageTemplates)
      .where(eq(messageTemplates.id, id))
      .limit(1);

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // If this template is being set as default, unset all others
    if (isDefault && !existingTemplate.isDefault) {
      await db
        .update(messageTemplates)
        .set({ isDefault: false })
        .where(eq(messageTemplates.isDefault, true));
    }

    const [updatedTemplate] = await db
      .update(messageTemplates)
      .set({
        ...(name && { name }),
        ...(content && { content }),
        ...(isDefault !== undefined && { isDefault }),
        updatedAt: new Date(),
      })
      .where(eq(messageTemplates.id, id))
      .returning();

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

// DELETE template
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [deletedTemplate] = await db
      .delete(messageTemplates)
      .where(eq(messageTemplates.id, id))
      .returning();

    if (!deletedTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}

