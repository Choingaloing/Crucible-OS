# Crucible OS

Crucible OS is a Next.js SaaS app for Crucible Coaching — a fractional CRO service for pest control companies ($1M–$15M ARR). The app handles marketing, AI-powered intake, CRO reports, client dashboards, and admin tooling.

For business context (pricing, voice, audience, frameworks), read `docs/CRUCIBLE_CONTEXT.md`.

## Tech Stack

- **Framework:** Next.js 14.2.18 (App Router), React 18, TypeScript (strict)
- **Database & Auth:** Supabase (PostgreSQL + Auth + RLS)
- **AI — Intake chat:** Google Gemini 2.5 Flash (`@google/generative-ai`) — NOT Anthropic
- **AI — Reports & offers:** Anthropic Claude (`@anthropic-ai/sdk`)
- **Payments:** Stripe (subscriptions + one-time payments, live mode)
- **CRM:** GoHighLevel (appointments, contacts, pipelines)
- **Styling:** Tailwind CSS 3 + Radix UI + shadcn components
- **Rich text:** TipTap (classroom content editor)
- **Charts:** Recharts
- **Drag & drop:** dnd-kit (kanban boards)
- **Deployment:** Vercel (auto-deploy from GitHub)

## Path Alias

`@/*` maps to the project root. Use `@/lib/...`, `@/components/...`, `@/types/...` etc.

## Project Structure

```
app/
  (marketing)/    — Public pages: landing, podcast, podcast intake
  (auth)/         — Login, signup
  (app)/          — Protected routes (requires auth)
    dashboard/    — Main client dashboard, report, settings
    dashboard/admin/        — Admin CRM, podcast mgmt, integrations
    dashboard/money-model/  — Offers, milestones, classroom
    dashboard/crucible-pro/ — Appointments, tasks, rocks, team, recordings
    intake/       — AI chat session (free tier)
  api/            — 39 API route handlers
components/       — Organized by feature (admin/, crucible-pro/, dashboard/, intake/, money-model/, settings/, shared/, ui/)
lib/              — Shared libraries
  supabase/       — client.ts (browser), server.ts (SSR), admin.ts (service role)
  claude/         — intake.ts, report.ts, offers.ts
  stripe/         — client.ts, webhooks.ts
  ghl/            — client.ts (GoHighLevel API wrapper)
  utils/          — cn.ts (classnames), metrics.ts (financial calculations)
  actions.ts      — Server actions (tags, profile, Crucible Pro grants)
hooks/            — useChat, useMetrics, useSubscription, useSidebarCollapsed, useSystemTheme
types/            — database.ts (auto-generated Supabase types), cruciblePro.ts, offer.ts, intake.ts
supabase/         — schema.sql + migrations/
docs/             — CRUCIBLE_CONTEXT.md, SETUP.md, MONEY_MODEL_PLAN.md
```

## Supabase Client Patterns

There are THREE Supabase client patterns — use the right one:

1. **`createClient()` from `@/lib/supabase/server`** — Server components & API routes. Uses cookies for auth. User-scoped (respects RLS).
2. **`createClient()` from `@/lib/supabase/client`** — Browser/client components. User-scoped.
3. **`supabaseAdmin` from `@/lib/supabase/admin`** — Singleton, NO cookies. Bypasses RLS. Use for admin operations and fire-and-forget contexts (after response is sent).

**Never** use the admin client where the server client would suffice. The admin client bypasses RLS.

## Auth & Middleware

- Middleware (`middleware.ts`) protects all routes except: `/`, `/login`, `/signup`, `/podcast/*`, `/api/podcast/*`
- Admin routes (`/dashboard/admin/*`) require `profiles.role = 'admin'`
- API routes check auth with: `const { data: { user } } = await supabase.auth.getUser()`
- Unauthorized = `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`

## API Route Pattern

