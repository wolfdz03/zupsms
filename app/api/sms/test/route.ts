import { NextResponse } from "next/server";
import { sendSMS, formatMessage } from "@/lib/sweego";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, template } = body;

    if (!phone || !template) {
      return NextResponse.json(
        { error: "Phone and template are required" },
        { status: 400 }
      );
    }

    // Format test message with example data
    const message = formatMessage(template, {
      student_name: "Test User",
      start_time: "14:00",
      day: "aujourd'hui",
    });

    // Send SMS
    const result = await sendSMS(phone, message);

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to send SMS" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Error in test SMS endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to send test SMS";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

