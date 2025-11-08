# Pythoughts - Full-Stack Blogging Platform

A modern, full-featured blogging platform built with Astro, TypeScript, PostgreSQL, and Drizzle ORM. Features user authentication, database-driven content management, email functionality, and a comprehensive admin panel.

## 🚀 Features

- **Modern Tech Stack**: Astro 5, TypeScript, Tailwind CSS, PostgreSQL, Drizzle ORM
- **Authentication**: Better Auth integration with email verification and password reset
- **Content Management**: Full CRUD operations for posts, categories, and tags
- **Comments System**: Nested replies, moderation, real-time updates
- **Post Scheduling**: Schedule posts for automatic future publication with cron-based scheduler
- **Analytics Dashboard**: Comprehensive platform metrics, top posts, engagement tracking
- **Social Media Sharing**: One-click sharing to Twitter, Facebook, LinkedIn, Reddit, WhatsApp, Email
- **SEO Optimized**: Open Graph, Twitter Cards, structured data, sitemap, and RSS feed
- **User Roles**: Admin, Author, and User roles with role-based access control
- **Email Notifications**: Resend integration for transactional emails
- **Admin Panel**: Comprehensive dashboard for content, user, comment, and analytics management
- **Search**: Pagefind integration for fast static search with result highlighting
- **Navigation**: Global header with responsive mobile menu and user dropdown
- **Hybrid Rendering**: Static site generation + server-side rendering
- **Dark Mode**: Built-in dark mode support
- **Testing**: Vitest unit testing with coverage reporting
- **Type-Safe**: Full TypeScript support with Drizzle ORM
- **CI/CD Pipeline**: Automated testing, security scanning, and deployment
- **DORA Metrics**: Track deployment frequency, lead time, and performance
- **Git Hooks**: Pre-push validation with 8 automated quality checks

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 17
- npm or pnpm
- Resend API key (for email functionality)

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd Go_Lab1
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pythoughts

# Authentication
AUTH_SECRET=your-secret-key-here-min-32-characters-long

# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@pythoughts.com

# Site Configuration
SITE_URL=http://localhost:4321
PUBLIC_SITE_NAME=Pythoughts

# Post Scheduler (for cron job authentication)
SCHEDULER_TOKEN=your-secure-random-token-here
```

4. **Set up the database**

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Or push schema directly (development)
npm run db:push
```

5. **Start the development server**

```bash
npm run dev
```

The site will be available at `http://localhost:4321`

## 📁 Project Structure

```
src/
├── db/                          # Database layer
│   ├── schema/                  # Drizzle schema definitions
│   │   ├── users.ts             # User and email verification tables
│   │   ├── sessions.ts          # Session management
│   │   ├── posts.ts             # Blog posts
│   │   ├── categories.ts        # Categories, tags, and junctions
│   │   └── index.ts             # Schema exports
│   └── index.ts                 # Database connection
├── lib/                         # Shared utilities
│   ├── auth/                    # Authentication logic
│   │   ├── config.ts            # Better Auth configuration
│   │   └── utils.ts             # Auth helper functions
│   ├── email/                   # Email functionality
│   │   ├── client.ts            # Resend client setup
│   │   ├── templates.ts         # Email templates
│   │   └── utils.ts             # Email sending functions
│   ├── services/                # Business logic (TODO)
│   └── validations/             # Zod schemas (TODO)
├── layouts/                     # Astro layouts
│   └── BaseLayout.astro         # Base HTML layout
├── pages/                       # Routes
│   ├── api/                     # API endpoints
│   │   └── auth/                # Auth API routes
│   ├── auth/                    # Auth pages
│   │   ├── login.astro
│   │   ├── register.astro
│   │   └── verify-email.astro
│   ├── admin/                   # Admin panel (TODO)
│   ├── posts/                   # Blog posts (TODO)
│   ├── index.astro              # Homepage
│   └── unauthorized.astro       # 403 page
├── components/                  # Reusable components (TODO)
├── styles/                      # Global styles
│   └── global.css               # Tailwind + custom styles
├── middleware.ts                # Route protection
└── env.d.ts                     # TypeScript definitions
```

## 🗄️ Database Schema

### Core Tables

- **users**: User accounts with email, username, password, role, and profile info
- **sessions**: Active user sessions (Better Auth)
- **email_verifications**: Email verification tokens
- **posts**: Blog posts with markdown content, status, and metadata
- **comments**: User comments with nested replies support
- **categories**: Post categories
- **tags**: Post tags
- **post_categories**: Many-to-many relationship between posts and categories
- **post_tags**: Many-to-many relationship between posts and tags

## 🔐 Authentication

The platform uses **Better Auth** for authentication with the following features:

