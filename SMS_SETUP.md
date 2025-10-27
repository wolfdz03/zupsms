# 📱 SMS Service - Configuration Guide

## ✅ Sweego SMS Integration

The SMS service is now integrated with Sweego API using template-based messaging.

## 📁 Files

1. **`lib/sms.ts`** - Sweego API integration with template support
2. **`app/api/sms/test/route.ts`** - Test endpoint for SMS sending
3. **`app/api/cron/send-reminders/route.ts`** - Automated cron job for reminders
4. **`env.example`** - Environment configuration for Sweego

## 🚀 Configuration

### 1. Set up Sweego API credentials

Add your Sweego credentials to `.env.local`:

```env
SWEEGO_API_KEY="your-sweego-api-key"
SWEEGO_TEMPLATE_ID="97775950-fe78-4b1b-98cd-13646067b704"
SWEEGO_SENDER_ID="ZUPdeCO"
CRON_SECRET="your-cron-secret"
```

### 2. Sweego Template Configuration

The system uses Sweego templates with these variables:
- **`jour`**: Day of the week (e.g., "lundi", "mardi")
- **`heure`**: Time (e.g., "14:00")

Your template in Sweego should use these variable names: `{{ jour }}` and `{{ heure }}`

### 3. No additional dependencies needed

The implementation uses the built-in `fetch` API, so no additional packages are required.

## 📋 SMS Structure

### Function signature

```typescript
sendSMS(to: string, variables: Record<string, string>): Promise<Response>
```

### Parameters
- `to`: Phone number with country code (e.g., "+33612345678")
- `variables`: Object with template variables (e.g., `{ jour: "lundi", heure: "14:00" }`)

### Return value

```typescript
{
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
}
```

## 🧪 Testing

The test endpoint `/api/sms/test` is ready to use:

```bash
curl -X POST http://localhost:3000/api/sms/test \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33612345678"}'
```

## 📊 Usage in cron job

The cron job in `app/api/cron/send-reminders/route.ts` automatically sends reminders:

```typescript
await sendSMS(student.phone, {
  jour: "lundi",
  heure: "14:00"
});
```

The cron job runs every 5 minutes and sends SMS to students whose sessions start within the configured time window (default: 15 minutes before).

## 🔐 Environment Variables

Required environment variables:
- `SWEEGO_API_KEY`: Your Sweego API key
- `SWEEGO_TEMPLATE_ID`: Your Sweego template ID (default: `97775950-fe78-4b1b-98cd-13646067b704`)
- `CRON_SECRET`: Secret for securing the cron endpoint
- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: NextAuth secret

## ✅ Configured and Ready!

The SMS system is now fully integrated with Sweego and ready to use. Just add your API key to start sending SMS!
