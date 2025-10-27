# Quick Setup Guide

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Neon database created
- [ ] Sweego account with API key
- [ ] Git installed

## Step-by-Step Setup

### 1. Get Neon Database Connection String

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:pass@host.neon.tech/dbname`)

### 2. Get Sweego Credentials

1. Go to [app.sweego.io](https://app.sweego.io)
2. Sign up or log in
3. Copy your API key from the dashboard
4. Configure your sender ID (brand name)

### 3. Configure Environment

Create `.env.local` in the project root:

```env
DATABASE_URL=postgresql://your_neon_connection_string_here
NEXTAUTH_SECRET=run_this_command_to_generate: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
SWEEGO_API_KEY=your_sweego_api_key
SWEEGO_SENDER_ID=YourBrand
CRON_SECRET=any_random_secret_string
```

### 4. Install & Setup Database

```bash
# Install dependencies
npm install

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with test data
npm run db:seed
```

### 5. Start Development

```bash
npm run dev
```

Visit: http://localhost:3000

**Login Credentials:**
- Email: `coordinator@zupsms.com`
- Password: `coordinator123`

## Deployment to Vercel

### Quick Deploy

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Vercel Setup

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add all environment variables from `.env.local`
5. Deploy

### Important: Update NEXTAUTH_URL

After deployment, update the environment variable in Vercel:

```
NEXTAUTH_URL=https://your-app.vercel.app
```

## Testing the App

### Test Session Management
1. Login at `/login`
2. Go to "Sessions"
3. Toggle a student's active status
4. Search for students by name or phone

### Test SMS Settings
1. Go to "SMS Settings"
2. Modify the template
3. Enter your phone number
4. Click "Send Test SMS"
5. Save settings

### Test Automated Cron (Production Only)

Cron jobs only work on Vercel. To manually trigger:

```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/send-reminders
```

## Common Issues

### "DATABASE_URL is not set"
- Make sure `.env.local` exists
- Restart dev server after creating `.env.local`

### "Sweego not configured"
- Verify SWEEGO_API_KEY and SWEEGO_SENDER_ID environment variables
- Check credentials in Sweego dashboard

### SMS not sending
- Phone numbers must be in international format (+33...)
- Check Sweego account has sufficient balance
- View Sweego dashboard for error messages and logs

### Can't login
- Make sure you ran `npm run db:seed`
- Check database connection

## Database Management

### View Database
```bash
npm run db:studio
```

This opens Drizzle Studio to browse your data.

### Reset Database

If you need to start fresh:

1. Drop tables in Neon console
2. Re-run migrations: `npm run db:migrate`
3. Re-seed: `npm run db:seed`

## Production Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] NEXTAUTH_URL points to production domain
- [ ] Sweego account verified and funded
- [ ] Database backups enabled in Neon
- [ ] Change default coordinator password
- [ ] Test cron job manually
- [ ] Review SMS template

## Need Help?

Check the main README.md for detailed documentation.

