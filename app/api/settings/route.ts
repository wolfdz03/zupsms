import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const currentSettings = await db.query.settings.findFirst();
    return NextResponse.json(currentSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { smsOffsetMinutes, smsTemplate } = body;

    // Get existing settings
    const existingSettings = await db.query.settings.findFirst();

    if (existingSettings) {
      // Update existing settings
      const [updated] = await db
        .update(settings)
        .set({
          smsOffsetMinutes,
          smsTemplate,
          updatedAt: new Date(),
        })
        .where(eq(settings.id, existingSettings.id))
        .returning();

      return NextResponse.json(updated);
    } else {
      // Create new settings (shouldn't happen with seed)
      const [newSettings] = await db
        .insert(settings)
        .values({
          smsOffsetMinutes,
          smsTemplate,
        })
        .returning();

      return NextResponse.json(newSettings);
    }
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

