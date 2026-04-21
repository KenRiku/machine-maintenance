# CLAUDE.md

Developer context for AI-assisted editing sessions on **MechTrak**.

## What this project is

MechTrak is a prototype of a full-stack machine maintenance platform — a CMMS
("computerized maintenance management system") in the same conceptual category
as UpKeep, Fiix, or Limble. A facility manager enrolls machines, defines
preventive maintenance schedules, logs repairs with notes, simulates parts
orders, and talks to an AI assistant that has each machine's specs, history,
and open work orders loaded into its system prompt. The MVP is software-only —
no physical sensors, no real parts fulfillment.

## Architecture

```
app/
├── layout.tsx            # Root HTML, fonts, global CSS
├── page.tsx              # Public landing page (redirects to /dashboard if authed)
├── globals.css           # Tailwind + component layer + industrial aesthetic
├── login/                # Public login page + form
├── signup/               # Public signup page + form
├── (app)/                # Authenticated app group; layout guards with requireSession()
│   ├── layout.tsx        # Sidebar + topbar + CartProvider
│   ├── dashboard/        # KPIs, upcoming work orders, recent activity
│   ├── machines/         # Registry (list, detail, new)
│   │   └── [id]/tabs/    # Overview, Maintenance, History, Parts, AI Assistant
│   ├── work-orders/      # List + detail + completion flow
│   └── parts/            # Catalog + cart
└── api/                  # Route handlers (Node.js runtime, not Edge)
    ├── auth/             # signup / login / logout
    ├── machines/         # CRUD + nested schedules, work-orders, chat
    ├── work-orders/[id]  # PATCH for status transitions + completion
    └── part-orders/      # POST simulated orders

components/
├── shell/                # Sidebar, TopBar
└── cart/                 # CartProvider (localStorage-backed cart)

lib/
├── prisma.ts             # Prisma client singleton (Neon adapter)
├── session.ts            # JWT sign / verify / cookie helpers (jose)
├── auth.ts               # requireSession() / optionalSession() for server components
└── utils.ts              # cn(), date helpers, machineCode()

prisma/
├── schema.prisma         # All data models; no `url =` (set via prisma.config.ts)
└── seed.ts               # Demo org, user, 8 machines, schedules, 22 parts
prisma.config.ts          # Prisma 7 config: schema path + datasource URL
middleware.ts             # Edge-runtime JWT check; redirects unauth'd users to /login
```

### Why this structure

- **Route groups** (`app/(app)/`) let the whole authed area share a layout (sidebar
  + topbar + cart) without affecting the URL. Public pages live at the top
  level (`app/login`, `app/signup`, `app/page.tsx`).
- **Server components by default** — every page that reads from Prisma is a
  server component; only interactive pieces (forms, chat, tabs, filters) are
  `"use client"`.
- **Tabs on the machine detail page** are client-side with state, but all
  server data is hydrated in one query on the server to avoid a waterfall.
- **Edge-safe middleware** — middleware imports only `jose`. No Prisma / no
  Anthropic SDK there. Heavy checks happen in the (Node-runtime) route
  handlers via `getSession()`.

## Key files

| File | Role |
|---|---|
| `lib/prisma.ts` | Singleton Prisma client wired through `PrismaNeon` adapter. Dev-mode global cache to avoid hot-reload leaks. |
| `lib/session.ts` | JWT sessions: `signSession`, `verifySession`, `setSessionCookie`, `clearSessionCookie`, `getSession`. Cookie name `mechtrak_session`. |
| `lib/auth.ts` | Server-component helpers — `requireSession()` redirects to `/login` if unauth'd. |
| `middleware.ts` | Edge runtime. Only uses `jose` for the JWT check. Keeps bundle under Vercel's 1 MB limit. |
| `app/api/machines/[id]/chat/route.ts` | The AI assistant. Builds a rich system prompt (machine specs + recent service logs + open work orders + compatible parts), appends prior chat history, calls Claude, persists both the user and assistant messages. |
| `app/api/work-orders/[id]/route.ts` | Status transitions. On `COMPLETED` it writes a `ServiceLog`, advances the parent `MaintenanceSchedule`'s next-due-date, spawns the next PM work order, and flips the machine back to `OPERATIONAL` if no critical work remains. |
| `components/cart/CartProvider.tsx` | localStorage-backed client cart — survives navigation, cleared on successful order. |

## Data flow — a concrete example

**"Complete a work order" flow, end to end**

1. User clicks **Complete work order** on `/work-orders/[id]`.
2. `WorkOrderActions` (client) opens the completion form; user enters notes.
3. Submit → `PATCH /api/work-orders/[id]` with `{ status: "COMPLETED", completionNotes, partsUsed }`.
4. Route handler verifies session via cookie → loads the work order → verifies it's in the caller's org.
5. Updates the work order, then:
   - Creates a `ServiceLog` row referencing the work order, machine, and technician.
   - If the WO had a parent `MaintenanceSchedule`, advances its `nextDueDate` and spawns the next PM work order.
   - If the machine has no more critical (REPAIR/FAILURE) work orders, flips machine status back to `OPERATIONAL`.
