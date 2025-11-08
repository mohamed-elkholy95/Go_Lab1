# Pythoughts Deployment Guide

Complete guide for deploying your Pythoughts blogging platform to production.

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ PostgreSQL 17 database (production instance)
- ✅ Resend API account (for email)
- ✅ Git repository (for deployment)
- ✅ Domain name (optional but recommended)

---

## 🚀 Deployment Platforms

Pythoughts can be deployed to any platform that supports Node.js and PostgreSQL. Recommended platforms:

### Recommended: Vercel + Neon Database

**Best for:** Quick deployment with zero config
**Cost:** Free tier available

### Alternative: Railway

**Best for:** All-in-one deployment (app + database)
**Cost:** $5/month minimum

### Alternative: Render + Supabase

**Best for:** Budget-friendly production deployment
**Cost:** Free tier available

---

## 📦 Pre-Deployment Checklist

### 1. Environment Variables

Create a `.env.production` file with:

```env
# Database (Production PostgreSQL URL)
DATABASE_URL=postgresql://user:password@host:5432/pythoughts

# Authentication (Generate a secure 32+ character secret)
AUTH_SECRET=your-production-secret-min-32-characters-long

# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Site Configuration
SITE_URL=https://yourdomain.com
PUBLIC_SITE_NAME=Pythoughts

# Environment
NODE_ENV=production
```

### 2. Build Check

Test your production build locally:

```bash
npm run build
npm run preview
```

Visit `http://localhost:4321` to verify everything works.

### 3. Database Migration

Run migrations on your production database:

```bash
# Using drizzle-kit
npm run db:push

# Or generate and run migrations
npm run db:generate
npm run db:migrate
```

---

## 🌐 Deployment: Vercel + Neon Database

### Step 1: Setup Neon Database

