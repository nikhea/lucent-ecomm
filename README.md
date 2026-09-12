# LUCENT — Headless Commerce Storefront

LUCENT is a production-ready ecommerce experience built on **Next.js 16 (App Router)** and
**Payload CMS 3** — a conversion-focused storefront with a full admin back office for
products, orders, customers, content, and support flows. It started from the official
Payload ecommerce template and has been extended into a complete, branded retail app.

**Live areas:** shop with faceted search · product pages with variants, reviews & stock states ·
cart drawer + cart page · multi-step checkout (contact → address → Stripe payment) ·
customer accounts, addresses, wishlist · order tracking, invoices (PDF), re-order and returns ·
CMS-managed info pages (About, FAQ, Privacy, Terms, Returns, Contact, Shipping) · dark mode.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Seeding](#seeding)
- [Project structure](#project-structure)
- [Storefront guide](#storefront-guide)
- [Managing the store (admin / CRM)](#managing-the-store-admin--crm)
- [Payments (Stripe)](#payments-stripe)
- [Invoices (PDF)](#invoices-pdf)
- [Returns flow](#returns-flow)
- [Reviews flow](#reviews-flow)
- [Caching & revalidation](#caching--revalidation)
- [Scripts](#scripts)
- [Tests](#tests)
- [Production & deployment](#production--deployment)
- [Troubleshooting](#troubleshooting)

---

## Features

### Shop & discovery

- **Shop page** (`/shop`) with URL-synced filters (category, brand, size, price, rating,
  features), sorting, pagination and search — shareable/filterable links via `nuqs`.
- **Product pages** (`/products/[slug]`) with variant selection (size/color), gallery,
  inventory-aware states (in stock / low stock / out of stock / select-a-size),
  related products, specifications, and ratings summary.
- **Dark mode** throughout (next-themes), including a Stripe Payment Element theme that
  matches the site's dark card/input colors.

### Cart & checkout

- **Cart drawer** (slide-over, available site-wide) + full **cart page** (`/cart`) with
  quantity steppers, stock validation, blocked-checkout messaging, and order summary.
- **Stock-aware checkout guard** — out-of-stock lines block checkout until removed.
- **Multi-step checkout**: contact → address → payment → confirmation, with progress
  indicator, guest checkout, saved addresses for members, and order confirmation emails.
- **Stripe payments** via Payment Element (cards, Link, Cash App Pay) with server-side
  PaymentIntents and webhook fulfillment (`/api/payments/stripe/webhooks`).

### Customer accounts

- **Split-screen luxury auth** (`/login`, `/create-account`, `/forgot-password`) rendered
  without the site header/footer, with password visibility toggles and loading states.
- **Account dashboard** (`/account`): profile details, size profile, preferences,
  password change.
- **Addresses** (`/account/addresses`): full CRUD of shipping/billing addresses.
- **Orders** (`/orders`): Delivered / Processing / Cancelled tabs, period filter,
  per-item actions (Buy it again, Write a review in a dialog, invoice modal).
- **Order details** (`/orders/[id]`): fulfillment timeline, shipments, order summary,
  working invoice download, one-tap **Reorder**, and **Start a return**.
- **Wishlist** (`/wishlist`): save-for-later with price-drop/almost-gone badges,
  bulk add-to-cart, share-list link.
- **Guest order lookup** (`/find-order`): email + order ID → secure access link
  (access-token flow, no account needed).

### Post-purchase

- **Invoice modal** on every order with full breakdown + **serverless-safe PDF download**
  (`@react-pdf/renderer` in a Node route handler — no browser binary).
- **Reorder** re-adds the original variants/quantities with per-item failure handling.
- **Return requests**: dialog (items, quantities, reason, comments) → `return-requests`
  collection in the admin with pending/approved/rejected/completed workflow and 30-day
  window enforcement.
- **Reviews**: verified-purchase gating, one review per customer per product,
  admin moderation queue, star input, helpfulness votes.

### Content (all CRM-editable)

- CMS **Pages** with layout builder (hero, content, media, forms, product showcases…)
  rendered at `/[slug]`, with SEO meta per page.
- Ready-made info pages: **About Us, FAQ (incl. shipping details), Privacy Policy,
  Terms of Service, Returns, Contact** (with working contact form).
- **Header/Footer globals** with nav, newsletter, socials and link columns — edits
  revalidate instantly via cache tags.

---

## Tech stack

| Layer        | Choice                                                        |
| ------------ | ------------------------------------------------------------- |
| Framework    | Next.js 16 App Router, React 19, TypeScript                   |
| CMS / Admin  | Payload CMS 3 (MongoDB adapter, Lexical rich text, SEO plugin) |
| Commerce     | `@payloadcms/plugin-ecommerce` (products, variants, carts, orders, transactions, addresses) |
| Payments     | Stripe (Payment Element, PaymentIntents, webhooks)            |
| PDF          | `@react-pdf/renderer` (server-side, serverless-safe)          |
| Styling      | Tailwind CSS 4, shadcn/ui (Radix), Lucide icons, dark mode    |
| State/URL    | zustand (cart, wishlist), nuqs (URL-synced shop filters)      |
| Forms/Email  | react-hook-form, Payload form-builder, nodemailer             |
| Media        | Cloudinary (via payload-cloud-storage plugin)                 |
| Tests        | Vitest (integration), Playwright (e2e)                        |

---

## Quick start

Prerequisites: Node 18.20+ or 20.9+ (see `engines`), pnpm, a MongoDB database
(local `mongod` or Atlas).

```bash
git clone <this-repo> lucent
cd lucent
cp .env.example .env        # then fill in values (see below)
pnpm install
pnpm dev                    # http://localhost:3000
```

Open `http://localhost:3000/admin` and create your first user — the first user
becomes admin automatically.

> The dev server must be **restarted** after changing `src/payload.config.ts`
> (collections/globals load once at boot). Frontend file changes hot-reload.

---

## Environment variables

Copy `.env.example` to `.env`. Required groups:

| Variable | Purpose |
| -------- | ------- |
| `PAYLOAD_SECRET` | Payload session encryption (`openssl rand -hex 32`) |
| `DATABASE_URL` | Mongo connection string (`mongodb://127.0.0.1/lucent` locally) |
| `NEXT_PUBLIC_SERVER_URL` / `PAYLOAD_PUBLIC_SERVER_URL` | Public base URL — must match in prod (SEO, Stripe webhooks, emails) |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOKS_SIGNING_SECRET` | Stripe (use `stripe listen --forward-to localhost:3000/api/payments/stripe/webhooks` locally) |
| `EMAIL_ADDRESS`, `EMAIL_PASSWORD`, `EMAIL_SERVICE` | Order confirmations, password resets, guest access links |
| `CLOUDINARY_URL` / `CLOUD_*` | Product/media uploads |
| `PREVIEW_SECRET` | Draft preview links |

Never commit real secrets — `.env` is git-ignored.

---

## Seeding

> ⚠️ The main seed (`POST /next/seed`, admin only) **wipes the database** and
> rebuilds demo products, pages, forms and users. Only use it for fresh setups.

Non-destructive, safe to re-run anytime:

| Endpoint (admin `POST`) | What it does |
| ----------------------- | ------------ |
| `/next/seed-info-pages` | Creates missing info pages (about, FAQ, privacy, terms, returns, contact, shipping) with professional copy + SEO meta; upgrades contact with the contact form; fills empty footer link columns. **Never overwrites existing pages.** |

Demo customer (main seed): `customer@example.com` / `password`.

---

## Project structure

```
src/
├── app/
│   ├── (app)/                 # storefront routes
│   │   ├── shop/              # faceted product listing
│   │   ├── products/[slug]/   # product pages
│   │   ├── cart/              # cart page
│   │   ├── checkout/          # contact → address → payment → confirm
│   │   ├── login|create-account|forgot-password|logout/
│   │   ├── (account)/         # account, addresses, orders, orders/[id]
│   │   ├── wishlist/ find-order/
│   │   ├── [slug]/            # CMS pages (about, faq, privacy, …)
│   │   ├── api/
│   │   │   ├── orders/[id]/invoice/  # owner-checked invoice PDF
│   │   │   ├── returns/              # return-request creation
│   │   │   ├── review-eligibility/   # purchase verification
│   │   │   └── reviews|payments/stripe/…
│   │   └── next/seed*         # admin-only seed endpoints
│   └── (payload)/             # admin UI + Payload REST/GraphQL
├── blocks/                    # page-builder blocks (hero, content, promos…)
├── collections/               # Users, Pages, Products, Reviews, ReturnRequests, …
├── components/
│   ├── auth/                  # AuthShell (standalone auth layout)
│   ├── cart/ orders/ wishlist/ checkout/ product/ shop/
│   ├── forms/                 # Login, Account, Address, Review, Checkout…
│   └── ui/                    # shadcn/ui primitives
├── globals/                   # Header, Footer (+ instant-revalidate hooks)
├── endpoints/seed/            # seed data incl. info-pages
├── store/                     # zustand cart + wishlist stores
├── providers/                 # Auth, Theme, Checkout context
└── payload.config.ts          # collections, globals, plugins, email, jobs
```

---

## Storefront guide

- **Shop** — filters live in the URL (`?brands=…&sizes=…&minPrice=…`); sort and
  pagination included. Product cards show badges (sale/new/bestseller), ratings,
  variant-aware pricing and stock states.
- **Product page** — pick size/color to resolve the exact variant, inventory and
  price; quantity + Add to bag; wishlist heart; tabs for details/shipping/reviews.
- **Cart** — drawer for quick edits, `/cart` for full review. Lines with no stock
  show a muted-red notice and block checkout until removed ("Remove all unavailable").
- **Checkout** — requires contact + address steps first (guards redirect otherwise);
  payment step mounts Stripe's Payment Element themed to the site; success clears
  the cart and shows confirmation with order number.
- **Auth pages** hide the global header/footer and use their own minimal bar —
  this is handled by `SiteChrome`, which also skips top padding on auth routes.

---

## Managing the store (admin / CRM)

Open `/admin` (admin role required):

- **Products / Variants / Categories / Collections** — catalog, pricing per currency,
  inventory, galleries, related products.
- **Orders / Transactions / Carts** — fulfillment tracking, payment records.
  Guests are identified by email + `accessToken`.
- **Reviews** — moderation queue (`pending → approved/rejected`); only approved
  reviews render, and only verified buyers can submit.
- **Return Requests** (`Commerce` group) — approve/reject/complete customer returns.
- **Pages** — edit every info page's copy, hero and SEO; changes revalidate the
  frontend immediately.
- **Header / Footer globals** — nav, quick links, legal links, newsletter, socials.
- **Users / Customer Profiles / Wishlists / Coupons / Notifications / Media / Forms.**

---

## Payments (Stripe)

1. Set the three `STRIPE_*` env vars.
2. Local webhooks: `pnpm stripe-webhooks`
   (forwards to `/api/payments/stripe/webhooks`).
3. The checkout creates a PaymentIntent server-side; the transaction/order is
   finalized in the webhook handler — **always test with webhooks running**,
   otherwise orders stay pending.
4. Publishable key is loaded once (`loadStripe`) and the Payment Element inherits
   the site theme (light + dark palettes are mapped explicitly in
   `checkout/payment/page.tsx` and `CheckoutPage.tsx`).

---

## Invoices (PDF)

- The **View invoice** modal shows the full breakdown; **Download PDF** calls
  `GET /api/orders/:id/invoice`, which owner-checks (login **or** guest
  email + access token) and renders `InvoiceDocument` with `@react-pdf/renderer`.
- Serverless-safe by design: pure-JS rendering, `runtime = 'nodejs'`,
  `serverExternalPackages`, built-in Helvetica (no remote font fetching —
  the usual cold-start failure), in-memory buffer, no filesystem use.

---

## Returns flow

1. Customer clicks **Start a return** → dialog with order lines, quantity steppers,
   reason select and comments.
2. `POST /api/returns` validates ownership, the **30-day window**, and that items
   belong to the order (quantities clamped to purchased amounts).
3. A `return-requests` doc is created as `pending` (customers can never set status).
4. Admin reviews in `/admin` → approves/rejects/completes; refund/replacement is
   handled manually (e.g. in Stripe).

---

## Reviews flow

1. Product page and order items open the review dialog (stars, title, comment).
2. `/api/review-eligibility` confirms the signed-in user purchased the product.
3. Submissions land in `reviews` as `pending`; one review per customer per product
   (updates re-queue for approval); only `approved` reviews render publicly.

---

## Caching & revalidation

- Footer/Header globals use `unstable_cache` tagged `global_<slug>`; `afterChange`
  hooks (`src/globals/hooks/revalidateGlobal.ts`) revalidate instantly on admin edits.
- Pages revalidate on publish via `revalidatePage`; info-page seeds write with
  `disableRevalidate` and rely on on-demand paths.
- Shop filters are URL state — shareable and back-button safe.

---

## Scripts

| Command | Purpose |
| ------- | ------- |
| `pnpm dev` | Dev server (Next + Payload admin) |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` / `pnpm lint:fix` | ESLint |
| `pnpm generate:types` / `generate:importmap` | Regenerate Payload types/import map (run after collection changes) |
| `pnpm payload` | Payload CLI (`migrate:create`, `migrate`, …) |
| `pnpm stripe-webhooks` | Forward Stripe webhooks locally |
| `pnpm test` / `test:int` / `test:e2e` | Vitest + Playwright |

Typecheck: `./node_modules/.bin/tsc --noEmit` (known pre-existing errors in
`CartModal.tsx` and `generatePreviewPath.ts` predate this work).

---

## Production & deployment

1. `pnpm build && pnpm start`.
2. Set production env: Atlas `DATABASE_URL`, public URLs, live Stripe keys +
   webhook endpoint, transactional email provider (Resend/SendGrid recommended
   over Gmail), Cloudinary production preset.
3. MongoDB needs no migrations (schemaless). If you switch to Postgres, run
   `pnpm payload migrate:create` locally and `pnpm payload migrate` on the server.
4. Deployable anywhere Node runs (VPS, Render, Railway, Coolify) or Payload Cloud;
   on Vercel note cron limits for scheduled publishing and keep PDF generation
   on the Node runtime (already configured).

---

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| New collection missing in admin | **Restart the dev server** — collections load once at boot |
| Stale header/footer after CRM edit | Hard-refresh; hooks revalidate tags automatically — check the tag key version in `getGlobals.ts` |
| Orders stuck pending | Stripe webhooks not running/reachable — start `pnpm stripe-webhooks` |
| `/api/.../invoice` 401/403 | Logged out (or wrong guest token) — sign in or use the emailed access link |
| Return rejected as outside window | 30-day policy enforced server-side; adjust in `api/returns/route.ts` if policy changes |
| `pnpm` triggers unwanted installs | Use `./node_modules/.bin/<bin>` directly (corepack quirk in this repo) |
| Seeded pages 404 | Run `POST /next/seed-info-pages` as admin; footer links live in the Footer global |
