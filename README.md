# Pythoughts - Full-Stack Blogging Platform

A modern, full-featured blogging platform built with Astro, TypeScript, PostgreSQL, and Drizzle ORM. Features user authentication, database-driven content management, email functionality, and a comprehensive admin panel.

## 🚀 Features

- **Modern Tech Stack**: Astro 5, TypeScript, Tailwind CSS, PostgreSQL, Drizzle ORM
- **Authentication**: Better Auth integration with email verification and password reset
- **Content Management**: Full CRUD operations for posts, categories, and tags
- **User Roles**: Admin, Author, and User roles with role-based access control
- **Email Notifications**: Resend integration for transactional emails
- **Admin Panel**: Comprehensive dashboard for content and user management
- **Search**: Pagefind integration for fast static search with result highlighting
- **Navigation**: Global header with responsive mobile menu and user dropdown
- **Hybrid Rendering**: Static site generation + server-side rendering
- **Dark Mode**: Built-in dark mode support
- **SEO Optimized**: Meta tags, sitemap, and RSS feed generation
- **Type-Safe**: Full TypeScript support with Drizzle ORM

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

# Database
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:push          # Push schema (development)
npm run db:studio        # Open Drizzle Studio
```

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

## 📖 Implementation Progress

> **Overall Completion: ~95% - Production Ready!** 🎉 | See [PROGRESS.md](PROGRESS.md) for detailed tracking

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

### 📅 Optional Enhancements (Future)
- [ ] Comments system
- [ ] Redis caching
- [ ] Image upload service
- [ ] Newsletter integration
- [ ] Analytics dashboard

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
