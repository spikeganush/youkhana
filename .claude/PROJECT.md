# Youkhana Project Documentation

## Project Overview

Youkhana is a modern e-commerce website built with Next.js 16, featuring a headless architecture that integrates with Shopify for product management and Instagram for social media content. The site showcases products with a beautiful, modern UI and provides seamless shopping experiences.

**Live URL**: https://yyoukhanaa.myshopify.com
**Project Owner**: Youkhana (yyoukhanaa@gmail.com)

---

## Tech Stack

### Core Framework
- **Next.js**: 16.0.0 (Latest, using App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Node.js**: Required for build/runtime

### Database & Storage
- **Upstash Redis**: Primary data store for caching and persistence
  - Used for Instagram tokens
  - Session management
  - General key-value storage
  - Connection: `https://immune-crappie-29799.upstash.io`

### External Integrations

#### Shopify (E-commerce)
- **Type**: Storefront GraphQL API
- **Store**: `yyoukhanaa.myshopify.com`
- **Purpose**: Product catalog, cart management, checkout
- **API**: Storefront Access Token authentication
- **Configuration**: `/lib/shopify/index.ts`

#### Instagram (Social Media)
- **Type**: Instagram Graph API
- **Purpose**: Display media gallery from Instagram account
- **Features**:
  - Long-lived access tokens stored in Redis
  - Auto-refresh mechanism via cron job
  - Supports VIDEO, IMAGE, CAROUSEL_ALBUM media types
- **API Route**: `/app/api/refresh-instagram-token/route.ts`

#### Resend (Email Service)
- **Purpose**: Contact form email delivery
- **From**: contact@mypersonalportfolio.app
- **To**: yyoukhanaa@gmail.com
- **Integration**: `/actions/sendEmail.ts`
- **Templates**: React Email components with Tailwind styling

### UI & Styling
- **Tailwind CSS**: 3.3.5 (Utility-first CSS framework)
- **Tailwind Plugins**:
  - @tailwindcss/forms
  - @tailwindcss/typography
  - @tailwindcss/aspect-ratio
- **Framer Motion**: 12.23.24 (Animations)
- **Heroicons**: 2.0.18 (Icon library)
- **React Hot Toast**: 2.4.1 (Notifications)

### Additional Libraries
- **React Email**: Email template components
- **React Multi Carousel**: 2.8.4 (Product carousels)
- **Vercel Speed Insights**: Performance monitoring

---

## Project Structure

```
youkhana/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with global providers
│   ├── page.tsx                 # Homepage
│   ├── shop/
│   │   └── page.tsx             # Shop/products listing
│   ├── product/
│   │   └── [handle]/
│   │       └── page.tsx         # Dynamic product detail pages
│   └── api/
│       └── refresh-instagram-token/
│           └── route.ts         # Instagram token refresh endpoint
│
├── components/
│   ├── Hero/                    # Hero section with image carousel
│   ├── Header/                  # Navigation header
│   ├── Shop/                    # Shop components
│   └── [various UI components]
│
├── lib/
│   ├── shopify/
│   │   ├── index.ts            # Shopify API client
│   │   └── types.ts            # Shopify type definitions
│   ├── redist.ts               # Upstash Redis client configuration
│   └── utils.ts                # Utility functions
│
├── types/
│   ├── shopify/
│   │   └── type.ts             # Shopify data models
│   ├── instagram.ts            # Instagram media types
│   └── general.ts              # General type definitions
│
├── actions/
│   └── sendEmail.ts            # Server action for contact form
│
└── public/                      # Static assets
```

---

## Environment Variables

### Required Variables (`.env`)

```env
# Upstash Redis
KV_REST_API_URL=https://immune-crappie-29799.upstash.io
KV_REST_API_TOKEN=<your-token>
KV_REST_API_READ_ONLY_TOKEN=<your-read-only-token>
KV_URL=<full-redis-url>

# Shopify
SHOPIFY_STORE_DOMAIN=https://yyoukhanaa.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=<your-token>
SHOPIFY_REVALIDATION_SECRET=<webhook-secret>

# Instagram
INSTAGRAM_APP_ID=<your-app-id>
CONVEX_WEBHOOK_SECRET=<webhook-secret>

# Email (Resend)
RESEND_API_KEY=<your-api-key>
```

**SECURITY WARNING**: The `.env` file currently contains active secrets and should NEVER be committed to version control. Consider using Vercel environment variables for production.

---

## Key Features

### 1. E-commerce Functionality
- Product browsing and search
- Product detail pages with images and descriptions
- Shopping cart management
- Checkout integration with Shopify
- Dynamic pricing and inventory

### 2. Instagram Integration
- Automated media gallery from Instagram
- Support for images, videos, and carousels
- Auto-refreshing access tokens
- Seamless media display

### 3. Dynamic Content
- All pages use `force-dynamic` rendering
- Real-time product data from Shopify
- Fresh Instagram content
- No static generation for data freshness

### 4. Image Optimization
- Next.js Image component with optimization
- Configured remote patterns for:
  - Shopify CDN (cdn.shopify.com)
  - Instagram CDN (cdninstagram.com, fbcdn.net)
  - Tailwind UI (tailwindui.com)
- Quality settings: [100, 75]

### 5. Contact Form
- Server-side email sending with Resend
- React Email templates
- Form validation
- Toast notifications for user feedback

---

## Deployment

### Platform
- **Vercel** (optimized for Next.js)
- Automatic deployments from Git
- Edge network distribution
- Environment variables managed in Vercel dashboard

### Build Configuration
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **PostCSS**: Autoprefixer for browser compatibility
- **Path Aliases**: `@/*` maps to root directory

---

## Git Repository

### Current Branch Structure
- **main**: Production branch
- **staging**: Current working branch
- Clean working tree (no uncommitted changes)

### Recent Commits
1. `541f28a` - Implement image carousel functionality in Hero component
2. `58eab8e` - Image test
3. `764b12f` - Update package dependencies and refine components
4. `bea5f47` - Update image quality settings and TypeScript types
5. `0e26849` - Refactor imports and string formatting

---

## Authentication & Admin (In Development)

### Planned Implementation
The project is being extended to include an admin space with the following requirements:

**Requirements**:
- Master admin: `yyoukhanaa@gmail.com` (cannot be removed)
- Invitation-only user registration (no public signup)
- Role-based access control (RBAC)
- Email-based authentication
- Integration with existing Upstash Redis database

**Chosen Solution**:
- **NextAuth v5 (Auth.js)**: Self-hosted, free authentication
- **Shadcn UI + TanStack Table**: Admin dashboard UI
- **Upstash Redis**: Session and user storage
- **Resend**: Email delivery for invitations

See `ADMIN_IMPLEMENTATION_PLAN.md` for detailed implementation roadmap.

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## API Routes

### `/api/refresh-instagram-token`
- **Method**: POST (webhook) or GET (manual trigger)
- **Purpose**: Refresh Instagram long-lived access tokens
- **Schedule**: Automated via cron job
- **Storage**: Updates tokens in Upstash Redis

---

## Data Models

### Shopify Types
- **Product**: Product details, variants, pricing
- **Cart**: Shopping cart state
- **CartItem**: Individual items in cart
- **Collection**: Product collections
- **Image**: Product images with alt text
- **Money**: Price with currency

### Instagram Types
- **InstagramMedia**: Media items with type (VIDEO | IMAGE | CAROUSEL_ALBUM)
- **MediaType**: Enum for media types

---

## Security Considerations

### Current Status
1. **No Authentication**: Site is fully public
2. **Exposed Secrets**: `.env` file contains active API keys (should be removed from repo)
3. **API Security**: Webhook secrets protect Instagram endpoint
4. **HTTPS**: All external API calls use HTTPS

### Planned Improvements
1. Admin authentication system
2. Protected admin routes
3. RBAC for user management
4. Secure session management
5. Environment variable best practices

---

## Performance

- **Vercel Speed Insights**: Enabled for monitoring
- **Image Optimization**: Next.js automatic optimization
- **Dynamic Rendering**: Fresh data on every request
- **Edge Functions**: Fast global response times
- **Redis Caching**: Quick data retrieval

---

## Support & Contact

- **Project Owner**: yyoukhanaa@gmail.com
- **Issues**: Report via project repository
- **Documentation**: This file should be updated as features are added

---

## Changelog

### 2025-10-25
- Created project documentation
- Planning admin space implementation with NextAuth + Shadcn UI

### Previous Updates
- Implemented Hero component image carousel
- Refined About and Hero components
- Updated image quality settings
- Standardized TypeScript type definitions

---

## Notes for AI Assistants

When starting a new chat session:
1. Read this `PROJECT.md` file to understand the project structure
2. Check `ADMIN_IMPLEMENTATION_PLAN.md` for current development status
3. Review `.env` for available integrations
4. Check `package.json` for installed dependencies
5. Look at recent git commits for latest changes

This project uses:
- Next.js 16 App Router (NOT Pages Router)
- TypeScript strict mode
- Server Components by default
- Server Actions for mutations
- Upstash Redis (NOT PostgreSQL, MongoDB, etc.)
