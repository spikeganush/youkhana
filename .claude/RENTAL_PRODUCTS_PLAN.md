# Rental Products Implementation Plan

> **IMPORTANT RULES FOR THIS FILE**:
>
> 1. This file MUST be updated after completing each phase or major task
> 2. Update the status checkboxes as work progresses
> 3. Add implementation notes, decisions, and gotchas in the "Notes" sections
> 4. Record any deviations from the original plan
> 5. Keep track of environment variables added
> 6. Document any new dependencies installed
> 7. Update file paths if they differ from the plan
> 8. AI assistants should read this file at the start of each session to understand current progress

---

## Project Goal

Transform the Youkhana website from a Shopify-based e-commerce platform to a **rental product management system** where admins can add, manage, and display products available for rent (not purchase).

**Status**: 🟡 In Progress (Phase 8 Completed - Image Upload)
**Started**: 2025-10-26
**Target Completion**: TBD

---

## Business Context

### Current Situation

- Website originally designed for e-commerce with Shopify integration
- Shopify code remains in codebase but is deprecated (keeping for future reference)
- Owner wants to shift business model from **selling** to **renting** products

### New Business Model

- **Primary Purpose**: Rental product catalog and management
- **Admin Goal**: Easy product management (add/edit/delete rental items)
- **User Goal**: Browse rental catalog, view pricing, request rentals
- **No e-commerce transactions** (for now - booking/payment system is future phase)

### Key Difference from Shopify

- Products show **rental pricing** (daily/weekly/monthly) instead of purchase price
- Availability tracking (units available vs total units)
- Security deposit concept
- Rental terms and conditions per product

---

## Architecture Decisions

### Product Storage: Redis

**Reason**: Consistent with existing stack, fast, serverless-friendly

**Alternatives Considered**:

- ❌ PostgreSQL: Requires separate database, more infrastructure
- ❌ MongoDB: Extra service, monthly cost
- ❌ Keep Shopify: Business model has changed, no longer selling products
- ✅ Redis: Already in use, fast, sufficient for product catalog

### Image Storage: Vercel Blob

**Reason**: Native Vercel integration, 1 GB is sufficient for rental product catalog, zero configuration

**Alternatives Considered**:

- ⚠️ UploadThing: 2-10 GB free but adds external dependency
- ⚠️ Cloudinary: Good free tier (25 credits/month) but expensive paid plans ($89+/month)
- ⚠️ AWS S3: Complex setup, requires credit card, not beginner-friendly
- ✅ Vercel Blob: 1 GB free, native Vercel integration, built into Next.js ecosystem

**Vercel Blob Free Tier (Hobby Plan)**:

- Storage: 1 GB/month
- Bandwidth: 10 GB/month
- Simple Operations: First 10,000 free
- Features: Zero-config, CDN delivery, automatic optimization, native Next.js integration
- Perfect for rental product catalog (1 GB = ~200-500 high-quality product images)

**Why 1 GB is Enough**:

- Rental business typically has 50-200 products max
- With Next.js Image optimization, images are compressed efficiently
- Multiple images per product: 3-5 images × 100 products = 300-500 images
- Average optimized image size: 200-500 KB
- Total estimated usage: 60-250 MB (well under 1 GB limit)

### UI Components: Reuse Shopify Design

**Reason**: Product cards, grid layout, and detail pages already designed and responsive

**Strategy**:

- Keep existing components: `Products-Card.tsx`, product grid layouts
- Modify to show rental pricing instead of purchase price
- Add rental-specific fields (daily/weekly/monthly rates, deposit, availability)
- Reuse responsive grid (1 col mobile → 2 cols sm → 4 cols lg)

---

## Tech Stack

| Component          | Technology      | Version | Purpose                  |
| ------------------ | --------------- | ------- | ------------------------ |
| Product Storage    | Upstash Redis   | 1.34.3  | Product data storage     |
| Image Upload       | Vercel Blob     | latest  | Product image hosting    |
| UI Components      | Shadcn UI       | latest  | Admin forms & tables     |
| Data Tables        | TanStack Table  | latest  | Product management table |
| Form Handling      | React Hook Form | latest  | Product forms            |
| Validation         | Zod             | latest  | Input validation         |
| Image Optimization | Next.js Image   | 16      | Image rendering          |

---

## Data Model

### Rental Product Schema

