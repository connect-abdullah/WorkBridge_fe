# WorkBridge

**A client collaboration and project management platform for freelancers, agencies, and service-based teams.**

WorkBridge is not a marketplace like Fiverr or Upwork. It does not help you find clients. It helps you **manage and collaborate with clients** after you acquire them—from LinkedIn, Twitter, referrals, direct outreach, or anywhere else.

---

## Problem Statement

Freelance and agency workflows are fragmented across too many tools:

- Conversations scattered across WhatsApp, Slack, email, and Discord
- Files split between Google Drive, Dropbox, and local folders
- Milestones tracked inconsistently, with weak or missing approval flows
- Little transparency for clients on progress and deadlines
- Constant follow-ups: *“Any update?”*, *“Where are we?”*, *“Can you send the file again?”*

The result is friction, mistrust, and operational overhead—especially as you scale beyond a handful of clients.

---

## Solution

WorkBridge centralizes the entire client collaboration workflow into a **single dedicated workspace per project**.

Each project becomes a structured hub where freelancers and clients share context, track delivery, and stay aligned—without juggling five different apps.

**Core objectives:**

- Eliminate scattered communication
- Reduce repetitive client follow-ups
- Improve trust through transparency
- Keep all project resources in one place
- Simplify freelancer–client collaboration
- Provide a professional operational layer for service businesses

---

## Features

| Area | Capabilities |
|------|----------------|
| **Projects** | Create and manage engagements with budgets, timelines, status, and nested milestones/tasks |
| **Milestones** | Define deliverables, track progress, client approval/rejection flows |
| **Messaging** | Project-scoped chat with real-time delivery, read receipts, and file references |
| **Files** | Upload and attach assets; reference files inline in messages |
| **Meetings & notes** | Schedule meetings and capture project notes |
| **Payments** | Request, track, and reconcile milestone-linked payments (role-aware views) |
| **Notifications** | In-app alerts for project, milestone, payment, message, and invite events |
| **Client invites** | Single-use invite links for clients to join a project workspace |
| **Dashboard** | Role-specific KPIs, recent projects, and activity feed |
| **Access control** | Freelancer vs client roles with permission-gated UI and API enforcement |

---

## Tech Stack

### Frontend (this repository)

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, Radix UI primitives |
| Data fetching | TanStack React Query |
| HTTP client | Axios |
| Forms | React Hook Form + Zod |
| Real-time | WebSocket (project chat) |
| Runtime | Bun or Node.js |

### Backend (companion service)

| Layer | Technology |
|-------|------------|
| API | FastAPI (Python) |
| ORM | SQLAlchemy |
| Migrations | Alembic |
| Database | PostgreSQL |
| Auth | JWT (access + refresh) |
| Real-time | WebSockets + Redis pub/sub (multi-worker delivery) |
| Cache | In-process cache layer (dashboard, lists, etc.) |

