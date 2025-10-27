import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.SWEEGO_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        configured: false,
        error: "SWEEGO_API_KEY not configured",
        message: "Please create a .env.local file and add your Sweego API key. See env.example for reference."
      });
    }

    // Try to get account info from Sweego API
    try {
      const response = await fetch("https://api.sweego.io/account", {
        method: "GET",
        headers: {
          "Api-Key": apiKey,
          "Accept": "application/json"
        }
      });

      if (response.ok) {
        const accountInfo = await response.json();
        
        return NextResponse.json({
          configured: true,
          account: {
            credits: accountInfo.credits || accountInfo.balance || "Unknown",
            status: accountInfo.status || "active",
            senderId: process.env.SWEEGO_SENDER_ID || "ZUPdeCO"
          },
          message: "Sweego account is active and configured"
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({
          configured: true,
          error: `API Error: ${errorData.message || response.statusText}`,
          status: response.status
        });
      }
    } catch (apiError) {
      console.error("Error checking Sweego account:", apiError);
      return NextResponse.json({
        configured: true,
        error: "Failed to connect to Sweego API",
        note: "API key is configured but unable to verify account status"
      });
    }

  } catch (error: unknown) {
    console.error("Error in account check:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to check account";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
