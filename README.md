# AR Qudrix Platform — Monorepo

Production-grade corporate web application + client portal + admin control panel for AR Qudrix, architected as an ARQ OS–integrated system.

## Structure

```
apps/
  web/      → Single Next.js 15 app serving everything (see "Single-app deployment" below):
              - Public corporate site, locale-prefixed  /en/*  /ar/*
              - Client portal                            /en/portal/*  /ar/portal/*
              - Admin control panel                       /admin/*  (not locale-prefixed)
packages/
  db/       → Prisma schema + client (PostgreSQL)
  auth/     → Auth.js config (edge + full) + RBAC permission matrix
  domain/   → DDD application/service layer (Business, Lead, Content, User, Settings, Inquiry, Audit domains)
  ui/       → Shared shadcn/ui component library (49 components)
```

## Single-app deployment

Originally this was two separate Next.js apps (`apps/web` for the public site, `apps/admin` on its own subdomain) — the cleaner architecture, giving cookie isolation between the public site and the admin panel. It was merged into one app because the target Hostinger plan only provisions **one** Node.js Web App slot.

**What changed in the merge:**
- Admin pages moved from a separate app into `apps/web/app/admin/**`, with their own root layout (`app/admin/layout.tsx`) since `/admin` sits outside the locale-prefixed `[locale]` tree.
- Admin API routes moved into `apps/web/app/api/v1/**`, merged with the public API where paths overlapped (e.g. `POST /api/v1/leads` is the public contact-form submit; `GET /api/v1/leads` on the *same file* is the admin listing — Next.js Route Handlers can export multiple HTTP methods per file with independent auth per method).
- `middleware.ts` now branches on `/admin` vs locale-prefixed paths in one file.
- **Trade-off accepted:** the admin panel and public/portal site now share one cookie domain. Every mutation is still enforced by RBAC at the domain-service layer (`assertPermission()` in `packages/auth/src/rbac.ts`), and `app/admin/(dashboard)/layout.tsx` adds an explicit role gate (`ADMIN_SURFACE_ROLES`) so a non-staff session is redirected before it ever reaches an admin page. `/admin` is also `noindex`'d and sends `X-Frame-Options: DENY`.

**If you later get a second app slot** (or move to a VPS/Cloud plan), splitting `app/admin` back into its own Next.js app + subdomain is straightforward: move `app/admin/**` and the matching `api/v1/**` handlers into a new `apps/admin`, point it at `admin.arqudrix.com`, and remove the `/admin` branch from `apps/web/middleware.ts`. Nothing in `packages/*` needs to change — that's the whole point of keeping the domain/auth/db logic in shared packages instead of inside the app.

## What's implemented so far

- **Business Registry** — admin-managed "products as cards" (`/businesses` grid → `/businesses/[slug]` landing page), full CRUD + status workflow (ACTIVE/IN_DEVELOPMENT/PLANNED/ARCHIVED), audit-logged.
- **Blog / Content** — admin-managed posts (`/blog` listing → `/blog/[slug]`), Article JSON-LD, EN/AR per-post translations, DRAFT→PUBLISHED workflow.
- **Lead capture** — public contact form → `Lead` table, honeypot + IP-hash rate limiting; admin `/admin/leads` manages the full pipeline (NEW → CONTACTED → QUALIFIED → CONVERTED / ARCHIVED / SPAM), ready for future ARQ OS CRM sync.
- **Audit Logs** — `/admin/audit-logs`, filterable by entity type and action, read-only and immutable by design.
- **RBAC** — 10-role matrix, admin panel gated to EMPLOYEE and above (see "Single-app deployment" for how this is enforced without a separate cookie domain).
- **User management** — SUPER_ADMIN can change any user's role or suspend/reactivate their account (`/admin/users`); self-lockout is blocked at the service layer.
- **Client Portal** (`/[locale]/portal/*`) — self-registration (always CUSTOMER role; elevation to CLIENT/PARTNER/SUPPLIER/INVESTOR is admin-only), login, dashboard, inquiries, profile with self-service password change.
- **Static/company pages** — `/about`, `/careers`, `/partners`, `/investors`, `/privacy`, `/terms`, all EN/AR, linked from the footer.
- **Meta Pixel + Google Ads** — configured live from `/admin/integrations`, consent-gated, fires Lead / CompleteRegistration conversion events automatically.
- **i18n** — locale-prefixed routing (`/en`, `/ar`), RTL layout switching, Navbar language toggle.
- **SEO** — dynamic `sitemap.xml` (businesses + blog posts, both locales), `robots.txt` (disallows `/admin/`), Organization/Article/Product JSON-LD.

## Advertising & analytics (Meta Pixel + Google Ads)

Both are **configured entirely from `/admin/integrations`** (SUPER_ADMIN to edit) — not from `.env`. Marketing can turn a pixel on/off or rotate an ID with zero code changes and zero redeploy. Settings live in the `IntegrationSettings` table (`packages/domain/src/settings`) and are fetched server-side on every page load.

They are also **off by default and consent-gated**: even with a pixel ID configured and enabled, nothing loads in the browser until the visitor clicks "Accept" on the cookie banner (`components/cookie-consent-banner.tsx`) — required for GDPR/consent-mode compliance and what the Privacy Policy page promises.

