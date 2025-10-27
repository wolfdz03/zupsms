# Deployment Guide for Netlify

## ✅ What Works Out of the Box

- **Application deployment**: Next.js app
- **Environment variables**: Set via Netlify dashboard
- **Database**: Neon PostgreSQL (works everywhere)
- **SMS API**: Sweego API (works everywhere)
- **Authentication**: NextAuth works on Netlify

## ⚠️ Critical Issue: Cron Jobs

**Netlify does NOT support cron jobs** like Vercel does. You need to set up an external cron service.

## 🔧 Setup Instructions

### 1. Deploy to Netlify

1. **Connect your repository**
   - Go to https://app.netlify.com
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub/GitLab/Bitbucket repository

2. **Build settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 20

### 2. Environment Variables

Go to **Site settings** > **Environment variables** and add:

```env
DATABASE_URL=your-neon-database-url
AUTH_SECRET=your-auth-secret
NEXTAUTH_URL=https://your-site.netlify.app
CRON_SECRET=your-cron-secret
SWEEGO_API_KEY=your-sweego-api-key
SWEEGO_TEMPLATE_ID=your-template-id
SWEEGO_SENDER_ID=ZUPdeCO
```

### 3. Set Up External Cron Service

Since Netlify doesn't support cron jobs, use one of these services:

#### Option A: cron-job.org (Free)

1. Go to https://cron-job.org
2. Create a free account
3. Add a new cron job:
   - **URL**: `https://your-site.netlify.app/api/cron/send-reminders`
   - **Method**: GET
   - **Schedule**: `*/5 * * * *` (every 5 minutes)
   - **Headers**: 
     - Key: `Authorization`
     - Value: `Bearer YOUR_CRON_SECRET`
4. Test the cron job

#### Option B: easycron.com (Free tier available)

1. Go to https://www.easycron.com
2. Create account
3. Add URL job with same settings as above

#### Option C: Zapier / Make.com (Automation tools)

Can trigger HTTP requests on schedule

### 4. Database Migrations

If deploying for the first time:

1. **Option A**: Run migrations locally and seed data
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

2. **Option B**: Add migration endpoint (temporary)
   Create `app/api/admin/migrate/route.ts` (remember to remove in production!)

## 🔐 Security Notes

### Cron Secret
The cron endpoint should be protected. Your `CRON_SECRET` in `.env.local` should be the same as what you use in the external cron service.

Current cron endpoint: `app/api/cron/send-reminders/route.ts`
It checks for: `Authorization: Bearer ${CRON_SECRET}`

## 📋 Deployment Checklist

- [ ] Deploy site to Netlify
- [ ] Set all environment variables in Netlify dashboard
- [ ] Run database migrations (locally or via endpoint)
- [ ] Set up external cron service with correct URL and auth header
- [ ] Test SMS sending manually via `/api/sms/test`
- [ ] Verify cron job triggers correctly
- [ ] Monitor logs for any errors

## 🧪 Testing After Deployment

1. **Test SMS manually**:
   ```bash
   curl -X POST https://your-site.netlify.app/api/sms/test \
     -H "Content-Type: application/json" \
     -d '{"phone": "+33612345678"}'
   ```

2. **Test cron endpoint** (should return 401 without auth):
   ```bash
   curl https://your-site.netlify.app/api/cron/send-reminders
   ```

3. **Test with auth**:
   ```bash
   curl https://your-site.netlify.app/api/cron/send-reminders \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

## 📊 Monitoring

- Check Netlify function logs for errors
- Monitor SMS logs in your database
- Check Sweego dashboard for SMS delivery status

## 🆘 Troubleshooting

**Cron job not running?**
- Check the cron service has the correct URL
- Verify the `Authorization` header is set
- Check Netlify function logs

**SMS not sending?**
- Verify `SWEEGO_API_KEY` is set correctly in Netlify
- Check Netlify function logs for detailed errors
- Test manually with `/api/sms/test` endpoint

**Database connection issues?**
- Verify `DATABASE_URL` is correct (Neon URL)
- Check if Neon allows connections from Netlify's IPs

## 🎯 Alternative: Use Vercel

If you want native cron support, **Vercel is recommended** because:
- Built-in cron jobs (no external service needed)
- Better Next.js integration
- Free tier includes cron jobs

To deploy to Vercel instead:
```bash
npm i -g vercel
vercel
# Follow the prompts
```

The `vercel.json` file in your project will automatically set up cron jobs.