- Email/password authentication
- Email verification required
- Session-based authentication
- Password reset functionality
- Role-based access control (User, Author, Admin)

### Protected Routes

- `/admin/*` - Admin only
- `/posts/new`, `/posts/edit/*` - Authors and Admins
- `/settings` - Authenticated users

### Auth API Endpoints

All auth endpoints are handled by Better Auth at `/api/auth/*`:

- `POST /api/auth/sign-up/email` - Register new user
- `POST /api/auth/sign-in/email` - Login
- `GET /api/auth/session` - Get current session
- `POST /api/auth/sign-out` - Logout

## 📧 Email Integration

Uses **Resend** for transactional emails:

- Email verification on registration
- Welcome email after verification
- Password reset emails

Email templates are fully customizable in `src/lib/email/templates.ts`.

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Dark mode** support with class-based toggling
- **Typography plugin** for markdown content
- **Custom components** (buttons, inputs, cards)

## 📝 Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage

# Database
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:push          # Push schema (development)
npm run db:studio        # Open Drizzle Studio
```

## 🔐 Git Hooks - Pre-Push Validation

Automated validation system that runs before every push to ensure 100% safe commits.

### Features

- ✅ **8 Automated Checks** - TypeScript, linting, security, build, tests, secrets, dependencies, complexity
- ✅ **Fast Execution** - Typical run time: 1-4 minutes
- ✅ **Zero Broken Builds** - Catches errors before they reach GitHub
- ✅ **Security First** - Prevents vulnerable code and leaked secrets
- ✅ **Fully Configurable** - Enable/disable checks via `.githooks.config`

### Installation

```bash
# Install git hooks (one-time setup)
./scripts/install-hooks.sh
```

### Usage

Hooks run automatically before every push:

```bash
git push origin your-branch

# Output:
# ╔══════════════════════════════════════════╗
# ║      PRE-PUSH VALIDATION                 ║
# ╚══════════════════════════════════════════╝
# ▶ Running: TypeScript Type Checking
# ✓ TypeScript Type Checking passed
# ▶ Running: Security Vulnerability Scan
# ✓ Security Vulnerability Scan passed
# ... (more checks)
# ✓ ALL CHECKS PASSED ✓
```

### Validation Checks

| Check | Purpose | Blocks Push |
|-------|---------|-------------|
| **TypeScript** | Type errors | ✓ |
| **ESLint** | Code quality | ✓ |
| **Security Scan** | Vulnerabilities | ✓ (Critical only) |
| **Build** | Build errors | ✓ |
| **Dependencies** | Missing/broken deps | ✓ |
| **Tests** | Test failures | ✓ |
| **Secrets** | Leaked credentials | ✓ |
| **Complexity** | Code quality | ✗ (Info only) |

### Configuration

Edit `.githooks.config` to customize:

```bash
# Disable specific checks
ENABLE_BUILD_CHECK=false

# Allow skipping with --no-verify
ALLOW_SKIP=true
```

### Skipping Checks (Emergency Only)

```bash
# Skip ALL validation (not recommended)
git push --no-verify
```

See [GIT_HOOKS.md](GIT_HOOKS.md) for complete documentation.

## 📊 Analytics Dashboard

Access comprehensive platform metrics and insights at `/admin/analytics`.

### Key Metrics

- **Total Views** - Platform-wide post views with average per post
- **Published Posts** - Total published posts with 30-day growth
- **Total Comments** - User engagement metrics
- **Total Users** - Registered accounts

### Analytics Features

- 🏆 **Top Performing Posts** - Top 10 posts by views with author info
- ✍️ **Top Authors** - Top 5 authors by total views and post count
- 📅 **Recent Posts** - Last 7 days performance tracking
- 💬 **Most Discussed** - Posts with highest comment engagement
- 📈 **Performance Summary** - Average views, engagement rate, posts per author

All metrics update in real-time based on database queries.

## ⏰ Post Scheduling

Schedule posts for automatic publication at future dates.

### Features

- ⏰ **Schedule Posts** - Set specific date/time for auto-publishing
- 📋 **View Scheduled** - See all posts with scheduled publish dates at `/admin/scheduled`
- ▶️ **Manual Trigger** - Manually run scheduler from admin panel
- ❌ **Cancel/Reschedule** - Modify scheduled posts before publishing
- 🔄 **Automated Publishing** - Cron-based scheduler checks every 5 minutes

### Setup

1. **Set Scheduler Token** in `.env`:
   ```bash
   SCHEDULER_TOKEN=$(openssl rand -hex 32)
   ```

2. **Configure Cron Job** - See [SCHEDULER.md](SCHEDULER.md) for setup instructions:
   - Vercel: Add to `vercel.json` (included)
   - Railway: Add to `railway.json`
   - External: Use cron-job.org or GitHub Actions

3. **Schedule a Post**:
   - Create/edit post
   - Set "Schedule For" date/time
   - Save as draft
   - Post auto-publishes at scheduled time

### API Endpoint

```bash
# Publish due posts (called by cron)
POST /api/scheduler/publish
Authorization: Bearer YOUR_SCHEDULER_TOKEN

