# Post Scheduler Documentation

> **Automatic Post Publishing System**
> Schedule posts for future publication with automated publishing

## 📋 Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Setup Instructions](#setup-instructions)
4. [Usage Guide](#usage-guide)
5. [API Reference](#api-reference)
6. [Cron Job Configuration](#cron-job-configuration)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Post Scheduler allows you to schedule blog posts to be automatically published at a specific date and time in the future. This is useful for:

- **Content Planning** - Plan your content calendar in advance
- **Time Zone Publishing** - Publish when your audience is most active
- **Consistency** - Maintain regular publishing schedule even when away
- **Batch Creation** - Write multiple posts and schedule them over time

### Key Features

✅ Schedule posts for any future date/time
✅ View all scheduled posts in admin panel
✅ Manually trigger scheduler for immediate publishing
✅ Cancel or reschedule posts
✅ Automatic publishing via cron job
✅ Secure API with token authentication

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                   POST SCHEDULING FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. CREATE POST
   └─► Author creates post as "Draft"
       └─► Sets "scheduledAt" date/time
           └─► Post saved to database

2. SCHEDULER RUNS (Every 5 minutes via cron)
   └─► Queries database for posts where:
       • status = "draft"
       • scheduledAt IS NOT NULL
       • scheduledAt <= NOW()

3. AUTO-PUBLISH
   └─► For each post found:
       • Set status = "published"
       • Set publishedAt = NOW()
       • Post becomes live on site

4. USERS SEE POST
   └─► Published posts appear on blog
```

---

## Setup Instructions

### 1. Database Schema

The `scheduledAt` field has been added to the posts table:

```typescript
// src/db/schema/posts.ts
scheduledAt: timestamp('scheduled_at'), // When to auto-publish
```

### 2. Environment Variables

Add the scheduler token to your `.env` file:

```bash
# Scheduler API Token (for cron job authentication)
SCHEDULER_TOKEN=your-secure-random-token-here
```

**Generate a secure token:**

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

### 3. Database Migration

Push the schema changes to your database:

```bash
npm run db:push
```

Or generate a migration:

```bash
npm run db:generate
npm run db:migrate
```

---

## Usage Guide

### For Content Authors

#### Schedule a New Post

1. Go to **Admin → Posts → New Post**
2. Fill in post details (title, content, etc.)
3. Set **Status** to "Draft"
4. Set **Schedule For** date and time
5. Click **Save**

The post will automatically publish at the scheduled time.

#### View Scheduled Posts

1. Go to **Admin → Scheduled**
2. See all posts with scheduled publish dates
3. See countdown timer for each post

#### Cancel Schedule

1. Go to **Admin → Scheduled**
2. Find the post
3. Click **Cancel Schedule**
4. Post remains as draft but won't auto-publish

#### Reschedule Post

1. Go to **Admin → Posts**
2. Edit the scheduled post
3. Change the **Schedule For** date/time
4. Save changes

---

## API Reference

### POST /api/scheduler/publish

Publishes all posts that are due for publishing.

**Authentication:**
```bash
Authorization: Bearer YOUR_SCHEDULER_TOKEN
```

**Response:**
```json
{
  "success": true,
  "publishedCount": 2,
  "publishedPosts": [
    { "id": "uuid", "title": "Post Title" }
  ],
  "message": "Successfully published 2 post(s)"
}
```

**Example cURL:**
```bash
curl -X POST https://yoursite.com/api/scheduler/publish \
  -H "Authorization: Bearer your-token-here"
```

### GET /api/scheduler/publish

Manual trigger for admin users (requires authentication).

**Response:** Same as POST

---

## Cron Job Configuration

### Option 1: Vercel Cron Jobs

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/scheduler/publish",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes.

### Option 2: Railway Cron Jobs

Add to `railway.json`:

```json
{
  "crons": [
    {
      "schedule": "*/5 * * * *",
      "command": "curl -X POST https://yoursite.com/api/scheduler/publish -H 'Authorization: Bearer ${SCHEDULER_TOKEN}'"
    }
  ]
}
```

### Option 3: External Cron Service

Use a service like:
- **cron-job.org** (free, reliable)
- **EasyCron**
- **Uptime Robot** (as a side benefit of health checks)

**Setup:**
1. Create account at cron-job.org
2. Add new cron job:
   - URL: `https://yoursite.com/api/scheduler/publish`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_TOKEN`
   - Schedule: Every 5 minutes (`*/5 * * * *`)

### Option 4: GitHub Actions

Create `.github/workflows/scheduler.yml`:

```yaml
name: Post Scheduler

on:
  schedule:
    # Run every 5 minutes
    - cron: '*/5 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  publish-posts:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Scheduler
        run: |
          curl -X POST ${{ secrets.SITE_URL }}/api/scheduler/publish \
            -H "Authorization: Bearer ${{ secrets.SCHEDULER_TOKEN }}"
```

Add secrets to your GitHub repository:
- `SITE_URL`: Your site URL
- `SCHEDULER_TOKEN`: Your scheduler token

### Option 5: Linux Crontab

On your server, add to crontab:

```bash
# Edit crontab
crontab -e

# Add this line (runs every 5 minutes)
*/5 * * * * curl -X POST https://yoursite.com/api/scheduler/publish -H "Authorization: Bearer YOUR_TOKEN" >> /var/log/scheduler.log 2>&1
```

---

## Cron Schedule Examples

```bash
# Every 5 minutes
*/5 * * * *

# Every 15 minutes
*/15 * * * *

# Every hour at minute 0
0 * * * *

# Every day at 9:00 AM
0 9 * * *

# Every hour between 9 AM and 5 PM
0 9-17 * * *
```

**Test your cron expressions:** [crontab.guru](https://crontab.guru)

---

## Manual Testing

### 1. Create Test Post

```bash
# Via API
curl -X POST https://yoursite.com/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Scheduled Post",
    "content": "This post is scheduled",
    "status": "draft",
    "scheduledAt": "2025-11-08T15:00:00Z"
  }'
```

### 2. Trigger Scheduler Manually

Via Admin Panel:
1. Go to **Admin → Scheduled**
2. Click **"Run Scheduler Now"** button

Via API:
```bash
curl -X GET https://yoursite.com/api/scheduler/publish \
  -H "Authorization: Bearer YOUR_ADMIN_SESSION"
```

Via cURL (with scheduler token):
```bash
curl -X POST https://yoursite.com/api/scheduler/publish \
  -H "Authorization: Bearer YOUR_SCHEDULER_TOKEN"
```

---

## Troubleshooting

### Posts Not Publishing

**Check 1: Verify scheduledAt date**
```sql
SELECT id, title, status, scheduled_at
FROM posts
WHERE scheduled_at IS NOT NULL;
```

**Check 2: Run scheduler manually**
```bash
curl -X POST https://yoursite.com/api/scheduler/publish \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Check 3: Check cron job logs**
- Vercel: Check function logs in Vercel dashboard
- Railway: Check deployment logs
- Linux: Check `/var/log/scheduler.log`

**Check 4: Verify token**
```bash
# Should return 401 Unauthorized
curl -X POST https://yoursite.com/api/scheduler/publish

# Should return 200 OK
curl -X POST https://yoursite.com/api/scheduler/publish \
  -H "Authorization: Bearer YOUR_CORRECT_TOKEN"
```

### Scheduler Running But Not Publishing

**Check database query:**
```sql
-- Posts that should be published
SELECT id, title, status, scheduled_at
FROM posts
WHERE status = 'draft'
  AND scheduled_at IS NOT NULL
  AND scheduled_at <= NOW();
```

**Check post status:**
- Ensure post status is "draft" (not "published" or "archived")
- Ensure scheduledAt is in the past
- Ensure scheduledAt is not NULL

### Cron Job Not Running

**Vercel:**
- Check Vercel dashboard → Your Project → Cron Jobs
- Verify `vercel.json` is committed to repository
- Check function logs for errors

**GitHub Actions:**
- Check Actions tab in repository
- Verify secrets are configured
- Check workflow run logs

**External Service:**
- Check service dashboard (cron-job.org, etc.)
- Verify URL is correct
- Check execution history

---

## Best Practices

### 1. Use Reasonable Frequency

```bash
# ✅ Good: Every 5-15 minutes
*/5 * * * *   # Posts publish within 5 minutes of scheduled time

# ⚠️  Too Frequent: Every minute (unnecessary)
* * * * *

# ❌ Too Infrequent: Once per day (poor UX)
0 9 * * *     # Posts only publish once a day
```

### 2. Set Scheduler Token

Always use a secure token to prevent unauthorized access:

```bash
# .env
SCHEDULER_TOKEN=a8f7e2c9b4d1f3e5a6c8b9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
```

### 3. Monitor Scheduler

Set up monitoring/alerts:
- Dead Man's Snitch (ping service)
- Uptime Robot
- Sentry error tracking

### 4. Time Zones

Always use UTC for scheduledAt to avoid confusion:

```javascript
// ❌ Wrong: Local time
scheduledAt: new Date('2025-11-08 15:00:00')

// ✅ Correct: UTC
scheduledAt: new Date('2025-11-08T15:00:00Z')
```

### 5. Backup Strategy

Before auto-publishing:
- Preview posts to ensure they look correct
- Test on staging environment
- Keep drafts backed up

---

## Database Query Examples

### View All Scheduled Posts
```sql
SELECT id, title, scheduled_at, created_at
FROM posts
WHERE status = 'draft'
  AND scheduled_at IS NOT NULL
ORDER BY scheduled_at ASC;
```

### Posts Due for Publishing
```sql
SELECT id, title, scheduled_at
FROM posts
WHERE status = 'draft'
  AND scheduled_at IS NOT NULL
  AND scheduled_at <= NOW();
```

### Recently Published (via scheduler)
```sql
SELECT id, title, published_at, scheduled_at
FROM posts
WHERE status = 'published'
  AND scheduled_at IS NOT NULL
  AND published_at >= scheduled_at - INTERVAL '10 minutes'
ORDER BY published_at DESC
LIMIT 10;
```

---

## Support

### Resources

- [Cron Expression Guide](https://crontab.guru)
- [Vercel Cron Jobs Docs](https://vercel.com/docs/cron-jobs)
- [GitHub Actions Schedule Docs](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)

### Common Questions

**Q: Can I schedule posts for past dates?**
A: Yes, but they will be published immediately when the scheduler runs.

**Q: What happens if cron fails?**
A: Posts will publish on the next successful run. Set up monitoring to catch failures.

**Q: Can I schedule more than one post for the same time?**
A: Yes, all posts scheduled for that time will be published together.

**Q: Will scheduling work without a cron job?**
A: No, you must set up a cron job or manually trigger the scheduler from the admin panel.

---

**Last Updated:** 2025-11-08
**Version:** 1.0