**Setup:**
1. Sign in at `/admin/login` as a SUPER_ADMIN and go to **Integrations**.
2. Paste in your Meta Pixel ID (Meta Events Manager → Data Sources) and enable it.
3. Paste in your Google Ads tag ID (`AW-XXXXXXXXX`) and the lead/registration conversion labels (Google Ads → Tools → Conversions), and enable it.
4. Save — live on the public site immediately.

**How it works:**
- `packages/domain/src/settings/service.ts` — `getPublicSettings()` (no auth needed, IDs aren't secrets) is read by the public site; `getForAdmin()` / `update()` (SUPER_ADMIN-only, audit-logged) power the admin page.
- `apps/web/app/[locale]/layout.tsx` fetches settings server-side and passes them into `<AnalyticsScripts>` as props.
- `lib/analytics/consent.ts` is the single source of truth for consent state (localStorage-backed).
- `lib/analytics/state.ts` holds the current settings for client-side code (contact form, registration form) to read without prop-drilling.
- `lib/analytics/track.ts` exposes `trackLeadConversion()` and `trackRegistrationConversion()` — already wired into the contact form and registration form.
- `next.config.js` CSP headers explicitly allowlist `connect.facebook.net`, `googletagmanager.com`, etc. — extend that list if you add another platform later, or the browser will silently block it.

## Architecture note: Edge vs. Node.js Auth.js config

Next.js middleware runs on the Edge runtime by default, which cannot execute Node.js-only code (bcrypt's native bindings, Prisma's TCP driver). `packages/auth` is therefore split in two:

- `edge-config.ts` — session/JWT callbacks only, no providers. Used by `apps/web/lib/auth-edge.ts`, which `middleware.ts` imports.
- `config.ts` — extends the edge config with the Prisma adapter and Credentials provider (bcrypt included). Used by `apps/web/lib/auth.ts`, which every Route Handler, Server Component, and the admin dashboard layout imports.

**Do not import `@/lib/auth` (full config) inside `middleware.ts`** — it will fail on the Edge runtime. Always use `@/lib/auth-edge` there.

## Prerequisites

- Node.js ≥ 20
- A PostgreSQL database (Neon recommended — see "Database" below)

## Local Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, etc.
npm run db:generate
npm run db:migrate
npm run dev             # runs the single app on :3000 — public site, portal, and /admin all together
```

## Database — why Neon (external) instead of a local/Hostinger DB

Hostinger's Business and Cloud hosting plans do **not** offer native PostgreSQL — only MySQL. PostgreSQL requires a VPS plan there. To keep Row-Level Security–ready multi-tenant isolation and avoid a MySQL rewrite, this project uses an **external managed Postgres provider (Neon)**, reached over a normal outbound network connection from the Hostinger-hosted Node.js app.

1. Create a free project at https://neon.tech
2. Copy the connection string into `DATABASE_URL` in `.env`
3. Run `npm run db:migrate` to apply the schema

## Creating your first SUPER_ADMIN user

There is no public registration for admin roles (by design — see RBAC policy in `packages/auth/src/rbac.ts`). Seed one manually after your first migration:

```sql
-- Run against your Neon database (e.g. via Neon's SQL editor)
-- Password hash below is a placeholder — generate your own with bcrypt (cost 12).
INSERT INTO users (id, email, "fullName", role, status, "passwordHash", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'you@arqudrix.com',
  'Your Name',
  'SUPER_ADMIN',
  'ACTIVE',
  '$2a$12$REPLACE_WITH_A_REAL_BCRYPT_HASH',
  now(),
  now()
);
```

Then sign in at `https://arqudrix.com/admin/login` (not a separate subdomain — see "Single-app deployment").

## Deploying to Hostinger (1 Node.js app slot)

1. **Build locally first** to catch errors before deploying:
   ```bash
   npm run build --workspace=@arqudrix/web
   ```
2. In **hPanel → Websites → Node.js**, create one Node.js Web App pointed at this repo (GitHub connection recommended).
3. Set the **startup file** to `server.js` (generated automatically by Next.js `output: "standalone"` inside `.next/standalone/server.js`).
4. Add every variable from `.env.example` as an environment variable in hPanel.
5. Point `arqudrix.com` at this one app. `arqudrix.com/admin` is now reachable on the same domain — no subdomain or second app needed.
6. Every push to your connected branch triggers an automatic rebuild and redeploy.

### If you get a second app slot later

See "Single-app deployment" above for how to split the admin panel back out onto `admin.arqudrix.com` for cookie isolation — the shared `packages/*` logic doesn't need to change, only the app-level routing.

## Roles (RBAC)

`PUBLIC_USER · CUSTOMER · CLIENT · PARTNER · SUPPLIER · INVESTOR · EMPLOYEE · MANAGER · ADMIN · SUPER_ADMIN`

Only `EMPLOYEE` and above can use `/admin` at all — enforced both in `middleware.ts` (session exists) and `app/admin/(dashboard)/layout.tsx` (role check), with every mutation additionally gated at the domain-service layer. Full permission matrix lives in `packages/auth/src/rbac.ts` — the single file to review for any access-control audit.
