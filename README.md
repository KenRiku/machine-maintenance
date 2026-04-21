# MechTrak — Machine Maintenance as a Service

MechTrak is a prototype CMMS (Computerized Maintenance Management System) for
factories, warehouses, and industrial facilities. Enroll every machine you
own, track preventive maintenance schedules, log repairs with full service
history, and talk to an AI repair assistant that knows each machine's specs
and history — all from one dashboard.

## What's built

- **Machine registry** — enroll machines, generate QR tags, browse by search / status
- **Preventive maintenance schedules** — create PM cadences; work orders auto-spawn
- **Work orders** — `OPEN → IN_PROGRESS → COMPLETED`; completion writes a permanent service log
- **Service history** — chronological ledger of every log and open work order per machine
- **Parts catalog & cart** — browse compatible parts, simulate an order
- **AI repair assistant** — per-machine chat backed by Claude, with machine specs, recent
  service history, open work orders, and compatible parts injected into the system prompt
- **Multi-facility auth** — organization + user accounts, JWT cookie sessions, scoped to `orgId`
- **Industrial UI** — dark panel layout, rust accents, QR rendering, monospace data tables

## Stack

- **Next.js 14** (App Router, TypeScript) + Tailwind CSS
- **Prisma 7** with **Neon Postgres** (serverless) via `@prisma/adapter-neon`
- **Anthropic Claude** (`@anthropic-ai/sdk`) for the AI assistant
- **JWT sessions** via `jose` (hand-rolled, no NextAuth needed for a prototype)
- **QR codes** via `qrcode` (client-side rendering to data URL)

## Run it locally

Prereqs: Node 18+ and a free [Neon](https://neon.tech) Postgres database and
an [Anthropic](https://console.anthropic.com) API key.

```bash
# 1. copy env template and fill in the three variables
cp .env.example .env.local

# 2. install + generate Prisma client
npm install

# 3. push schema to Neon
npm run db:push

# 4. seed demo data (org, user, 8 machines, PMs, parts, logs)
npm run db:seed

# 5. dev server
npm run dev
```

Demo login seeded by the script:

```
email:    demo@mechtrak.app
password: mechtrak2025
```

## Deploy

1. Push the repo to GitHub.
2. Import into **Vercel**. The framework is auto-detected (Next.js).
3. Set the three environment variables in Vercel → Project → Settings → Environment Variables:
   - `DATABASE_URL` — your Neon pooled connection string
   - `AUTH_SECRET` — any long random string (`openssl rand -base64 32`)
   - `ANTHROPIC_API_KEY` — your Anthropic API key
4. Deploy. `postinstall` runs `prisma generate` automatically on Vercel.
5. Optional: run the seed script once against production with
   `DATABASE_URL=<prod url> npm run db:seed`.

## Project layout

See [`CLAUDE.md`](./CLAUDE.md) for a developer walkthrough of the architecture,
key files, data flow, and known quirks.

## License

MIT — © 2026 Riku Kenju. See [LICENSE](./LICENSE).