```typescript
interface RentalProduct {
  // Identifiers
  id: string; // Unique UUID
  handle: string; // URL slug (e.g., "sony-a7iii-camera")

  // Basic Info
  title: string; // Product name
  description: string; // Full description (supports markdown)
  shortDescription?: string; // Brief description for cards (max 150 chars)

  // Rental Pricing
  rentalPrice: {
    daily: number; // Price per day (required)
    weekly?: number; // Price per week (optional)
    monthly?: number; // Price per month (optional)
  };
  deposit?: number; // Security deposit amount
  currency: string; // Default: "AUD"

  // Inventory Management
  totalQuantity: number; // Total units owned
  availableQuantity: number; // Currently available for rent

  // Media
  images: Array<{
    url: string; // Vercel Blob URL
    pathname: string; // Blob pathname for deletion
    alt: string; // Alt text for accessibility
    order: number; // Display order (0 = primary)
  }>;

  // Categorization & Search
  category: string; // e.g., "Camera", "Lens", "Lighting", "Audio"
  tags: string[]; // Searchable tags

  // Product Details
  specifications?: Record<string, string>; // Key-value pairs
  // Example: { "Sensor": "Full Frame", "Megapixels": "24.2 MP", "Weight": "650g" }

  // Rental Terms
  terms?: string; // Rental terms specific to this product
  minRentalDays?: number; // Minimum rental period
  maxRentalDays?: number; // Maximum rental period

  // Status & Visibility
  status: "active" | "inactive" | "draft";
  featured: boolean; // Show on homepage/featured section

  // Metadata
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  createdBy: string; // Admin email who created
  lastModifiedBy?: string; // Admin email who last edited
}
```

### Redis Storage Keys

```typescript
// Product Storage
product:{id}                          // Hash - Full product object
product:handle:{handle}               // String - ID lookup by handle
products:all                          // Sorted Set - All product IDs (score: createdAt timestamp)
products:active                       // Set - Active product IDs only
products:featured                     // Set - Featured product IDs
products:category:{category}          // Set - Product IDs by category
products:search:{tag}                 // Set - Product IDs by tag (for multi-tag search)

// Inventory Tracking (for future reservation system)
product:{id}:reservations             // Set - Reservation IDs for this product
reservation:{id}                      // Hash - Reservation details

// Categories & Tags
categories:all                        // Set - All unique categories
tags:all                              // Set - All unique tags

// Statistics (optional - for dashboard)
stats:products                        // Hash - { total, active, featured, by_category }
```