6. Response → client calls `router.refresh()` → the same page re-renders (server component) and now shows the completion notes, and the machine's Service History tab shows the new ledger entry.

**"Ask the AI assistant" flow, end to end**

1. User types a question on the Assistant tab → `AssistantTab` POSTs to
   `/api/machines/[id]/chat`.
2. Route handler fetches the machine, the last 20 chat messages, the last 10
   service logs, open work orders, and compatible parts.
3. Persists the user message first.
4. Builds a system prompt with all of the above context baked in.
5. Calls Claude (model: `claude-haiku-4-5-20251001`) with the chat history.
6. Persists the assistant message.
7. Responds with both new messages; the client appends them to the list.

## Stack decisions

- **Next.js App Router + TypeScript** — server components read from Prisma
  directly; no separate API layer for reads. Client components handle UI state.
- **Prisma 7 with Neon serverless** — serverless-friendly Postgres that cold-starts
  fast on Vercel. The adapter pattern (`PrismaNeon`) is the Prisma 7 way; the
  datasource URL lives in `prisma.config.ts`, NOT in `schema.prisma`.
- **JWT sessions (jose) instead of NextAuth** — for a prototype, NextAuth is
  overkill. `jose` is tiny, works in the Edge runtime, and the flow is easy
  to read. The signed JWT rides in an httpOnly cookie.
- **Anthropic SDK** — the plan originally called for OpenAI; the project
  constraints require Anthropic, and Claude's quality on technical Q&A is
  excellent anyway.
- **No NextAuth / no Supabase** — keeps the dependency footprint small and
  the middleware Edge-safe.
- **Tailwind + custom component layer** (in `globals.css`) — no shadcn in this
  prototype; the industrial aesthetic is opinionated enough that a pre-baked
  library would fight the design.
- **Cart in localStorage** — the prototype simulates orders; no need for a
  server-side cart.

## Environment variables

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres pooled connection string. Read by `lib/prisma.ts` → `PrismaNeon` and by `prisma.config.ts` → `datasource.url`. |
| `AUTH_SECRET` | HMAC secret used by `jose` to sign & verify session JWTs. Must match between the signing code and the middleware. |
| `ANTHROPIC_API_KEY` | Claude API key. If missing, `app/api/machines/[id]/chat/route.ts` returns a canned placeholder rather than crashing, so demos still work without it. |

## How to run locally

```bash
npm install
cp .env.example .env.local
# fill in DATABASE_URL (Neon), AUTH_SECRET (random), ANTHROPIC_API_KEY (optional)
npm run db:push     # push schema to Neon
npm run db:seed     # demo org, user, parts, machines
npm run dev
```

Demo login: `demo@mechtrak.app` / `mechtrak2025`.

## Known quirks

- **Prisma 7 adapter** — if you see `"provider: postgresql but no adapter"` or
  similar, that's Prisma complaining. Every DB access path has to go through
  `new PrismaClient({ adapter: new PrismaNeon(...) })`. `lib/prisma.ts` does
  this once and caches; the seed script does the same thing inline.
- **Edge middleware bundle limit** — only `jose` is safe to import in
  `middleware.ts`. Do NOT add Prisma, Anthropic, or anything heavy in that
  file.
- **Chat on Vercel** — the Anthropic call runs in a Node.js runtime route
  with `maxDuration = 30`. If your Vercel plan caps the function shorter,
  responses may time out on the first request while the serverless function
  cold-starts.
- **Cart persistence is per-browser** — items live in localStorage.
- **QR codes encode JSON** — the data URL embeds `{ code, id, name }` so a
  future mobile scanner can deep-link directly to a machine.
- **Machine status transitions are opinionated** — `REPAIR` WOs flip machine
  to `MAINTENANCE`, `FAILURE` WOs flip to `DOWN`, and completion flips back to
  `OPERATIONAL` only when no critical work remains. If you want a different
  state machine, edit `app/api/work-orders/[id]/route.ts` and
  `app/api/machines/[id]/work-orders/route.ts`.

## What's NOT implemented

- **No IoT / sensor integration** — the plan mentions it; MVP is software-only.
- **No photo uploads** — `ServiceLog.photos` is stubbed out of the schema.
  Add an `images` field plus blob storage to wire it up.
- **No real parts fulfillment** — `/parts/cart` → POST `/api/part-orders`
  just persists a `PartOrder` row with status `SIMULATED`.
- **No technician dispatch / marketplace**.
- **No mobile-native app** — the web UI is responsive and tablet-friendly.
- **No multi-tenant billing**.
- **No organization invites** — each signup creates a new org and user;
  there's no UI to invite teammates.
- **No email verification / password reset** — prototype auth.
- **No voice-to-text / photo intake on log entries** — mentioned in the risk
  mitigation section; not built.
- **No cross-facility data aggregation** — the data moat is in the plan;
  nothing queries across orgs yet.
