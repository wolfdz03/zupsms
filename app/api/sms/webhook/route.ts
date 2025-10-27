import { NextResponse } from "next/server";
import { db } from "@/db";
import { smsLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

// Webhook endpoint for Sweego SMS delivery status updates
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verify webhook signature if Sweego provides one
    const signature = request.headers.get("x-sweego-signature");
    if (signature && process.env.SWEEGO_WEBHOOK_SECRET) {
      // TODO: Implement signature verification
      console.log("Webhook signature verification not implemented yet");
    }

    console.log("📨 Received Sweego webhook:", body);

    const { 
      messageId, 
      status, 
      phone, 
      error,
      deliveredAt,
      failedAt 
    } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId is required" },
        { status: 400 }
      );
    }

    // Update SMS log status
    try {
      await db.update(smsLogs)
        .set({
          status: status || "delivered",
          sentAt: deliveredAt ? new Date(deliveredAt) : new Date()
        })
        .where(eq(smsLogs.id, messageId));

      console.log(`✅ Updated SMS log ${messageId} with status: ${status}`);
    } catch (dbError) {
      console.error("Failed to update SMS log:", dbError);
      // Don't fail the webhook if we can't update the log
    }

    return NextResponse.json({ 
      success: true, 
      message: "Webhook processed successfully" 
    });

  } catch (error: unknown) {
    console.error("Error processing Sweego webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process webhook";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint to test webhook configuration
export async function GET() {
  return NextResponse.json({
    message: "Sweego webhook endpoint is active",
    webhookUrl: "/api/sms/webhook",
    note: "Configure this URL in your Sweego dashboard for delivery status updates"
  });
}