1. Go to [Neon.tech](https://neon.tech) and create account
2. Create new project: "Pythoughts Production"
3. Copy connection string from dashboard
4. Add `?sslmode=require` to the connection string

**Example:**
```
postgresql://user:pass@host.neon.tech/pythoughts?sslmode=require
```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

4. **Set Environment Variables:**

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add each variable from `.env.production`

5. **Trigger Deployment:**
```bash
vercel --prod
```

### Step 3: Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `SITE_URL` environment variable

### Step 4: Initialize Database

Once deployed, run migrations:

```bash
# SSH into your deployment or use Neon SQL Editor
# Run the SQL from drizzle/migrations
```

Or use Drizzle Studio:

```bash
npm run db:studio
```

### Step 5: Create Admin User

You'll need to manually create the first admin user in the database:

```sql
INSERT INTO users (
  id,
  email,
  username,
  name,
  password_hash,
  role,
  email_verified
) VALUES (
  gen_random_uuid(),
  'admin@yourdomain.com',
  'admin',
  'Admin User',
  '$2a$10$...', -- Use bcrypt to hash your password
  'admin',
  true
);
```

Or register normally and update via SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 🚂 Deployment: Railway

### Step 1: Create Railway Account

Go to [Railway.app](https://railway.app) and sign up

### Step 2: Create New Project

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init
```

### Step 3: Add PostgreSQL

```bash
# Add PostgreSQL service
railway add postgresql

# Get database URL
railway variables
```

Copy the `DATABASE_URL` variable.

### Step 4: Configure Environment

```bash
# Set environment variables
railway variables set AUTH_SECRET=your-secret-here
railway variables set RESEND_API_KEY=re_xxx
railway variables set RESEND_FROM_EMAIL=noreply@domain.com
railway variables set SITE_URL=https://your-app.railway.app
railway variables set PUBLIC_SITE_NAME=Pythoughts
railway variables set NODE_ENV=production
```

### Step 5: Deploy

```bash
# Deploy
railway up
```

Railway will automatically:
- Install dependencies
- Run build
- Start the application

### Step 6: Custom Domain (Optional)

1. Go to Railway Dashboard → Your Project → Settings
2. Add custom domain
3. Update DNS records
4. Update `SITE_URL` environment variable

---

## 🎨 Deployment: Render + Supabase

### Step 1: Setup Supabase Database

1. Go to [Supabase.com](https://supabase.com)
2. Create new project
3. Go to Project Settings → Database
4. Copy connection string (Session mode)
5. Enable `connection pooling` for better performance

### Step 2: Create Render Web Service

1. Go to [Render.com](https://render.com)
2. New → Web Service
3. Connect your Git repository
4. Configure:
   - **Name:** pythoughts
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node ./dist/server/entry.mjs`

### Step 3: Environment Variables

Add in Render Dashboard:

```
DATABASE_URL=your-supabase-connection-string
AUTH_SECRET=your-secret-here
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@domain.com
SITE_URL=https://pythoughts.onrender.com
PUBLIC_SITE_NAME=Pythoughts
NODE_ENV=production
```

### Step 4: Deploy

Click "Create Web Service" and Render will deploy automatically.

---

## 🔒 Post-Deployment Security

### 1. Secure Your Database

- ✅ Enable SSL connections
- ✅ Use connection pooling
- ✅ Restrict IP access (if possible)
- ✅ Regular backups

### 2. Configure CORS (if needed)

In `astro.config.mjs`:

```js
export default defineConfig({
  // ... other config
  server: {
    headers: {
      'Access-Control-Allow-Origin': 'https://yourdomain.com',
    },
  },
});
```

### 3. Enable HTTPS

All recommended platforms provide HTTPS by default.

### 4. Setup Email Domain

For better deliverability with Resend:

1. Add your domain to Resend
2. Verify DNS records (SPF, DKIM, DMARC)
3. Update `RESEND_FROM_EMAIL` to use your domain

---

## 📊 Monitoring & Maintenance

### Database Backups

**Neon:**
- Automatic backups included
- Point-in-time recovery available

**Railway:**
```bash
railway run pg_dump > backup.sql
```

**Supabase:**
- Automatic daily backups
- Manual backups in dashboard

### Performance Monitoring

Add analytics (optional):

```bash
npm install @vercel/analytics
```

In `src/layouts/BaseLayout.astro`:

```astro
---
import { Analytics } from '@vercel/analytics/astro';
---

<html>
  <!-- ... -->
  <body>
    <slot />
    <Analytics />
  </body>
</html>
```

### Log Monitoring

All platforms provide built-in logging:

- **Vercel:** Dashboard → Your Project → Logs
- **Railway:** Dashboard → Your Project → Deployments → Logs
- **Render:** Dashboard → Your Service → Logs

---

## 🔄 CI/CD Setup

### Automatic Deployments

**Vercel & Render:**
- Automatically deploy on `git push` to main branch
- Preview deployments for pull requests

**Railway:**
- Automatic deployments on push
- Configure in `railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start"
```

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test # if you have tests
      # Add deployment steps for your platform
```

---

## 🐛 Troubleshooting

### Build Failures

**Error:** `Module not found`
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error:** `Database connection failed`
- Check `DATABASE_URL` format
- Ensure database is accessible
- Check SSL requirements

### Runtime Errors

**500 Internal Server Error**
- Check environment variables
- Review platform logs
- Verify database migrations

**Email not sending**
- Verify Resend API key
- Check email domain configuration
- Review Resend dashboard logs

---

## 📝 Deployment Checklist

Before going live:

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Admin user created
- [ ] Custom domain configured (if applicable)
- [ ] SSL/HTTPS enabled
- [ ] Email sending tested
- [ ] Authentication tested
- [ ] Post creation tested
- [ ] Backup strategy in place
- [ ] Monitoring enabled

---

## 🎉 You're Live!

Your Pythoughts platform is now deployed!

**Next steps:**
1. Create your first blog post
2. Invite authors to join
3. Share your blog with the world!

**Need help?** Check the [README.md](README.md) or [PROGRESS.md](PROGRESS.md)

---

**Happy Blogging! 🚀**
