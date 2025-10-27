import { NextResponse } from "next/server";
import { sendSMS, formatMessage } from "@/lib/sms";

export async function POST(request: Request) {
  console.log("\n=== 🧪 SMS TEST ENDPOINT DEBUG ===");
  console.log(`[1] Endpoint called at: ${new Date().toISOString()}`);
  
  try {
    console.log(`[2] Parsing request body...`);
    const body = await request.json();
    console.log(`[3] Body parsed:`, JSON.stringify(body, null, 2));
    
    const { phone, template, sender } = body;
    console.log(`[4] Extracted params:`, { phone, hasTemplate: !!template, sender });

    if (!phone) {
      console.log(`[5] ❌ Phone number missing`);
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Prepare variables for Sweego template
    console.log(`[6] Preparing template variables...`);
    const variables = {
      jour: "lundi",
      heure: "14:00",
    };
    console.log(`[7] Template variables:`, variables);

    console.log(`[8] Calling sendSMS() with:`);
    console.log(`    - Phone: ${phone}`);
    console.log(`    - Variables:`, variables);

    // Send SMS using Sweego template (jour, heure)
    const result = await sendSMS(phone, variables);
    console.log(`[10] sendSMS() returned:`, JSON.stringify(result, null, 2));

    if (result.success) {
      console.log(`[11] ✅ SMS sent successfully`);
      console.log("=== END DEBUG ===\n");
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        status: result.status,
        message: "SMS sent successfully",
        phone: phone,
        templateVariables: variables
      });
    } else {
      console.log(`[11] ❌ SMS failed: ${result.error}`);
      console.log("=== END DEBUG ===\n");
      return NextResponse.json(
        { 
          error: result.error || "Failed to send SMS",
          success: false,
          phone: phone
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("[ERROR] Exception caught:", error);
    console.error("[ERROR] Stack:", error instanceof Error ? error.stack : "No stack");
    const errorMessage = error instanceof Error ? error.message : "Failed to send test SMS";
    console.log("=== END DEBUG ===\n");
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint to check SMS configuration
export async function GET() {
  try {
    const hasApiKey = !!process.env.SWEEGO_API_KEY;
    const templateId = process.env.SWEEGO_TEMPLATE_ID || "97775950-fe78-4b1b-98cd-13646067b704";
    const apiUrl = "https://api.sweego.io/send";

    return NextResponse.json({
      configured: hasApiKey,
      templateId,
      apiUrl,
      message: hasApiKey 
        ? "Sweego SMS is configured and ready to use" 
        : "Sweego SMS is not configured. Please set SWEEGO_API_KEY in your environment variables."
    });
  } catch (error: unknown) {
    console.error("Error checking SMS configuration:", error);
    return NextResponse.json(
      { error: "Failed to check SMS configuration" },
      { status: 500 }
    );
  }
}