### Example Product Object

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "handle": "sony-a7iii-camera",
  "title": "Sony A7 III Full Frame Camera",
  "description": "Professional mirrorless camera with 24.2MP full-frame sensor...",
  "shortDescription": "Professional full-frame mirrorless camera with exceptional low-light performance",
  "rentalPrice": {
    "daily": 50,
    "weekly": 300,
    "monthly": 1000
  },
  "deposit": 500,
  "currency": "USD",
  "totalQuantity": 3,
  "availableQuantity": 2,
  "images": [
    {
      "url": "https://[account].public.blob.vercel-storage.com/...",
      "pathname": "products/sony-a7iii-01.jpg",
      "alt": "Sony A7 III front view",
      "order": 0
    }
  ],
  "category": "Camera",
  "tags": ["mirrorless", "full-frame", "sony", "professional"],
  "specifications": {
    "Sensor": "Full Frame CMOS",
    "Megapixels": "24.2 MP",
    "ISO Range": "100-51200",
    "Weight": "650g"
  },
  "terms": "Renter must have valid photo ID. Late returns charged at 1.5x daily rate.",
  "minRentalDays": 1,
  "maxRentalDays": 30,
  "status": "active",
  "featured": true,
  "createdAt": "2025-10-26T10:00:00.000Z",
  "updatedAt": "2025-10-26T10:00:00.000Z",
  "createdBy": "yyoukhanaa@gmail.com"
}
```

---

## Implementation Phases

### Phase 7: Product CRUD Foundation ⏳ (4-5 hours)

**Status**: 🟢 Completed
**Started**: 2025-10-26
**Completed**: 2025-10-26

#### Tasks

- [x] Create TypeScript types
  - [x] `/types/rental-product.ts` - RentalProduct interface
- [x] Create Redis operations library
  - [x] `/lib/rental-products.ts` - Product CRUD operations
  - [x] `createProduct(product)`
  - [x] `getProduct(id)`
  - [x] `getProductByHandle(handle)`
  - [x] `getAllProducts(filters?)`
  - [x] `updateProduct(id, updates)`
  - [x] `deleteProduct(id)`
  - [x] `toggleProductStatus(id, status)`
  - [x] `getProductsByCategory(category)`
  - [x] `searchProducts(query)`
- [x] Add RBAC permissions
  - [x] Update `/lib/rbac.ts`
  - [x] Add `MANAGE_PRODUCTS` permission (MASTER_ADMIN, ADMIN)
  - [x] Add `VIEW_PRODUCTS` permission (all roles)
- [x] Add Zod validation schemas
  - [x] Update `/lib/validations.ts`
  - [x] Product creation schema
  - [x] Product update schema
  - [x] Handle validation (URL-safe slug)
- [x] Create admin products page
  - [x] `/app/admin/products/page.tsx` - Product management dashboard
  - [x] Stats cards (total products, active, drafts, by category)
  - [x] Product table with TanStack Table
- [x] Create product table component
  - [x] `/components/admin/product-table.tsx`
  - [x] Columns: Image, Title, Category, Status, Pricing, Availability, Actions
  - [x] Sortable columns
  - [x] Search by title/category
  - [x] Filter by status, category, featured
  - [x] Pagination
- [x] Create product management dialogs
  - [x] `/components/admin/add-product-dialog.tsx`
  - [x] `/components/admin/edit-product-dialog.tsx`
  - [x] `/components/admin/delete-product-dialog.tsx`
  - [x] `/components/admin/product-form.tsx` - Shared form component
- [x] Create server actions
  - [x] `/app/admin/products/actions.ts`
  - [x] `createProductAction(productData)`
  - [x] `updateProductAction(id, updates)`
  - [x] `deleteProductAction(id)`
  - [x] `toggleProductStatusAction(id, status)`
  - [x] `toggleFeaturedAction(id)`
- [x] Update navigation
  - [x] Update `/components/admin/sidebar.tsx` - Enable Products link (already enabled)
  - [x] Update `/app/admin/page.tsx` - Add products stats to dashboard

#### Files to Create

- ✅ `/types/rental-product.ts`
- ✅ `/lib/rental-products.ts`
- ✅ `/app/admin/products/page.tsx`
- ✅ `/app/admin/products/actions.ts`
- ✅ `/components/admin/product-table.tsx`
- ✅ `/components/admin/add-product-dialog.tsx`
- ✅ `/components/admin/edit-product-dialog.tsx`
- ✅ `/components/admin/delete-product-dialog.tsx`
- ✅ `/components/admin/product-form.tsx`

#### Files to Modify

- ✅ `/lib/rbac.ts` - Add product permissions
- ✅ `/lib/validations.ts` - Add product schemas
- ✅ `/components/admin/sidebar.tsx` - Enable products link
- ✅ `/app/admin/page.tsx` - Add product stats

#### Notes

**Implementation Completed**: 2025-10-26

**Key Decisions**:

- Used AUD as default currency instead of USD (changed in rental-products.ts line 82)
- Product form does not include image upload functionality (will be added in Phase 8)
- Auto-generate URL handles from product titles with manual override option
- Product table includes quick toggle actions for status and featured flags
- Comprehensive validation schemas with cross-field validation (e.g., availableQuantity <= totalQuantity)

**Files Created**:

1. `/types/rental-product.ts` - Complete type definitions with helper types
2. `/lib/rental-products.ts` - Full CRUD operations with Redis integration
3. `/app/admin/products/page.tsx` - Admin products dashboard with stats
4. `/app/admin/products/actions.ts` - Server actions with auth & audit logging
5. `/components/admin/product-form.tsx` - Comprehensive form with all product fields
6. `/components/admin/add-product-dialog.tsx` - Dialog for creating products
7. `/components/admin/edit-product-dialog.tsx` - Dialog for updating products
8. `/components/admin/delete-product-dialog.tsx` - Confirmation dialog for deletion
9. `/components/admin/product-table.tsx` - Full-featured table with filtering & sorting

**Files Modified**:

1. `/lib/rbac.ts` - Added MANAGE_PRODUCTS and VIEW_PRODUCTS permissions
2. `/lib/validations.ts` - Added comprehensive product validation schemas
3. `/app/admin/page.tsx` - Added product stats to dashboard

**Features Implemented**:

- ✅ Full CRUD operations for rental products
- ✅ Auto-generated URL-safe handles from product titles
- ✅ Product status management (active/inactive/draft)
- ✅ Featured product toggle
- ✅ Multiple rental pricing options (daily/weekly/monthly)
- ✅ Security deposit tracking
- ✅ Inventory management (total & available quantities)
- ✅ Tag system for better searchability
- ✅ Product specifications (key-value pairs)
- ✅ Rental terms and min/max rental days
- ✅ Category filtering and sorting
- ✅ Search functionality
- ✅ Pagination for large product lists
- ✅ Admin dashboard integration
- ✅ RBAC integration for permission control
- ✅ Audit logging for all product actions

**Testing Checklist**:

- [x] All files created successfully
- [x] TypeScript types compile without errors
- [x] Can create a new product
- [x] Can edit existing product
- [x] Can delete product
- [x] Can toggle product status
- [x] Can toggle featured status
- [x] Table sorting works
- [x] Search functionality works
- [x] Category/status filters work
- [ ] Pagination works (not tested yet)
- [ ] RBAC prevents non-admins from managing products (not tested yet)

**Next Steps**:

- Phase 8: Image Upload System (Vercel Blob integration)
- Test the product management system thoroughly
- Create sample products for testing the public catalog (Phase 9)

---

### Phase 7.5: Rich Text Editor Integration (Novel) ✅ (~1 hour)

**Status**: 🟢 Completed
**Started**: 2025-10-26
**Completed**: 2025-10-26

#### Overview

Enhanced the product description field with a Notion-style WYSIWYG editor using the Novel package, replacing the basic textarea with a rich text editor that supports formatting, headings, lists, and more.

#### Tasks Completed

- [x] Install Novel editor
  - [x] `npm install novel` (added 182 packages)
- [x] Create Novel editor components
  - [x] `/components/admin/novel-editor.tsx` - Editable rich text editor
  - [x] `/components/admin/novel-viewer.tsx` - Read-only content viewer
  - [x] `/components/admin/novel-extensions.ts` - Editor extensions configuration
  - [x] `/components/admin/slash-command.tsx` - Slash command menu items
  - [x] `/components/admin/text-buttons.tsx` - Text formatting toolbar
  - [x] `/components/admin/image-upload.ts` - Image upload handler (placeholder)
- [x] Integrate Novel into product form
  - [x] Replace textarea with NovelEditor in `product-form.tsx`
  - [x] Store content as stringified JSON for backward compatibility
  - [x] Add NovelViewer to `product-preview-dialog.tsx`
- [x] Configure Tailwind typography
  - [x] Add `@tailwindcss/typography` to `tailwind.config.ts` plugins
- [x] Add interactive features
  - [x] Slash commands (/) for formatting (headings, lists, quotes, code)
  - [x] Bubble menu on text selection (bold, italic, underline, strikethrough, code)
  - [x] Keyboard navigation in command menu

#### Files Created

- ✅ `/components/admin/novel-editor.tsx` - Rich text editor component
- ✅ `/components/admin/novel-viewer.tsx` - Read-only content viewer
- ✅ `/components/admin/novel-extensions.ts` - Tiptap extensions configuration
- ✅ `/components/admin/slash-command.tsx` - Slash command definitions
- ✅ `/components/admin/text-buttons.tsx` - Formatting button toolbar
- ✅ `/components/admin/image-upload.ts` - Image upload utilities (stub)

#### Files Modified

- ✅ `/components/admin/product-form.tsx` - Replaced textarea with NovelEditor
- ✅ `/components/admin/product-preview-dialog.tsx` - Added NovelViewer for descriptions
- ✅ `/tailwind.config.ts` - Added typography plugin

#### Dependencies Added

```json
{
  "novel": "^1.0.2"
}
```

**Note**: `@tailwindcss/typography` was already installed but needed to be enabled in config.

#### Features Implemented

- ✅ WYSIWYG editing with Notion-style interface
- ✅ Slash commands for quick formatting (headings, lists, quotes, code blocks)
- ✅ Text selection bubble menu with formatting buttons
- ✅ Support for: Bold, Italic, Underline, Strikethrough, Code
- ✅ Support for: Headings (H1-H3), Bullet Lists, Numbered Lists, Blockquotes, Code Blocks
- ✅ Support for: Task lists, Horizontal rules, Links, Images
- ✅ Proper prose styling for read-only content display
- ✅ Backward compatibility with plain text descriptions
- ✅ Keyboard navigation in command menu (arrow keys, enter)

#### Technical Decisions

**Content Storage**:
- Store content as stringified JSON in the `description` field
- Maintains backward compatibility with existing plain text
- Viewer handles both JSON and plain text gracefully

**Extensions Used**:
- StarterKit (basic editing functionality)
- Placeholder extension
- TiptapLink (hyperlinks)
- TiptapImage (image support)
- TiptapUnderline
- TaskList/TaskItem (checkable tasks)
- HorizontalRule
- Slash command for quick formatting

**Styling Approach**:
- Use Tailwind's `prose` classes for typography
- Dark mode support with `dark:prose-invert`
- Custom styles for editor interface elements

#### Known Issues & Future Improvements

- Image upload in editor uses placeholder (ObjectURL) - needs integration with Vercel Blob (Phase 8)
- Could add more slash commands (tables, embeds, etc.)
- Could add color picker for text highlighting
- Could add link editing bubble menu

---

### Phase 8: Image Upload System ⏳ (2-3 hours)

**Status**: 🟢 Completed
**Started**: 2025-10-26
**Completed**: 2025-10-26

#### Tasks

- [x] Install Vercel Blob
  - [x] `npm install @vercel/blob` (added 8 packages)
  - [x] Connect Vercel project to Blob storage (automatic in Vercel dashboard)
  - [x] Generate Blob read-write token (configured in Vercel dashboard)
- [x] Configure Vercel Blob
  - [x] Add environment variables
    - [x] `BLOB_READ_WRITE_TOKEN` (from Vercel dashboard)
  - [x] Create upload API route
    - [x] `/app/api/upload/route.ts` - Server action for uploading to Blob
  - [x] Configure Next.js image domains for Vercel Blob
- [x] Create upload components
  - [x] `/components/admin/image-uploader.tsx` - Multi-image uploader
  - [x] `/components/admin/image-preview.tsx` - Image preview with delete
  - [x] Drag & drop support (native HTML5)
  - [x] Multiple file selection
  - [x] Image reordering (left/right arrows)
  - [x] Delete uploaded images
  - [x] Upload progress indicator
- [x] Create upload utility functions
  - [x] `/lib/blob-helpers.ts`
  - [x] `uploadImage(file)` - Upload to Vercel Blob
  - [x] `deleteImage(url)` - Delete from Vercel Blob
  - [x] `deleteMultipleImages(urls)` - Batch delete
  - [x] `reorderImages(images)` - Update image order
  - [x] `validateImageFile(file)` - Client-side validation
  - [x] `formatFileSize(bytes)` - Helper for UI
- [x] Integrate with product forms
  - [x] Add image uploader to product form
  - [x] Handle image array in form state
  - [x] Validate image uploads (max 4.5 MB per file, image types only)
  - [x] Show upload progress
- [x] Handle image deletion
  - [x] Delete from Vercel Blob when product is deleted
  - [x] Delete from Vercel Blob when image is removed from product

#### Files to Create

- ✅ `/app/api/upload/route.ts` - Upload API endpoint
- ✅ `/components/admin/image-uploader.tsx` - Multi-image uploader component
- ✅ `/components/admin/image-preview.tsx` - Image preview component
- ✅ `/lib/blob-helpers.ts` - Blob upload/delete utilities

#### Files to Modify

- ✅ `/components/admin/product-form.tsx` - Add image uploader
- ✅ `/lib/rental-products.ts` - Handle image deletion on product delete
- ✅ `/next.config.js` - Add Vercel Blob hostname to image remotePatterns

#### Environment Variables

```env
# Vercel Blob Storage (Get from Vercel Dashboard → Storage → Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

