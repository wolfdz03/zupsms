// SMS Service - Sweego implementation

const SWEEGO_API_URL = "https://api.sweego.io/send";

export interface SMSProvider {
  send(to: string, message: string, options?: Record<string, unknown>): Promise<{
    success: boolean;
    messageId?: string;
    status?: string;
    error?: string;
  }>;
}

// Sweego API integration
export async function sendSMS(
  to: string, 
  variables: Record<string, string>,
  templateId?: string
): Promise<{
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
}> {
  console.log("\n=== 📱 SEND SMS FUNCTION (Sweego) ===");
  console.log(`Sending SMS to: ${to}`);
  console.log(`Variables:`, variables);
  
  const apiKey = process.env.SWEEGO_API_KEY;
  if (!apiKey) {
    console.error("❌ SWEEGO_API_KEY not configured");
    console.error("Please create .env.local file with your Sweego API key");
    return {
      success: false,
      error: "Sweego API key not configured. Please set SWEEGO_API_KEY in your .env.local file. See env.example for reference."
    };
  }

  // Use provided template ID or fall back to environment variable or default
  const finalTemplateId = templateId || process.env.SWEEGO_TEMPLATE_ID || "97775950-fe78-4b1b-98cd-13646067b704";
  
  // Log for debugging
  console.log(`Template ID: ${finalTemplateId}`);
  console.log(`API Key configured: ${apiKey ? "Yes (hidden)" : "No"}`);

  try {
    // Ensure phone number is properly formatted (remove spaces, ensure + prefix)
    const cleanPhone = to.trim();
    
    const requestBody = {
      channel: "sms",
      provider: "sweego",
      "template-id": finalTemplateId,
      "campaign-type": "transac",
      recipients: [
        { num: cleanPhone, region: "FR" }
      ],
      variables: variables,
      bat: false,
      "campaign-id": `campaign-${Date.now()}`
    };

    console.log(`Calling Sweego API: ${SWEEGO_API_URL}`);
    console.log(`Request body:`, JSON.stringify(requestBody, null, 2));

    const response = await fetch(SWEEGO_API_URL, {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json().catch(() => {
      console.error("Failed to parse response as JSON");
      return { error: "Invalid response from server" };
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response data:`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("❌ Sweego API error:", data);
      console.error("Response status:", response.status);
      
      // Provide more specific error message
      let errorMessage = "Failed to send SMS via Sweego API";
      if (response.status === 401) {
        errorMessage = "Authentication failed. Please check your SWEEGO_API_KEY in .env.local";
      } else if (response.status === 400) {
        errorMessage = `Bad request: ${data.message || data.detail || "Invalid parameters"}`;
      } else if (data.detail || data.message || data.error) {
        errorMessage = data.detail || data.message || data.error;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }

    console.log("✅ SMS sent successfully");
    console.log("=== END SMS ===\n");

    return {
      success: true,
      messageId: data.messageId || data.id,
      status: data.status || "sent"
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Exception sending SMS:", errorMessage);
    console.log("=== END SMS ===\n");
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Format message with variables (kept for logging purposes)
export function formatMessage(template: string, variables: Record<string, string>): string {
  let formatted = template;
  Object.entries(variables).forEach(([key, value]) => {
    formatted = formatted.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    formatted = formatted.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  });
  return formatted;
}
