# Admin Space Implementation Plan

> **IMPORTANT RULES FOR THIS FILE**:
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

Add an invitation-only admin space to the Youkhana e-commerce website where the master admin (yyoukhanaa@gmail.com) can invite and manage users with role-based access control.

**Status**: 🟡 In Progress
**Started**: 2025-10-25
**Target Completion**: TBD

---

## Architecture Decisions

### Authentication Solution: NextAuth v5 (Auth.js)
**Reason**: Free, self-hosted, full control over user data

**Alternatives Considered**:
- ❌ Clerk: Paid after 10k MAU ($25/month base)
- ❌ Lucia Auth: Deprecated in March 2025
- ❌ Better Auth: Too new, less documentation
- ✅ NextAuth v5: Free, mature, great Next.js 16 support

### Admin Dashboard UI: Shadcn UI + TanStack Table
**Reason**: Free, modern, lightweight (57KB), full control

**Alternatives Considered**:
- ❌ Refine: More opinionated, steeper learning curve
- ❌ NextAdmin: Requires PostgreSQL (we use Redis)
- ❌ React-Admin: Heavy bundle (315KB), poor Next.js SSR
- ✅ Shadcn UI: Perfect fit for our stack

### User Storage: Upstash Redis
**Reason**: Already in use, fast, serverless-friendly

**Data Structure**:
- Users stored as: `user:{email}` hash
- Invitations: `invitation:{token}` hash
- Indexes: `users:all`, `invitations:pending` sets

---

## Tech Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Authentication | NextAuth v5 | beta | Auth system |
| Session Adapter | @auth/upstash-redis-adapter | latest | Store sessions in Redis |
| UI Components | Shadcn UI | latest | Admin dashboard UI |
| Data Tables | TanStack Table | latest | User management tables |
| Email Provider | Resend | 1.0.0 | Send invitation emails |
| Database | Upstash Redis | 1.34.3 | User & session storage |

---

## Implementation Phases

### Phase 1: Authentication Setup ⏳ (2-3 hours)
**Status**: 🔴 Not Started
**Started**: _Not yet_
**Completed**: _Not yet_

#### Tasks
- [ ] Install NextAuth v5 and dependencies
  - [ ] `next-auth@beta`
  - [ ] `@auth/upstash-redis-adapter`
  - [ ] `@auth/core`
- [ ] Create `/app/api/auth/[...nextauth]/route.ts`
- [ ] Configure Upstash Redis adapter
- [ ] Set up Resend email provider
- [ ] Configure session strategy
- [ ] Add environment variables to `.env`
  - [ ] `AUTH_SECRET`
  - [ ] `AUTH_URL`
  - [ ] `NEXTAUTH_URL`
  - [ ] `MASTER_ADMIN_EMAIL`
- [ ] Create `middleware.ts` for route protection
- [ ] Test basic authentication flow