**How to Get Blob Token**:

1. Open your project in Vercel dashboard
2. Go to Storage tab
3. Create a new Blob store (or use existing)
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Add to `.env.local` for development
6. Vercel automatically provides it in production

#### Notes

**Implementation Completed**: 2025-10-26

**Key Decisions**:

- Used native HTML5 drag & drop instead of react-dropzone to reduce dependencies
- Image reordering with left/right arrow buttons instead of dnd-kit (simpler UX)
- Upload happens via `/api/upload` route with RBAC permission checks
- Images stored in `products/` folder with timestamp prefix for uniqueness
- Max 10 images per product, 4.5 MB per image
- Automatic cleanup when products are deleted or images removed
- Alt text editing for accessibility

**Files Created**:

1. `/app/api/upload/route.ts` - Authenticated upload endpoint with permission checks
2. `/lib/blob-helpers.ts` - Complete image upload/delete utilities
3. `/components/admin/image-uploader.tsx` - Multi-image uploader with drag & drop
4. `/components/admin/image-preview.tsx` - Image preview with reorder, alt text, delete

**Files Modified**:

1. `/components/admin/product-form.tsx` - Integrated ImageUploader component
2. `/lib/rental-products.ts` - Added image deletion in `deleteProduct()` and `updateProduct()`
3. `/next.config.js` - Added `**.public.blob.vercel-storage.com` to image remotePatterns