All API routes follow this pattern:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // ... query with supabase (user-scoped via RLS)
  return NextResponse.json(data)
}
```

## Database

- Schema at `supabase/schema.sql`, migrations in `supabase/migrations/`
- Auto-generated types at `types/database.ts` — use `Tables<'table_name'>` for row types
- All tables have RLS enabled. Users see only their own data.
- Key tables: `profiles`, `business_metrics`, `intake_sessions`, `intake_messages`, `reports`, `subscriptions`, `offers`, `milestones`, `crucible_tasks`, `crucible_rocks`, `crucible_appointments`, `crucible_call_recordings`, `crucible_team_members`

## Streaming AI Responses

The intake chat (`/api/intake`) streams responses using `ReadableStream` with custom sentinels:
- `[CRUCIBLE_COMPLETE]` — signals conversation phase is done
- `[CRUCIBLE_ERROR:message]` — signals an error (NOT `controller.error()`, which drops TCP)
- `[METRIC_UPDATE:{"key":value}]` — inline metric extraction during streaming

## Stripe

- Checkout creates session via `/api/stripe/checkout` (supports `subscription` and `payment` modes)
- Webhook handler at `lib/stripe/webhooks.ts` handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Subscription data stored in `subscriptions` table

## GoHighLevel (GHL)

- API wrapper at `lib/ghl/client.ts` with `ghlFetch()` helper
- 5-minute in-memory cache for pipeline data
- Used for: calendar sync, contact management, pipeline/opportunity tracking

## Rate Limiting

AI-calling routes (`/api/intake`, `/api/report`, `/api/offers/generate`) use `@upstash/ratelimit` with a sliding window of 10 requests per 60 seconds per user. The shared utility is at `lib/ratelimit.ts`. Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars.

## Known Issues

- No test framework or test files exist
- No CI/CD pipeline (relies on Vercel auto-deploy)
- No error boundaries (`error.tsx` files)

## Commands

```bash
npm run dev    # Start dev server (localhost:3000)
npm run build  # Production build
npm run lint   # ESLint check
```

## Client Agreements (e-sign)

- Table `client_agreements` (migration `20260904_client_agreements.sql`). One row per agreement sent to a client; the unguessable `slug` is the credential.
- Public signing page: `app/(marketing)/agreements/[slug]/page.tsx` → `components/agreements/AgreementView.tsx` (document + signature pad). Public routes `/agreements/*` and `/api/agreements/*` are allowed in `middleware.ts`.
- Sign: `POST /api/agreements/[slug]/sign` (service-role write, one-shot, records signer name/title/date, PNG signature, IP, UA) and stamps `subscriptions.client_agreement_url` so the signed copy shows on the Crucible Pro billing tab.
- Admin: `POST /api/admin/agreements` creates a signing link (custom `slug` optional); the Billing tab's "New agreement" form calls it. Links always use `https://cruciblecoaching.org/agreements/<slug>` (override with `NEXT_PUBLIC_AGREEMENTS_BASE_URL`).
- Templates (`template` column): `pov_pro` (POV Pro retainer), `growth_systems` (website/SEO/outreach/Google Ads retainer, 30-day cancel), and `restoration_growth` (POV + Meta/Google ads + landing pages + reputation; optional `setup_fee` for month one; `pov_included`, `meta_ads_included`, `reputation_included` booleans (default true) toggle those sections and every sentence that references them; High-Intent Search + Tracking are always on; subtitle is built by `restorationSubtitle()`), and `launch_package` (one-time project: `monthly_fee` holds the TOTAL project fee and `setup_fee` the deposit due at signing, balance due within 30 days; body `LaunchBody`). Bodies live in `AgreementView.tsx` (`StandardBody` / `GrowthBody`), titles in `TEMPLATE_COPY` + `AGREEMENT_TEMPLATE_TITLE`; fee, dates, parties come from the row. `effective_on_signing` makes the Effective Date = the client's signature date (stamped by the sign route). Add a template: extend `AGREEMENT_TEMPLATES`, `AGREEMENT_TEMPLATE_TITLE`, `TEMPLATE_COPY`, the CHECK constraint, and a body component.

## Migo HQ (master-agent command view)

- Migo is Chandler's master agent (Crucible + personal); Moldy runs Mold Launch and reports up to Migo. They debrief Fathom calls, pull out promises, and route each task to the Claude project that owns it.
- Tables (migration `20261106_migo_hq.sql`, admin-only RLS; agents in other Claude projects read/write via the Supabase connector with the service role):
  - `migo_debriefs`: one row per call. Status `awaiting_approval → dispatched` (or `rejected`).
  - `migo_dispatch`: one row per promise/deliverable. Status `proposed → approved → in_progress → in_review → done` (also `blocked`, `cancelled`). `destination` is one of `crucible_clients | bos_app | mold_launch | migo | personal`; `business` is one of `crucible | mold_launch | personal`.
- Types/constants live in `types/migo.ts`. The tables aren't in the generated `types/database.ts`, so `lib/migo/admin.ts` exposes `migoDb()` (untyped service-role client) and `requireMigoAdmin()`; always run the admin check before using `migoDb()`.
- Routes: `PATCH /api/admin/migo/debriefs/[id]` `{ action: 'approve' | 'reject' }` (approve sets the debrief to `dispatched` and its still-`proposed` tasks to `approved`; reject cancels them). `PATCH /api/admin/migo/dispatch/[id]` accepts `status`, `destination`, `priority`, `due_date` and stamps `approved_at` / `completed_at`.
- Page: `/admin/migo` → `app/(app)/dashboard/admin/migo/page.tsx` → `components/admin/migo/MigoHQ.tsx` (agent tabs, stat row, approvals, open promises, shipped this week). Shows an amber "apply migration" notice if the tables can't be reached. Linked from `AdminNav`.

## Client Dashboards (Crucible Pro: Marketing + To-dos)

- Crucible Pro (`/dashboard/crucible-pro`) is the client dashboard. Tabs: Marketing, To-dos, Appointments, Recordings, Goals & Rocks, Billing. Admins switch clients with `ClientSelector`; clients only ever see their own data.
- **Marketing tab** (`components/crucible-pro/MarketingTab.tsx`) calls `GET /api/crucible-pro/marketing?user_id=&range=7|30|90|mtd`. `lib/marketing/summary.ts` pulls Google Ads (split into regular campaigns vs Local Services Ads by `advertising_channel_type`) and Google Business Profile (metrics, search keywords, reviews, posts, photos) from Windsor.ai via `lib/windsor.ts` (needs `WINDSOR_API_KEY`; responses cached 10 min). Windsor returns every connected account, so rows are filtered server-side to the client's accounts with `sameAccount()`. Clients get a generic message instead of raw Windsor errors.
- **Data sources:** table `client_data_sources` (migration `20261110_client_dashboards.sql`; admin all, client read own) maps a client to `google_ads_accounts[]`, `gbp_locations[]` (`locations/<id>`; a client can have several listings), and `gsc_property` (stored, not shown yet). Admins edit it in the Marketing tab's "Data sources" panel (`PUT /api/crucible-pro/data-sources`). IDs must match accounts connected in Windsor.
- **To-dos tab** (`components/crucible-pro/TodosTab.tsx`) is `migo_dispatch` rows with `client_id` = the client, statuses approved/in_progress/in_review/blocked/done (done kept 30 days). New columns: `assignee` (`crucible` | `client`) and `client_visible` (admin can hide an item). Routes `GET/POST /api/crucible-pro/todos`, `PATCH/DELETE /api/crucible-pro/todos/[id]` authorize with `resolveContext()` then use `migoDb()` and only return `CLIENT_TODO_COLUMNS` (never scope, source quotes or work log). Clients can add to and check off their own side; admins can edit everything live. Every change appends to `work_log`. The tab polls every 20s so both screens stay in sync on a call.
- **Rocks** (`GoalsTeamTab` → `RockRow`) can be added, edited inline, completed and deleted for the selected client.
- Login honors `?next=` (set by middleware on unauthenticated hits), so a shared dashboard link lands the client on it after sign-in. Crucible Pro clients otherwise land on `/dashboard/crucible-pro?tab=marketing`.