# Manual trigger (admin only)
GET /api/scheduler/publish
```

See [SCHEDULER.md](SCHEDULER.md) for complete documentation.

## 🌐 Social Media Sharing

One-click sharing to multiple platforms with optimized meta tags.

### Sharing Platforms

- **Twitter/X** - With hashtag support
- **Facebook** - Open Graph optimized
- **LinkedIn** - Professional sharing
- **Reddit** - With title and URL
- **WhatsApp** - Mobile-friendly sharing
- **Telegram** - Instant messaging
- **Email** - Pre-filled subject and body
- **Copy Link** - Clipboard copy with feedback

### SEO Features

- ✅ **Open Graph Tags** - Facebook, LinkedIn optimization
- ✅ **Twitter Cards** - Summary large image cards
- ✅ **Structured Data** - JSON-LD for articles
- ✅ **Canonical URLs** - SEO best practices
- ✅ **Meta Descriptions** - Dynamic from post content

Share buttons appear on every post page below the content.

## 🧪 Testing

Vitest-based testing infrastructure with coverage reporting.

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# Coverage report
npm run test:coverage
```

### Test Structure

```
tests/
├── validations/
│   ├── posts.test.ts      # Post utilities tests
│   └── comments.test.ts   # Comment validation tests
└── README.md              # Testing guide
```

See [tests/README.md](tests/README.md) for testing guidelines.

## 🚀 Deployment

The application uses hybrid rendering and requires:

1. Node.js server (via @astrojs/node adapter)
2. PostgreSQL database
3. Environment variables configured

Recommended platforms:
- Vercel
- Netlify
- Railway
- Render
- Fly.io

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guides.

## 🔄 CI/CD Pipeline

Modern CI/CD implementation with automated testing, security scanning, and DORA metrics tracking.

### Workflows

- **🔍 CI Pipeline** - Automated testing, linting, and building on every push
- **🔒 Security Scanning** - DevSecOps with daily security scans (secrets, dependencies, SAST, SBOM)
- **🚀 Deployment** - Automated deployments to staging and production
- **📊 DORA Metrics** - Track deployment frequency, lead time, failure rate, and MTTR

### Quick Start

```bash
# Workflows run automatically on push/PR
git push origin main

# Manual deployment trigger
# Actions → Deploy → Run workflow

# Generate DORA metrics report
# Actions → DORA Metrics Tracking → Run workflow
```

### Performance Targets