#### Files to Create
- `/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `/lib/auth.ts` - Auth helpers and utilities
- `/lib/auth-config.ts` - NextAuth config object
- `/middleware.ts` - Route protection middleware

#### Notes
_Add implementation notes, issues encountered, or decisions made here as you work_

---

### Phase 2: Admin Dashboard UI ⏳ (3-4 hours)
**Status**: 🔴 Not Started
**Started**: _Not yet_
**Completed**: _Not yet_

#### Tasks
- [ ] Install Shadcn UI
  - [ ] Run `npx shadcn@latest init`
  - [ ] Configure components.json
- [ ] Install required Shadcn components
  - [ ] `button`
  - [ ] `card`
  - [ ] `table`
  - [ ] `form`
  - [ ] `input`
  - [ ] `dialog`
  - [ ] `dropdown-menu`
  - [ ] `avatar`
  - [ ] `badge`
  - [ ] `select`
  - [ ] `toast`
- [ ] Install TanStack Table
  - [ ] `@tanstack/react-table`
- [ ] Create admin layout
  - [ ] `/app/admin/layout.tsx` - Sidebar, header, navigation
  - [ ] `/components/admin/sidebar.tsx` - Admin sidebar
  - [ ] `/components/admin/user-nav.tsx` - User dropdown menu
- [ ] Create dashboard overview
  - [ ] `/app/admin/page.tsx` - Dashboard with stats
  - [ ] Stats cards (total users, pending invitations)
  - [ ] Recent activity list

#### Files to Create
- `/app/admin/layout.tsx`
- `/app/admin/page.tsx`
- `/components/admin/sidebar.tsx`
- `/components/admin/user-nav.tsx`
- `/components/admin/stats-card.tsx`
- `/components/ui/*` (Shadcn components)

#### Notes
_Add implementation notes here_

---

### Phase 3: User Management & RBAC ⏳ (3-4 hours)
**Status**: 🔴 Not Started
**Started**: _Not yet_
**Completed**: _Not yet_

#### Tasks
- [ ] Define role system in code
  - [ ] Create `/lib/rbac.ts`
  - [ ] Define roles: `MASTER_ADMIN`, `ADMIN`, `MEMBER`
  - [ ] Define permissions for each role
- [ ] Create Redis user operations
  - [ ] `/lib/redis-auth.ts` - User CRUD operations
  - [ ] `createUser(email, name, role, invitedBy)`
  - [ ] `getUser(email)`
  - [ ] `getAllUsers()`
  - [ ] `updateUserRole(email, role)`
  - [ ] `deleteUser(email)`
- [ ] Create user management page
  - [ ] `/app/admin/users/page.tsx`
  - [ ] `/components/admin/user-table.tsx` - TanStack Table
  - [ ] Columns: Email, Name, Role, Created, Actions
  - [ ] Search functionality
  - [ ] Filter by role
  - [ ] Pagination
- [ ] Create user actions
  - [ ] `/app/admin/users/actions.ts` - Server actions
  - [ ] `updateUserRoleAction(email, role)`
  - [ ] `deleteUserAction(email)`
- [ ] Add role protection
  - [ ] Protect master admin from deletion
  - [ ] Protect master admin role from changes
  - [ ] Require ADMIN role for user management

#### Files to Create
- `/lib/rbac.ts`
- `/lib/redis-auth.ts`
- `/app/admin/users/page.tsx`
- `/app/admin/users/actions.ts`
- `/components/admin/user-table.tsx`
- `/components/admin/edit-user-dialog.tsx`
- `/components/admin/delete-user-dialog.tsx`

#### Data Models (Redis)
```typescript
// User object stored at key: user:{email}
interface User {
  email: string;
  name: string;
  role: 'MASTER_ADMIN' | 'ADMIN' | 'MEMBER';
  createdAt: string; // ISO timestamp
  invitedBy: string | null; // Email of inviter
  lastSignIn?: string; // ISO timestamp
}

// Index: users:all (Set of all user emails)
```

#### Notes
_Add implementation notes here_

---

### Phase 4: Invitation System ⏳ (3-4 hours)
**Status**: 🔴 Not Started
**Started**: _Not yet_
**Completed**: _Not yet_

#### Tasks
- [ ] Create invitation logic
  - [ ] `/lib/invitations.ts` - Invitation CRUD operations
  - [ ] `createInvitation(email, role, createdBy)`
  - [ ] `getInvitation(token)`
  - [ ] `getPendingInvitations()`
  - [ ] `markInvitationUsed(token)`
  - [ ] `deleteInvitation(token)`
  - [ ] `cleanupExpiredInvitations()`
- [ ] Create invitation management page
  - [ ] `/app/admin/invitations/page.tsx`
  - [ ] `/components/admin/invite-form.tsx` - Email + Role form
  - [ ] `/components/admin/invitation-table.tsx` - Pending invitations
  - [ ] Actions: Resend, Cancel invitation
- [ ] Create invitation actions
  - [ ] `/app/admin/invitations/actions.ts`
  - [ ] `sendInvitationAction(email, role)`
  - [ ] `resendInvitationAction(token)`
  - [ ] `cancelInvitationAction(token)`
- [ ] Create email templates
  - [ ] `/emails/invitation-email.tsx` - React Email template
  - [ ] Professional design with CTA button
  - [ ] Include expiration notice (7 days)
- [ ] Create signup flow
  - [ ] `/app/auth/signup/[token]/page.tsx` - Token verification
  - [ ] Verify token is valid and not expired
  - [ ] Show email (pre-filled, read-only)
  - [ ] Collect name from user
  - [ ] Create user account in Redis
  - [ ] Auto-sign in after account creation
- [ ] Create sign in page
  - [ ] `/app/auth/signin/page.tsx` - Email magic link form
  - [ ] Custom branded sign-in UI

#### Files to Create
- `/lib/invitations.ts`
- `/app/admin/invitations/page.tsx`
- `/app/admin/invitations/actions.ts`
- `/components/admin/invite-form.tsx`
- `/components/admin/invitation-table.tsx`
- `/emails/invitation-email.tsx`
- `/app/auth/signup/[token]/page.tsx`
- `/app/auth/signin/page.tsx`
- `/components/auth/signin-form.tsx`

#### Data Models (Redis)
```typescript
// Invitation object stored at key: invitation:{token}
interface Invitation {
  email: string;
  role: 'ADMIN' | 'MEMBER';
  token: string; // Unique random token
  expiresAt: string; // ISO timestamp (7 days from creation)
  createdBy: string; // Email of admin who created it
  createdAt: string; // ISO timestamp
  status: 'pending' | 'used' | 'expired';
  usedAt?: string; // ISO timestamp when used
}

// Index: invitations:pending (Set of pending invitation tokens)
```

#### Notes
_Add implementation notes here_

---

### Phase 5: Security & Protection ⏳ (2 hours)
**Status**: 🔴 Not Started
**Started**: _Not yet_
**Completed**: _Not yet_

#### Tasks
- [ ] Enhance middleware protection
  - [ ] Block `/admin/*` for non-authenticated users
  - [ ] Redirect to `/auth/signin` with callback URL
  - [ ] Verify user exists in Redis
  - [ ] Check user role for admin access
- [ ] Add server action security
  - [ ] Verify authentication in all actions
  - [ ] Verify user role/permissions
  - [ ] Prevent master admin deletion/modification
  - [ ] Add rate limiting for invitation creation
- [ ] Add CSRF protection
  - [ ] Verify NextAuth CSRF tokens
- [ ] Add input validation
  - [ ] Email format validation
  - [ ] Role enum validation
  - [ ] Prevent duplicate invitations
- [ ] Error handling
  - [ ] User-friendly error messages
  - [ ] Log errors for debugging
  - [ ] Graceful failure states
- [ ] Add audit logging
  - [ ] Log all user management actions
  - [ ] Log invitation creation/usage
  - [ ] Store in Redis with TTL

#### Files to Modify
- `/middleware.ts` - Enhanced protection
- `/app/admin/*/actions.ts` - Add security checks
- `/lib/rbac.ts` - Add permission checking functions

#### Notes
_Add implementation notes here_

---

### Phase 6: Testing & Polish ⏳ (2 hours)
**Status**: 🔴 Not Started
**Started**: _Not yet_
**Completed**: _Not yet_

#### Test Scenarios
- [ ] **Master Admin Flow**
  - [ ] Master admin can sign in with email
  - [ ] Master admin sees admin dashboard
  - [ ] Master admin can access all admin pages
  - [ ] Master admin cannot be deleted
  - [ ] Master admin role cannot be changed
- [ ] **Invitation Flow (Admin Role)**
  - [ ] Master admin can invite new admin
  - [ ] Invitation email is sent successfully
  - [ ] Invited user receives email with link
  - [ ] User can click link and signup
  - [ ] User account is created with ADMIN role
  - [ ] User is auto-signed in after signup
  - [ ] Used invitation cannot be reused
- [ ] **Invitation Flow (Member Role)**
  - [ ] Master admin can invite new member
  - [ ] Member has limited permissions
  - [ ] Member cannot access user management
  - [ ] Member cannot send invitations
- [ ] **Security Tests**
  - [ ] Unauthenticated users redirected from /admin
  - [ ] Expired invitation tokens are rejected
  - [ ] Invalid invitation tokens show error
  - [ ] Cannot create duplicate invitations
  - [ ] Cannot delete master admin
  - [ ] RBAC prevents unauthorized actions
- [ ] **Edge Cases**
  - [ ] Email sending failures are handled
  - [ ] Network errors show friendly messages
  - [ ] Loading states during async operations
  - [ ] Form validation prevents bad data

#### UI Polish Tasks
- [ ] Add loading spinners for async actions
- [ ] Add toast notifications for success/error
- [ ] Add confirmation dialogs for destructive actions
- [ ] Ensure mobile responsive design
- [ ] Add empty states (no users, no invitations)
- [ ] Add pagination if user list is long
- [ ] Add search/filter functionality
- [ ] Polish form validation messages

#### Files to Create
- `/app/admin/test-scenarios.md` - Document test results

#### Notes
_Add test results, bugs found, and fixes here_

---

## Environment Variables

### New Variables Added
Add these to your `.env` file and Vercel environment variables:

```env
# NextAuth Configuration
AUTH_SECRET=                    # Generate with: openssl rand -base64 32
AUTH_URL=http://localhost:3000  # Change to production URL in production
NEXTAUTH_URL=http://localhost:3000