> The API is documented in [`src/lib/API.md`](src/lib/API.md). Swagger is available at `/docs` on the backend when running locally.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser / Client                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Next.js 15 (WorkBridge Frontend)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │ App Router  │  │ Middleware   │  │ React Query + UI        │ │
│  │ (RSC/SSR)   │  │ (route guard)│  │ (client islands)        │ │
│  └─────────────┘  └──────────────┘  └─────────────────────────┘ │
│                              │                                   │
│              /api/v1/*  catch-all BFF proxy                      │
└──────────────────────────────┼───────────────────────────────────┘
                               │ INTERNAL_API_URL
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (/api/v1)                     │
│  Routes → Services → SQLAlchemy → PostgreSQL                     │
│  WebSocket /ws/chat  +  Redis pub/sub (message fan-out)          │
└─────────────────────────────────────────────────────────────────┘
```

**BFF proxy pattern:** The browser calls same-origin `/api/v1/*`. Next.js forwards requests to FastAPI using `INTERNAL_API_URL`, so auth cookies stay first-party and CORS stays simple.

---

## Authentication & Authorization

- **Login / signup** via JWT; tokens stored in HttpOnly cookies (`access_token`, `refresh_token`).
- **Edge middleware** performs presence-only route protection; authoritative auth is enforced by the API on every request.
- **Roles:** `freelancer` and `client`—UI and endpoints adapt by role (e.g. payments sent vs received, milestone approvals).
- **Project access:** Users only see projects where they are the assigned freelancer or client.

---

## Project Workflow

1. **Freelancer** creates a project (optionally with milestones, tasks, and an assigned client).
2. **Client** is invited via email lookup or a single-use invite link (`/join-project`).
3. Both parties collaborate in the project workspace:
   - **Overview** — status, budget, timeline
   - **Milestones** — deliverables, approvals, progress
   - **Messages** — contextual project chat
   - **Files** — shared assets
   - **Meetings & notes** — coordination and documentation
   - **Payments** — requests and reconciliation
   - **Activity** — audit-style event feed
4. **Notifications** surface important changes; users navigate directly to the relevant project or section.

---

## Database Design

PostgreSQL holds the source of truth. Core entities include:

- **Users** — freelancers and clients (`role` enum)
- **Projects** — engagement container (`freelancer_id`, `client_id`, amounts, dates, status)
- **Milestones & tasks** — structured delivery breakdown
- **Messages** — project-scoped chat with delivery/read status
- **Files** — metadata + storage paths (e.g. Supabase)
- **Payments** — milestone-linked payment records and statuses
- **Notifications** — typed events with optional `notification_data` payloads
- **Activity logs** — cross-project audit trail

Schema evolves via Alembic migrations in the backend repository.

---

## API Structure

All versioned routes live under **`/api/v1`**.

| Domain | Prefix | Examples |
|--------|--------|----------|
| Users | `/users` | signup, login, profile |
| Projects | `/projects` | CRUD, list with milestones |
| Milestones / tasks | `/milestones`, `/tasks` | nested project work |
| Messages | `/messages` | send, list, mark-read |
| Files | `/files` | upload, list by project |
| Payments | `/payments` | request, approve, list |
| Notifications | `/notifications` | list, mark-read, unread count |
| Invites | `/invite` | lookup, create, accept |
| Dashboard | `/dashboard` | role-aware summary |
| WebSocket | `/ws/chat` | real-time chat (`?token=JWT`) |

Responses use a consistent envelope: `{ success, message, data, errors }`.

See [`src/lib/API.md`](src/lib/API.md) for endpoint and schema details.

---

## Real-time Features

- **Project chat** connects over WebSocket while the Messages tab is active.
- **Message send** persists via REST; the backend publishes to **Redis** so any API worker can deliver to the connected client.
- **Read receipts** update message status when the recipient views new messages.
- **Notifications** use REST + React Query (with polling on key surfaces); optimistic updates on mark-read.

---

## Scalability Considerations

| Concern | Approach |
|---------|----------|
| API horizontal scaling | Stateless FastAPI workers; shared PostgreSQL |
| WebSocket delivery | Redis pub/sub fan-out to the worker holding the user’s socket |
| Caching | Short-TTL in-memory cache for dashboard and list endpoints; invalidate on writes |
| Frontend | Static/SSR from Next.js; CDN-friendly assets; React Query reduces redundant fetches |
| File storage | External object storage (e.g. Supabase) to keep API servers stateless |

---

## Setup Instructions

### Prerequisites

- **Bun** or **Node.js** 18+
- Running **WorkBridge backend** (FastAPI + PostgreSQL + Redis)
- Environment file (see below)

### Frontend

```bash
# Install dependencies
bun install
# or: npm install

# Copy and configure environment
cp .env.example .env.local

# Start development server
bun run dev
# → http://localhost:3000
```

### Backend (companion repo)

Run the FastAPI service separately (Docker Compose recommended):

```bash
# From WorkBridge_bk
docker compose -f docker-compose.local.yml up --build
# API → http://localhost:8000
# Docs → http://localhost:8000/docs
```

Point the frontend at the backend via `INTERNAL_API_URL` (see below).

### Production build

```bash
bun run build
bun run start
```

---

## Environment Variables

Create `.env.local` in the project root:

| Variable | Required | Description |
|----------|----------|-------------|
| `INTERNAL_API_URL` | **Yes** (server) | FastAPI base URL for the BFF proxy and server-side calls (e.g. `http://localhost:8000`) |
| `NEXT_PUBLIC_DEVELOPMENT` | Optional | Set to `"true"` in local dev for fallbacks |
| `NEXT_PUBLIC_DEV_URL` | Optional | Dev API URL fallback when `INTERNAL_API_URL` is unset |
| `NEXT_PUBLIC_BACKEND_URL` | Optional | Production API URL fallback |
| `NEXT_PUBLIC_SITE_URL` | Optional | Canonical site URL (metadata, links) |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL (file storage) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anon key |

**Important:** Never expose `INTERNAL_API_URL` as `NEXT_PUBLIC_*`—it must remain server-only.

### Example `.env.local`

```env
INTERNAL_API_URL=http://localhost:8000
NEXT_PUBLIC_DEVELOPMENT=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional — file uploads
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Repository Layout (frontend)

```
src/
├── app/                 # Next.js App Router (pages, layouts, API proxy)
├── components/          # UI, dashboard, project-detail, notifications, …
├── hooks/               # React hooks (chat socket, notifications, auth)
├── lib/
│   ├── apis/            # Typed API clients per domain
│   ├── queryApi.ts      # React Query keys + option builders
│   └── server-api/      # Server-only fetch helpers
├── constants/           # Theme tokens, copy, enums
└── middleware.ts          # Route protection (cookie presence)
```

---

## Future Improvements

- [ ] Unified search across projects, messages, and files
- [ ] Email digests for milestone and payment events
- [ ] Richer client onboarding (branded invite pages, SSO)
- [ ] Mobile-optimized messaging and approvals
- [ ] Invoice PDF generation and accounting integrations
- [ ] Team/agency workspaces (multiple freelancers per project)
- [ ] Analytics: delivery velocity, revenue, client health scores

---

## Vision

WorkBridge aims to become the **operational layer** for independent professionals and small agencies—the place where client relationships live after the handshake.

Not another gig marketplace. Not another generic PM tool bolted onto chat.

A purpose-built workspace where:

- Clients always know where things stand
- Freelancers spend less time chasing updates
- Every project has one source of truth

**Build trust through transparency. Deliver work without the chaos.**

---

## License

Proprietary. All rights reserved unless otherwise stated by the project owner.
