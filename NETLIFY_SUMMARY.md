# Quick Netlify Deployment Summary

## ✅ What Will Work on Netlify

1. **Your Next.js app** - Deploys normally
2. **Database (Neon)** - Works perfectly
3. **SMS via Sweego** - API calls work fine
4. **Authentication** - NextAuth works
5. **All your routes and pages** - Everything works

## ⚠️ ONE THING YOU NEED TO FIX

### The Cron Job Problem

Netlify **does NOT support cron jobs** like Vercel does. 

**Current situation:**
- Your `vercel.json` sets up a cron that runs every 5 minutes
- This cron sends SMS reminders to students
- Netlify can't run this automatically

**Solution:** Use an external free service

### Quick Setup (5 minutes)

1. Go to https://cron-job.org (free account)
2. Click "CREATE CRONJOB"
3. Set up like this:
   ```
   Title: ZUP de CO SMS Reminders
   
   Address (URL): 
   https://your-app-name.netlify.app/api/cron/send-reminders
   
   Schedule: */5 * * * *  (every 5 minutes)
   
   Request method: GET
   
   Header 1:
     Key: Authorization
     Value: Bearer YOUR_CRON_SECRET
   ```
4. Replace `YOUR_CRON_SECRET` with the value from your `.env.local`
5. Save and activate

That's it! Now your SMS reminders will work.

## 📝 Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" > "Import an existing project"
   - Select your repository

3. **Set environment variables**
   - Go to Site settings > Environment variables
   - Add all variables from your `.env.local`:
     ```
     DATABASE_URL
     AUTH_SECRET
     NEXTAUTH_URL
     CRON_SECRET
     SWEEGO_API_KEY
     SWEEGO_TEMPLATE_ID
     SWEEGO_SENDER_ID
     ```

4. **Deploy**
   - Netlify auto-deploys on push
   - Wait for build to complete

5. **Set up cron job** (see instructions above)

## 🎯 Alternative: Use Vercel Instead

If you want **zero setup** for cron jobs:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd zupsms
   vercel
   ```

3. That's it! Cron jobs work automatically.

The `vercel.json` file in your project already has the cron configured.

## 🧪 Test Your Deployment

After deploying, test with:

```bash
# Test SMS sending
curl -X POST https://your-site.netlify.app/api/sms/test \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33612345678"}'

# Test cron (should return 401 without auth)
curl https://your-site.netlify.app/api/cron/send-reminders

# Test with auth
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-site.netlify.app/api/cron/send-reminders
```

## 📊 What You Need in Netlify Dashboard

### Build Settings (auto-detected):
- Build command: `npm run build`
- Publish directory: `.next`

### Environment Variables (you must add manually):
- `DATABASE_URL` - Your Neon database URL
- `AUTH_SECRET` - Same as local (123123123)
- `NEXTAUTH_URL` - `https://your-app.netlify.app`
- `CRON_SECRET` - Same as local
- `SWEEGO_API_KEY` - Your Sweego API key
- `SWEEGO_TEMPLATE_ID` - Your template ID
- `SWEEGO_SENDER_ID` - ZUPdeCO

## ✅ Final Checklist

- [ ] Deploy to Netlify
- [ ] Add all environment variables
- [ ] Set up cron-job.org external trigger
- [ ] Test SMS sending works
- [ ] Verify cron triggers SMS reminders
- [ ] Done! 🎉

**Recommendation:** If you want the easiest deployment with zero cron setup, use **Vercel**. It handles everything automatically.