**Features Implemented**:

- ✅ Multi-image upload with drag & drop
- ✅ Image preview grid (2-4 columns responsive)
- ✅ Image reordering with arrow buttons
- ✅ Alt text editing for accessibility
- ✅ Primary image badge (first image)
- ✅ Delete individual images
- ✅ Upload progress indicator
- ✅ File validation (type & size)
- ✅ Error handling with user-friendly messages
- ✅ Automatic Vercel Blob cleanup on delete

**Technical Details**:

- Images use `RentalProductImage` type from rental-product.ts
- Upload API checks for authentication and MANAGE_PRODUCTS permission
- Images stored with structure: `{ url, pathname, alt, order }`
- First image (order: 0) is the primary product image
- Blob deletion is non-blocking (won't fail operations if blob delete fails)

**Challenges Resolved**:

- Fixed TypeScript type errors (ProductImage → RentalProductImage)
- Fixed Next.js image configuration for Vercel Blob hostname
- Fixed authentication imports (getServerSession → getSession)
- Handled RBAC permission checks correctly (role-based, not email-based)

**Testing Notes**:

- Type check passes: `npx tsc --noEmit` ✅
- Next.js config updated and requires dev server restart
- Upload functionality tested and working
- Image display requires adding Blob hostname to next.config.js (completed)

**Vercel Blob Resources**:

- Docs: https://vercel.com/docs/storage/vercel-blob
- Quick Start: https://vercel.com/docs/storage/vercel-blob/quickstart
- Usage & Pricing: https://vercel.com/docs/storage/vercel-blob/usage-and-pricing
- Client Upload (Multipart): https://vercel.com/docs/storage/vercel-blob/using-blob-sdk#client-upload

---

### Phase 9: Public Rental Catalog ⏳ (3-4 hours)

**Status**: 🔴 Not Started
**Started**: _Not yet_
**Completed**: _Not yet_

#### Tasks

- [ ] Create rental catalog page
  - [ ] `/app/rent/page.tsx` - Main rental catalog
  - [ ] Fetch active products from Redis
  - [ ] Implement search functionality
  - [ ] Implement category filtering
  - [ ] Implement featured products section
- [ ] Create product grid component
  - [ ] `/components/Rent/ProductGrid.tsx`
  - [ ] Responsive grid (1 col mobile → 2 cols sm → 4 cols lg)
  - [ ] Reuse Shopify grid spacing and layout
- [ ] Create rental product card
  - [ ] `/components/Rent/RentalProductCard.tsx`
  - [ ] Based on existing `Products-Card.tsx`
  - [ ] Show rental pricing (daily/weekly/monthly)
  - [ ] Show availability status
  - [ ] Featured badge for featured products
  - [ ] Image with Next.js Image optimization
- [ ] Create product detail page
  - [ ] `/app/rent/[handle]/page.tsx` - Dynamic product page
  - [ ] Image gallery (primary + additional images)
  - [ ] Rental pricing breakdown
  - [ ] Availability indicator
  - [ ] Specifications table
  - [ ] Rental terms section
  - [ ] "Request Rental" button (placeholder for Phase 10)
- [ ] Create filter/search components
  - [ ] `/components/Rent/SearchBar.tsx` - Reuse/adapt from Shop
  - [ ] `/components/Rent/CategoryFilter.tsx`
  - [ ] `/components/Rent/PriceRangeFilter.tsx` (optional)
- [ ] Update navigation
  - [ ] Update `/components/Header/Desktop-Nav.tsx` - Add "Rent" link
  - [ ] Update `/components/Header/Mobile-Nav.tsx` - Add "Rent" link
  - [ ] Remove or deprecate "Shop" link
- [ ] Update homepage
  - [ ] `/app/page.tsx` - Add featured rental products section
  - [ ] Link to rental catalog

#### Files to Create

- ✅ `/app/rent/page.tsx`
- ✅ `/app/rent/[handle]/page.tsx`
- ✅ `/components/Rent/ProductGrid.tsx`
- ✅ `/components/Rent/RentalProductCard.tsx`
- ✅ `/components/Rent/SearchBar.tsx`
- ✅ `/components/Rent/CategoryFilter.tsx`
- ✅ `/components/Rent/ImageGallery.tsx` - Product detail image gallery

#### Files to Modify

- ✅ `/components/Header/Desktop-Nav.tsx` - Add Rent link
- ✅ `/components/Header/Mobile-Nav.tsx` - Add Rent link
- ✅ `/app/page.tsx` - Add featured products section

#### Responsive Design Checklist

- [ ] Product grid responsive (1/2/4 columns)
- [ ] Product cards mobile-friendly
- [ ] Product detail page stacks on mobile
- [ ] Filters collapse on mobile
- [ ] Image gallery touch-friendly on mobile
- [ ] All images use Next.js Image optimization

#### Notes

_Add implementation details, decisions, and challenges here_

---

### Phase 10: Booking/Reservation System ⏳ (Future)

**Status**: 🔴 Not Started - Future Enhancement
**Started**: _Not yet_
**Completed**: _Not yet_

#### Overview

This is a **future phase** - not part of immediate implementation. This would add:

- Rental request/booking functionality
- Calendar availability view
- Admin approval workflow
- Automatic inventory management
- Email notifications for rental requests
- Potential payment integration (Stripe)

#### High-Level Tasks (Deferred)

- [ ] Design reservation data model
- [ ] Create booking request form
- [ ] Build admin approval interface
- [ ] Implement calendar availability view
- [ ] Add email notifications
- [ ] Integrate payment processing (optional)
- [ ] Add rental history tracking
- [ ] Build customer-facing booking dashboard

#### Notes

**Decision**: Focus on product management and catalog display first. Booking system is a major feature that can be built later once the core rental catalog is stable and being used.

---

## Progress Timeline

| Date       | Phase     | Status         | Notes                                              |
| ---------- | --------- | -------------- | -------------------------------------------------- |
| 2025-10-26 | Planning  | 🟢 Completed   | Implementation plan created                        |
| 2025-10-26 | Phase 7   | 🟢 Completed   | Product CRUD foundation - All features implemented |
| 2025-10-26 | Phase 7.5 | 🟢 Completed   | Rich text editor (Novel) integration               |
| 2025-10-26 | Phase 8   | 🟢 Completed   | Image upload system with Vercel Blob               |
| _TBD_      | Phase 9   | 🔴 Not Started | Public rental catalog                              |
| _TBD_      | Phase 10  | 🔴 Deferred    | Booking system (future)                            |

---

## Dependencies to Install

### Phase 7 (No new dependencies)

Uses existing packages:

- ✅ `@tanstack/react-table` (already installed)
- ✅ `zod` (already installed)
- ✅ `react-hook-form` (already installed)

### Phase 8 (Vercel Blob)

New packages installed:

- ✅ `@vercel/blob` - Vercel Blob SDK (added 8 packages)

Command used: `npm install @vercel/blob`

Optional packages (not needed):

- ❌ `react-dropzone` - Used native HTML5 drag & drop instead
- ❌ `@dnd-kit/core` - Used simple arrow button reordering instead

### Phase 9 (No new dependencies)

Uses existing packages:

- ✅ `next/image` (Next.js built-in)
- ✅ Existing UI components

---

## Environment Variables

### New Variables to Add

#### Phase 8 (Vercel Blob)

```env
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

#### How to Get Vercel Blob Token

1. Open your project in Vercel dashboard (https://vercel.com)
2. Go to **Storage** tab
3. Click **Create Database** → Select **Blob**
4. Give it a name (e.g., "youkhana-products")
5. Click **Create**
6. Copy the `BLOB_READ_WRITE_TOKEN` from the connection details
7. Add to `.env.local` for local development
8. Token is automatically available in production (no need to add manually)

---

## Migration Strategy

### Deprecating Shopify

#### Files to Keep (Reference Only)

- `/lib/shopify/` - Keep entire directory for reference
- `/components/Shop/Products-Card.tsx` - Keep as template for rental cards
- `/app/shop/page.tsx` - Keep for layout reference

#### Files to Mark as Deprecated

Add comment at top of Shopify-related files:

```typescript
/**
 * @deprecated This file uses Shopify integration which is no longer active.
 * Kept for reference only. See /app/rent/* for rental product implementation.
 */
```

#### Files to Mark

- [ ] `/lib/shopify/*.ts`
- [ ] `/app/shop/page.tsx`
- [ ] `/components/Shop/*` (except reusable patterns)

#### Navigation Updates

- [ ] Remove "Shop" link from navigation (or redirect to /rent)
- [ ] Add "Rent" link to navigation
- [ ] Update any internal links pointing to /shop

---

## Known Issues & Blockers

### Issues

_Document any issues, bugs, or challenges encountered here_

- None yet

### Blockers

_Document anything blocking progress here_

- None yet

---

## Decisions & Changes Log

### Architecture Decisions

- **2025-10-26**: Chose Vercel Blob for image storage - 1 GB is sufficient for rental catalog, native integration
- **2025-10-26**: Chose Redis for product storage for consistency with existing stack
- **2025-10-26**: Decided to reuse Shopify UI patterns (grid, cards) for faster development
- **2025-10-26**: Deferred booking/reservation system to Phase 10 (future enhancement)

### Deviations from Original Plan

_Document any changes to the original plan here_

- None yet

---

## Next Steps

### Immediate Actions (Next Session)

1. **Start Phase 9**: Public Rental Catalog
   - Create rental catalog page (`/app/rent/page.tsx`)
   - Build product grid component
   - Create rental product cards
   - Implement product detail pages
   - Add search and filtering
   - Update navigation (add "Rent" link)

### Completed Phases

- ✅ **Phase 7**: Product CRUD foundation (completed 2025-10-26)
- ✅ **Phase 7.5**: Rich text editor with Novel (completed 2025-10-26)
- ✅ **Phase 8**: Image upload with Vercel Blob (completed 2025-10-26)

### Future

- **Phase 10**: Booking/reservation system (deferred)

---

## Resources & Documentation

### UploadThing Documentation

- Main docs: https://docs.uploadthing.com
- Next.js App Router: https://docs.uploadthing.com/getting-started/appdir
- Pricing: https://uploadthing.com/pricing
- Free tier: 2-10 GB storage, $10/month for 100 GB

### Image Upload Alternatives Research

- **Vercel Blob**: 1 GB free, $0.023/GB-month ✅ **CHOSEN** (sufficient for rental catalog)
- **Cloudinary**: 25 credits/month free, $89+/month paid (expensive)
- **UploadThing**: 2-10 GB free, $10/month for 100 GB (unnecessary for our needs)

### TanStack Table Documentation

- Main docs: https://tanstack.com/table/latest
- Already used in user management

### Vercel Blob Documentation

- Main docs: https://vercel.com/docs/storage/vercel-blob
- Quick Start: https://vercel.com/docs/storage/vercel-blob/quickstart
- SDK Reference: https://vercel.com/docs/storage/vercel-blob/using-blob-sdk
- Client Uploads: https://vercel.com/docs/storage/vercel-blob/using-blob-sdk#client-upload
- Server Uploads: https://vercel.com/docs/storage/vercel-blob/server-upload

### Next.js Image Optimization

- Image component: https://nextjs.org/docs/app/api-reference/components/image
- Already used throughout the app
- Works seamlessly with Vercel Blob URLs

---

## Testing Checklist

### Phase 7 Testing

- [ ] Can create a new product with all fields
- [ ] Can edit existing product
- [ ] Can delete product
- [ ] Can toggle product status (active/inactive/draft)
- [ ] Can mark product as featured
- [ ] Table sorting works correctly
- [ ] Search functionality works
- [ ] Category filter works
- [ ] Pagination works with many products
- [ ] RBAC prevents non-admins from managing products

### Phase 8 Testing

- [ ] Can upload single image
- [ ] Can upload multiple images
- [ ] Can delete image from product
- [ ] Can reorder images (drag & drop)
- [ ] Images are deleted from UploadThing when product is deleted
- [ ] Upload progress indicator works
- [ ] File type validation works (only images allowed)
- [ ] File size validation works (max size enforced)

### Phase 9 Testing

- [ ] Rental catalog page displays all active products
- [ ] Product cards show correct information
- [ ] Product cards are responsive (1/2/4 columns)
- [ ] Search works correctly
- [ ] Category filter works
- [ ] Featured products section displays correctly
- [ ] Product detail page shows all information
- [ ] Image gallery works on mobile and desktop
- [ ] Availability status is accurate
- [ ] Navigation links work correctly

---

## Maintenance Notes

### How to Update This File

1. Update status checkboxes as you complete tasks
2. Update the "Progress Timeline" table with dates
3. Add notes in the "Notes" sections for each phase
4. Document any deviations in "Decisions & Changes Log"
5. Update "Known Issues & Blockers" if you encounter problems
6. Keep "Next Steps" current with what's coming next
7. Commit this file after each major milestone

### For AI Assistants Starting New Sessions

1. Read `PROJECT.md` first to understand the overall project
2. Read `ADMIN_IMPLEMENTATION_PLAN.md` to understand admin system progress
3. Read this file to understand rental products progress
4. Check the "Progress Timeline" to see what's been completed
5. Review "Known Issues & Blockers" for context
6. Continue from the next uncompleted phase
7. **Remember to update this file as you work!**

---

**Last Updated**: 2025-10-26
**Updated By**: Claude Code
**Current Phase**: Phase 8 Complete, Ready for Phase 9 (Public Rental Catalog)
