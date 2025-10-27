# 🚀 ZUPsms - Vercel Deployment Guide

## Prerequisites

Before deploying to Vercel, ensure you have:

1. ✅ A [Vercel account](https://vercel.com/signup)
2. ✅ A [Neon database](https://neon.tech) (PostgreSQL)
3. ✅ [Sweego account](https://app.sweego.io) (for SMS functionality - European GDPR-compliant)
4. ✅ Git repository with your code

## 📋 Pre-Deployment Checklist

### 1. Database Setup

**Create Neon Database:**
```bash
# 1. Go to https://neon.tech
# 2. Create a new project
# 3. Copy your DATABASE_URL (it looks like):
#    postgresql://username:password@host/database?sslmode=require
```

**Run Migrations:**
```bash
# Install dependencies
npm install

# Set DATABASE_URL in .env.local
echo "DATABASE_URL=your-database-url-here" > .env.local

# Run migrations
npm run db:migrate

# Optional: Seed initial data
npm run db:seed
```

### 2. Environment Variables

Create `.env.local` with all required variables:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth (generate with: openssl rand -base64 32)
AUTH_SECRET="your-generated-secret"

# Sweego (optional but recommended for SMS)
SWEEGO_API_KEY="your-sweego-api-key"
SWEEGO_SENDER_ID="YourBrand"
# Optional: SWEEGO_API_URL="https://api.sweego.io/v1"

# Production URL
NEXTAUTH_URL="https://your-app.vercel.app"
```

### 3. Test Local Build

```bash
# Test that the build works locally
npm run build

# If successful, test the production build
npm run start
```

## 🔧 Vercel Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `zupsms` (if in subdirectory, otherwise leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   
   Click "Environment Variables" and add each variable:
   
   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `DATABASE_URL` | Your Neon connection string | Production, Preview, Development |
   | `AUTH_SECRET` | Generate with `openssl rand -base64 32` | Production, Preview, Development |
   | `SWEEGO_API_KEY` | From Sweego Dashboard | Production, Preview |
   | `SWEEGO_SENDER_ID` | Your brand/sender name | Production, Preview |
   | `NEXTAUTH_URL` | Your Vercel domain | Production |

   **Important**: For `NEXTAUTH_URL`, use:
   - Production: `https://your-app.vercel.app`
   - You can leave it empty for Preview/Development (auto-detected)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-app.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 🗄️ Database Configuration

### Initial Database Setup

After first deployment, you need to run migrations on your Neon database:

**Option 1: Run locally (pointing to production DB)**
```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-db-url"

# Run migrations
npm run db:migrate

# Optional: Seed data
npm run db:seed
```

**Option 2: Use Vercel CLI**
```bash
# Pull environment variables
vercel env pull .env.production

# Run migrations
npm run db:migrate
```

### Database Migrations Included

The following migrations will be applied:
- ✅ `0000_material_shinko_yamashiro.sql` - Initial schema (users, students, settings, sms_logs)
- ✅ `0001_giant_mandarin.sql` - Tutors table and tutor assignments
- ✅ `0002_optimal_hellion.sql` - Message templates table

## 🔐 Authentication Setup

### Create Admin User

After database setup, create your first coordinator account:

```bash
# Connect to your database and run:
# (Replace with your actual credentials)

INSERT INTO users (email, password_hash)
VALUES ('admin@yourcompany.com', '$2a$10$hashedpasswordhere');
```

Or use the seed script:
```bash
npm run db:seed
```

Default credentials (if using seed):
- Email: `admin@example.com`
- Password: `password123`

**⚠️ IMPORTANT**: Change these credentials immediately after first login!

## 📱 Sweego SMS Configuration

### Get Sweego Credentials

1. Sign up at [sweego.io](https://app.sweego.io)
2. Get your API key from the dashboard
3. Configure your sender ID (brand name)
4. Add credentials to Vercel environment variables

**Why Sweego?**
- 🇪🇺 100% European and GDPR compliant
- ⚡ Simple REST API
- 💰 Competitive pricing
- 📊 Comprehensive statistics and logs

### Test SMS Functionality

After deployment:
1. Go to `https://your-app.vercel.app/sms-settings`
2. Click "Tester" tab
3. Enter your phone number
4. Send a test SMS

## ⚡ Cron Jobs (Automatic SMS Reminders)

The app includes a cron job for sending automatic SMS reminders.

### Vercel Cron Configuration

The `vercel.json` file is already configured:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes and sends SMS reminders based on:
- Active students
- Session start times
- SMS offset settings (default: 15 minutes before)

### Enable Cron Jobs

Cron jobs are automatically enabled on Vercel's Pro plan or higher.
For Hobby plan, the endpoint is accessible but not automatically triggered.

**Manual trigger** (for testing):
```bash
curl https://your-app.vercel.app/api/cron/send-reminders
```

## 🔍 Post-Deployment Checks

### 1. Verify Database Connection
```bash
# Check if database is accessible
curl https://your-app.vercel.app/api/dashboard/stats
```

### 2. Test Authentication
- Visit `https://your-app.vercel.app/login`
- Try logging in with your admin credentials
- Should redirect to dashboard

### 3. Test Features
- ✅ Dashboard loads with statistics
- ✅ Can view/create students
- ✅ Can view/create tutors
- ✅ Can manage SMS templates
- ✅ Can view sessions
- ✅ SMS test works (if Sweego configured)

### 4. Check Logs
```bash
# View deployment logs
vercel logs your-app.vercel.app

# Or in Vercel dashboard:
# Project → Deployments → Click deployment → View Function Logs
```

## 🐛 Troubleshooting

### Build Fails

**Error: "DATABASE_URL is not set"**
```bash
# Solution: Add DATABASE_URL to Vercel environment variables
# Make sure it's added for all environments
```

**Error: TypeScript errors**
```bash
# Run locally to see errors
npm run build

# Fix errors and redeploy
```

### Authentication Issues

**"AUTH_SECRET not configured"**
```bash
# Generate new secret:
openssl rand -base64 32

# Add to Vercel environment variables
```

**"NEXTAUTH_URL must be provided"**
```bash
# Add to Vercel environment variables:
NEXTAUTH_URL=https://your-app.vercel.app
```

### Database Connection Issues

**"Connection timeout"**
- Check DATABASE_URL format
- Ensure Neon project is not paused
- Verify connection string has `?sslmode=require`

**"Relation does not exist"**
- Migrations not run
- Run `npm run db:migrate` with production DATABASE_URL

### SMS Not Sending

**"Sweego not configured"**
- Add SWEEGO_API_KEY and SWEEGO_SENDER_ID environment variables
- Verify credentials are correct
- Check Sweego account has sufficient balance

## 🔄 Continuous Deployment

Vercel automatically deploys on every push to your connected Git repository:

- **Push to `main`**: Deploys to production
- **Push to other branches**: Creates preview deployment
- **Pull requests**: Creates preview with unique URL

## 📊 Monitoring & Analytics

### Vercel Analytics (Optional)

Enable Vercel Analytics for insights:
1. Go to Project Settings
2. Click "Analytics"
3. Enable analytics
4. Add `@vercel/analytics` package

### Database Monitoring

Monitor your Neon database:
1. Go to [Neon Dashboard](https://console.neon.tech)
2. View connection metrics
3. Check query performance
4. Monitor storage usage

## 🔒 Security Recommendations

1. **Change Default Credentials**: Immediately after first login
2. **Rotate AUTH_SECRET**: Every 90 days
3. **Monitor Logs**: Check for suspicious activity
4. **Enable 2FA**: On Vercel and Neon accounts
5. **Review Access**: Regular audit of user accounts
6. **Keep Dependencies Updated**: Run `npm update` regularly

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Sweego Documentation](https://sweego.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)

## 🎉 Success!

If everything is configured correctly, your ZUPsms application should be:

- ✅ Deployed and accessible
- ✅ Database connected and migrated
- ✅ Authentication working
- ✅ SMS functionality operational
- ✅ Cron jobs scheduled
- ✅ Ready for production use

**Access your app**: `https://your-app.vercel.app`

## 💡 Quick Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Pull environment variables
vercel env pull

# List deployments
vercel ls

# Remove deployment
vercel rm deployment-url
```

## 🆘 Need Help?

If you encounter issues:
1. Check [Vercel Status](https://www.vercel-status.com)
2. Review [deployment logs](https://vercel.com/docs/deployments/logs)
3. Check [Neon Status](https://neonstatus.com)
4. Review this deployment guide again

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Status**: Production Ready ✅

