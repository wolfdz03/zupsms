// Sweego SMS Integration
// Sweego is a European GDPR-compliant SMS & Email API service

if (!process.env.SWEEGO_API_KEY || !process.env.SWEEGO_SENDER_ID) {
  console.warn("⚠️ Sweego credentials not configured. SMS functionality will not work.");
}

export const SWEEGO_API_KEY = process.env.SWEEGO_API_KEY;
export const SWEEGO_SENDER_ID = process.env.SWEEGO_SENDER_ID;
export const SWEEGO_API_URL = process.env.SWEEGO_API_URL || "https://api.sweego.io/v1";

export async function sendSMS(to: string, message: string) {
  if (!SWEEGO_API_KEY || !SWEEGO_SENDER_ID) {
    throw new Error("Sweego not configured");
  }

  try {
    const response = await fetch(`${SWEEGO_API_URL}/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SWEEGO_API_KEY}`,
      },
      body: JSON.stringify({
        from: SWEEGO_SENDER_ID,
        to: to,
        text: message,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      messageId: result.id || result.messageId,
      status: result.status || "sent",
    };
  } catch (error: unknown) {
    console.error("Error sending SMS:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: message,
    };
  }
}

export function formatMessage(template: string, variables: Record<string, string>) {
  let formatted = template;
  Object.entries(variables).forEach(([key, value]) => {
    formatted = formatted.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  });
  return formatted;
}