Following [DORA research](https://dora.dev) best practices:

| Metric | Current Target | Elite Target |
|--------|---------------|--------------|
| **Deployment Frequency** | Configurable | Multiple/day |
| **Lead Time** | ~25 minutes | < 1 hour |
| **Change Failure Rate** | Track via monitoring | 0-15% |
| **MTTR** | Automated rollback | < 1 hour |

### Security Features

- ✅ **Secret Scanning** - TruffleHog for credential detection
- ✅ **Dependency Scanning** - npm audit for vulnerabilities
- ✅ **SAST** - CodeQL & Semgrep for code security
- ✅ **SBOM Generation** - Software bill of materials for compliance
- ✅ **License Compliance** - Automated license checking

See [CI_CD.md](CI_CD.md) for complete CI/CD documentation.

## 📖 Implementation Progress

> **Overall Completion: 100% - Production Ready!** 🎉 | See [PROGRESS.md](PROGRESS.md) for detailed tracking

### ✅ Phase 1: Database Setup (COMPLETED - 100%)
- [x] Project initialization with Astro 5, TypeScript, Tailwind
- [x] PostgreSQL + Drizzle ORM setup
- [x] Complete database schema (8 tables)
- [x] Database connection and utilities
- [x] Migration configuration

### ✅ Phase 2: Authentication (COMPLETED - 100%)
- [x] Better Auth integration with Drizzle
- [x] Login/Register pages with validation
- [x] Email verification flow
- [x] Password reset functionality
- [x] Authentication middleware
- [x] Role-based access control (Admin, Author, User)
- [x] Protected routes implementation

### ✅ Phase 2.5: Email Integration (COMPLETED - 100%)
- [x] Resend API client setup
- [x] HTML email templates (verification, welcome, password reset)
- [x] Email sending utilities
- [x] Error handling and logging

### ✅ Phase 3: Content Management (COMPLETED - 100%)
- [x] Posts API endpoints (CRUD operations)
- [x] Categories & Tags API endpoints
- [x] Content service layer with complex queries
- [x] Zod validation schemas
- [x] Dynamic post listing page with search/pagination
- [x] Individual post pages with markdown rendering
- [x] View tracking and reading time calculation
- [x] Featured images and metadata

### ✅ Phase 4: User Management (COMPLETED - 100%)
- [x] User profile pages (`/users/[username]`)
- [x] Profile settings page (`/settings`)
- [x] Profile editing with validation
- [x] User API endpoints (`/api/users/me`)
- [x] Admin user management interface

### ✅ Phase 5: Admin Panel (COMPLETED - 100%)
- [x] Admin layout with sidebar navigation
- [x] Admin dashboard with statistics
- [x] Posts listing with filters and search
- [x] Post editor form (create/edit)
- [x] User management interface
- [x] Category management interface
- [x] Tag management interface
- [x] Auto-slug generation
- [x] Markdown editor

### ✅ Phase 6: SEO & Discovery (COMPLETED - 100%)
- [x] Dynamic sitemap generation (`/sitemap.xml`)
- [x] RSS feed (`/rss.xml`)
- [x] Robots.txt configuration
- [x] Meta tags optimization
- [x] Structured data

### ✅ Phase 7: Deployment (COMPLETED - 100%)
- [x] Comprehensive deployment guide ([DEPLOYMENT.md](DEPLOYMENT.md))
- [x] Multiple platform support (Vercel, Railway, Render)
- [x] Environment configuration
- [x] Production best practices
- [x] Monitoring and maintenance guide

### ✅ Phase 8: Search Integration (COMPLETED - 100%)
- [x] Pagefind integration for fast static search
- [x] Dedicated search page (`/search`)
- [x] Global navigation header component
- [x] Mobile-responsive navigation
- [x] Dark mode support for search UI
- [x] Real-time search with result highlighting

### ✅ Phase 9: Comments System (COMPLETED - 100%)
- [x] Comments database schema with nested replies
- [x] Comment service layer with full CRUD operations
- [x] Comments API endpoints (GET, POST, PUT, DELETE, PATCH)
- [x] Comments component with nested display
- [x] Reply functionality with threading
- [x] Edit and delete for comment owners
- [x] Admin comment moderation interface
- [x] Integration on post pages

### ✅ Phase 10: CI/CD & DevOps (COMPLETED - 100%)
- [x] GitHub Actions CI/CD pipeline
- [x] Automated testing and linting
- [x] Security scanning (TruffleHog, CodeQL, Semgrep)
- [x] DORA metrics tracking
- [x] Pre-push git hooks with 8 validation checks
- [x] Automated deployment workflows
- [x] SBOM generation

### ✅ Phase 11: Testing Infrastructure (COMPLETED - 100%)
- [x] Vitest setup and configuration
- [x] Unit tests for validation schemas
- [x] Unit tests for utility functions
- [x] Test coverage reporting
- [x] Testing documentation

### ✅ Phase 12: Analytics & Insights (COMPLETED - 100%)
- [x] Analytics dashboard page
- [x] Total metrics (posts, views, comments, users)
- [x] Top performing posts ranking
- [x] Top authors by views
- [x] Recent posts performance
- [x] Most commented posts
- [x] Engagement rate calculations
- [x] Performance summaries

### ✅ Phase 13: Post Scheduling (COMPLETED - 100%)
- [x] scheduledAt field in posts schema
- [x] Scheduler service with auto-publish logic
- [x] Scheduler API endpoint
- [x] Scheduled posts admin page
- [x] Manual scheduler trigger
- [x] Cancel/reschedule functionality
- [x] Vercel cron job configuration
- [x] Complete scheduler documentation

### ✅ Phase 14: Social Media Integration (COMPLETED - 100%)
- [x] Social share component
- [x] Share buttons for 7 platforms (Twitter, Facebook, LinkedIn, Reddit, WhatsApp, Telegram, Email)
- [x] Copy link functionality
- [x] Open Graph meta tags
- [x] Twitter Card meta tags
- [x] Structured data for articles
- [x] Integration on post pages

### 📅 Optional Future Enhancements
- [ ] Redis caching layer
- [ ] Cloudinary image upload service
- [ ] Newsletter/subscription system
- [ ] Comment reactions (likes, emojis)
- [ ] User mentions and notifications
- [ ] Advanced analytics (custom events, funnel tracking)

## 🤝 Contributing

This is a complete platform implementation. Follow the existing code patterns and maintain type safety.

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- [Astro](https://astro.build/)
- [Better Auth](https://www.better-auth.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Resend](https://resend.com/)

---

Built with ❤️ using Astro and TypeScript