# Admin Configuration
MASTER_ADMIN_EMAIL=yyoukhanaa@gmail.com

# Invitation Configuration
INVITATION_EXPIRY_DAYS=7        # How long invitations are valid
```

**Status**: ⏳ Not added yet

---

## Dependencies Added

### NPM Packages Installed
Track all new dependencies here:

- [ ] `next-auth@beta` - NextAuth v5
- [ ] `@auth/upstash-redis-adapter` - Redis adapter for NextAuth
- [ ] `@auth/core` - Auth.js core
- [ ] `@tanstack/react-table` - Data tables
- [ ] Shadcn UI components (via CLI, no package.json changes)

**Last Updated**: _Not yet_

---

## File Structure

### Created Files Checklist

#### Authentication
- [ ] `/app/api/auth/[...nextauth]/route.ts`
- [ ] `/lib/auth.ts`
- [ ] `/lib/auth-config.ts`
- [ ] `/middleware.ts`

#### Admin Dashboard
- [ ] `/app/admin/layout.tsx`
- [ ] `/app/admin/page.tsx`
- [ ] `/app/admin/users/page.tsx`
- [ ] `/app/admin/users/actions.ts`
- [ ] `/app/admin/invitations/page.tsx`
- [ ] `/app/admin/invitations/actions.ts`

#### Components
- [ ] `/components/admin/sidebar.tsx`
- [ ] `/components/admin/user-nav.tsx`
- [ ] `/components/admin/stats-card.tsx`
- [ ] `/components/admin/user-table.tsx`
- [ ] `/components/admin/invite-form.tsx`
- [ ] `/components/admin/invitation-table.tsx`
- [ ] `/components/admin/edit-user-dialog.tsx`
- [ ] `/components/admin/delete-user-dialog.tsx`
- [ ] `/components/auth/signin-form.tsx`
- [ ] `/components/ui/*` (Shadcn components)

#### Library/Utilities
- [ ] `/lib/rbac.ts`
- [ ] `/lib/redis-auth.ts`
- [ ] `/lib/invitations.ts`

#### Email Templates
- [ ] `/emails/invitation-email.tsx`

#### Auth Pages
- [ ] `/app/auth/signin/page.tsx`
- [ ] `/app/auth/signup/[token]/page.tsx`

---

## Progress Timeline

| Date | Phase | Status | Notes |
|------|-------|--------|-------|
| 2025-10-25 | Planning | ✅ Completed | Created implementation plan |
| _TBD_ | Phase 1 | 🔴 Not Started | Authentication setup |
| _TBD_ | Phase 2 | 🔴 Not Started | Admin dashboard UI |
| _TBD_ | Phase 3 | 🔴 Not Started | User management & RBAC |
| _TBD_ | Phase 4 | 🔴 Not Started | Invitation system |
| _TBD_ | Phase 5 | 🔴 Not Started | Security & protection |
| _TBD_ | Phase 6 | 🔴 Not Started | Testing & polish |

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
- **2025-10-25**: Chose NextAuth v5 over Clerk for cost savings and full control
- **2025-10-25**: Chose Shadcn UI + TanStack Table over React-Admin for lightweight bundle
- **2025-10-25**: Decided to use Upstash Redis for user storage (already in use)

### Deviations from Plan
_Document any changes to the original plan here_

- None yet

---

## Next Steps

### Immediate Next Actions
1. Start Phase 1: Install NextAuth v5 dependencies
2. Configure NextAuth with Upstash Redis adapter
3. Set up email provider with Resend
4. Create basic authentication routes

### Future Enhancements (Post-MVP)
- Add activity/audit log viewer in admin dashboard
- Add email preferences for users
- Add two-factor authentication (2FA)
- Add user profile editing
- Add bulk user operations
- Add export users to CSV
- Add invitation templates
- Add custom email branding
- Add admin notifications for new signups
- Add analytics dashboard

---

## Resources & Documentation

### NextAuth v5 Documentation
- Main docs: https://authjs.dev/
- Upstash adapter: https://authjs.dev/reference/adapter/upstash-redis
- Next.js integration: https://authjs.dev/reference/nextjs

### Shadcn UI Documentation
- Main docs: https://ui.shadcn.com/
- Installation: https://ui.shadcn.com/docs/installation/next
- Components: https://ui.shadcn.com/docs/components

### TanStack Table Documentation
- Main docs: https://tanstack.com/table/latest
- React Table: https://tanstack.com/table/latest/docs/framework/react/react-table

### React Email Documentation
- Main docs: https://react.email/
- Components: https://react.email/docs/components

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
2. Read this file to understand admin implementation progress
3. Check the "Progress Timeline" to see what's been completed
4. Review "Known Issues & Blockers" for context
5. Continue from the next uncompleted phase
6. **Remember to update this file as you work!**

---

**Last Updated**: 2025-10-25
**Updated By**: Claude (Initial creation)
**Current Phase**: Planning Complete, Ready to Start Phase 1
