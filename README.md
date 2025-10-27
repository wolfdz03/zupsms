# ZupSMS - Coordinator Dashboard

A minimal coordinator dashboard for managing weekly student sessions and automatically sending SMS reminders 15 minutes before scheduled sessions.

## 🚀 Features

- **Authentication**: Secure login for coordinators with NextAuth
- **Session Management**: View and manage students grouped by day of week
- **Toggle Active/Inactive**: Enable or disable SMS reminders per student
- **SMS Settings**: Customize reminder timing and message template
- **Test SMS**: Send test messages before going live
- **Automated Reminders**: Vercel cron job sends SMS 15 minutes before sessions
- **Activity Logs**: Track all sent SMS messages

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: Neon (PostgreSQL) + Drizzle ORM
- **Authentication**: NextAuth v5
- **SMS**: Sweego API (European GDPR-compliant)
- **Deployment**: Vercel

## 📋 Prerequisites

1. **Node.js** 18+ installed
2. **Neon Database** account ([neon.tech](https://neon.tech))
3. **Sweego** account ([sweego.io](https://app.sweego.io))
4. **Vercel** account for deployment

## 🏗️ Setup Instructions

### 1. Clone and Install

```bash
cd zupsms
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database - Get from Neon dashboard
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# NextAuth - Generate secret with: openssl rand -base64 32
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Sweego - Get from Sweego dashboard
SWEEGO_API_KEY=your_sweego_api_key
SWEEGO_SENDER_ID=YourBrand

# Cron Secret - Generate any random string
CRON_SECRET=your_random_secret_for_cron
```

### 3. Set Up Database

Generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

Seed the database with sample data:

```bash
npm run db:seed
```

This creates:
- 1 coordinator account: `coordinator@zupsms.com` / `coordinator123`
- 7 sample students across different days
- Default SMS settings

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Login
- Email: `coordinator@zupsms.com`
- Password: `coordinator123`

### Managing Sessions
1. Click "Sessions" from the home page
2. Use the search bar to filter students
3. Toggle the switch to activate/deactivate SMS reminders
4. Students are grouped by day (Monday-Sunday)

### SMS Settings
1. Click "SMS Settings" from the home page
2. Set reminder offset (default: 15 minutes)
3. Customize the SMS template with variables:
   - `{student_name}` - Student's full name
   - `{start_time}` - Session start time
   - `{day}` - Day of the week
4. Send a test SMS to verify
5. Save settings

### Automated Reminders

The system automatically sends SMS reminders using Vercel cron jobs:
- Runs every 5 minutes
- Checks for sessions starting in X minutes (based on offset setting)
- Sends SMS to active students only
- Logs all sent messages

## 🚀 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your repository
3. Add environment variables (same as `.env.local`)
4. Deploy

### 3. Configure Cron Authorization

In Vercel project settings:
1. Go to "Environment Variables"
2. Ensure `CRON_SECRET` is set
3. Cron jobs will automatically run based on `vercel.json` config

## 📁 Project Structure

```
zupsms/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth endpoints
│   │   ├── students/              # Student CRUD operations
│   │   ├── settings/              # SMS settings
│   │   ├── sms/test/              # Test SMS endpoint
│   │   └── cron/send-reminders/   # Automated reminder job
│   ├── login/                     # Login page
│   ├── sessions/                  # Sessions management
│   ├── sms-settings/              # SMS configuration
│   └── page.tsx                   # Home page
├── components/ui/                 # shadcn/ui components
├── db/
│   ├── schema.ts                  # Database schema
│   ├── index.ts                   # DB connection
│   ├── migrate.ts                 # Migration runner
│   └── seed.ts                    # Seed data
├── lib/
│   └── sweego.ts                  # Sweego SMS utilities
├── auth.ts                        # NextAuth config
├── middleware.ts                  # Route protection
└── vercel.json                    # Cron job config
```

## 🗃️ Database Schema

### users
- Coordinator authentication

### students
- Full name, phone, email
- Day of week (lundi-dimanche)
- Start time
- Active status

### settings
- SMS offset in minutes
- Message template
- Last updated timestamp

### sms_logs
- Track all sent messages
- Status (sent/failed)
- Timestamp

## 🔒 Security

- Protected routes with NextAuth middleware
- Password hashing with bcryptjs
- Cron endpoint secured with bearer token
- Environment variables for sensitive data

## 🐛 Troubleshooting

### SMS not sending
- Verify Sweego credentials in `.env.local`
- Check phone number format (international: +33...)
- View Sweego dashboard for error messages and logs

### Database connection issues
- Ensure DATABASE_URL is correct
- Check Neon dashboard for connection string
- Verify database is not paused

### Cron not running locally
- Cron jobs only work on Vercel
- Test manually: `curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/send-reminders`

## 📝 License

MIT

## 👨‍💻 Support

For issues or questions, please open a GitHub issue.
