---
name: nextjs-frontend
description: Implements and extends the ProjectSetups/NextJS_Template starter (Next.js 15 + TypeScript + Tailwind + React Query + Supabase + Axios). Use when building new features from this template, wiring API/auth flows with src/lib/https.ts, adding routes/layouts in src/app, and keeping template-specific conventions aligned.
---

# Next.js Frontend

## Quick start

- Dev: `bun run dev` (or `npm run dev` / `pnpm dev`)
- Format: `bun run format`
- Lint: `bun run lint`
- Test: `bun run test` (watch: `bun run test:watch`)
- Build: `bun run build`
- Pre-push check: `bun run validate` (lint + build)

## Current template structure (real repo state)

- **App router**
  - Present now: `src/app/layout.tsx`, `src/app/(main)/layout.tsx`, `src/app/(main)/page.tsx`, `src/app/globals.css`.
  - Root layout already wraps app with `QueryProvider`.
- **Components**
  - Present now: `src/components/layout/MainShell.tsx`, `src/components/ui/button.tsx`.
- **Lib utilities**
  - Present now: `src/lib/https.ts`, `src/lib/supabase.ts`, `src/lib/forceLogout.tsx`, `src/lib/providers/query-provider.tsx`, `src/lib/utils.ts`.
- **Not scaffolded yet**
  - No `src/lib/api/**`, `src/views/**`, `src/store/**`, `src/hooks/**`, or `src/types/**` currently in this template.
  - When adding them, keep them intentionally minimal and domain-first.

## Hard conventions from this template

- **HTTP and auth**
  - Use `src/lib/https.ts` helpers: `get/post/put/patch/del`.
  - Do not bypass `withPrefix`; endpoint calls should pass relative paths and let `API_PREFIX` (`/api/v1`) apply automatically.
  - Keep token source compatible with current key: `localStorage["auth:token"]`.
  - Keep logout compatibility with current clear keys:
    - `auth:token`, `auth:user`, `auth:refreshToken`, `persist:root`
  - Keep 401 behavior centralized (interceptor -> `forceLogout()`).
- **Query behavior**
  - Reuse QueryClient defaults from `query-provider.tsx`:
    - `staleTime: 30m`, `gcTime: 45m`, `retry: 1`
    - `refetchOnWindowFocus: false`
    - `refetchOnMount: false`
    - `refetchOnReconnect: false`
- **Styling**
  - Use design tokens from `globals.css` (`--background`, `--foreground`, etc.).
  - Use `cn(...)` helper for composed class names.
  - Reuse existing container/shell pattern from `MainShell`.
- **Path aliases**
  - Prefer `@/*` imports (configured in `tsconfig.json`).

## Repo conventions 

These reflect how API + React Query is implemented in this repo right now. When adding new endpoints or hooks, match this shape for consistency.

- **API response envelope**
  - Use `src/lib/apis/apiResponse.ts`:
    - `APIResponse<T> { success: boolean; message: string; data?: T | null; errors?: any | null }`
    - `API_PREFIX = "/api/v1"` as the centralized prefix constant.

- **Axios instance + auth token behavior**
  - Use `src/lib/axios.ts` as the shared Axios client.
  - Base URL comes from `process.env.NEXT_PUBLIC_API_URL` (fallback to empty string).
  - Request interceptor:
    - If sending `FormData`, delete `Content-Type` so Axios/browser set correct multipart boundary.
    - Auth header reads `accessToken`:
      - Client: `localStorage.getItem("accessToken")`
      - Server: `cookies().get("accessToken")?.value` via dynamic import of `next/headers` (to avoid client bundling).
  - Response interceptor:
    - On `401` (client-side only), clear `accessToken` and `currentUser` from `localStorage`.

- **React Query “options builder” layer**
  - Keep HTTP details inside `src/lib/apis/**` modules; `src/lib/queryApi.ts` composes query/mutation option objects only.
  - Single source of truth for query keys: `queryKeys` in `src/lib/queryApi.ts`.
    - Include stable partitions (e.g. `userId`) **for cache identity only** even if the API resolves user from JWT.
  - Prefer `queryApi.<domain>.<operation>(...) => UseQueryOptions<APIResponse<...>, Error>` (and similarly for mutations).
  - Use a small cache helper with defaults:
    - `DEFAULT_CACHE`: `staleTime: 15m`, `gcTime: 30m`
    - Allow per-call overrides via `cacheConfig`.
  - Use `enabled` guards to prevent invalid calls (e.g. `projectId > 0`, `userId > 0`, client-only requirements).

## Notifications implementation (React Query + optimistic cache)

This repo implements Notifications with React Query infinite pagination, option builders from `src/lib/queryApi.ts`, and optimistic cache updates with rollback support.

- **Where code lives**
  - UI and helpers: `src/components/notifications/*`
  - Query keys + option builders: `src/lib/queryApi.ts` (`queryKeys.notifications.*`, `queryApi.notifications.*`)
  - Domain types/envelope: `APIResponse<NotificationListResponse>`

- **Query option builders**
  - Infinite list: `queryApi.notifications.infiniteList(userId, pageSize)` with key `queryKeys.notifications.infiniteList(userId, pageSize)`.
  - Badge list: `queryApi.notifications.list(userId, offset, limit)` with key `queryKeys.notifications.list(userId, offset, limit)`.
  - Keys must include stable partitions (`userId`, `pageSize`, `offset`, `limit`) to prevent cache collisions.

- **Infinite pagination rules**
  - `getNextPageParam` uses the API paging envelope (`total`, `offset`, `results.length`) to compute next offset and stop at end-of-list.
  - Stop when `success=false`, `data` missing, `results.length === 0`, or `nextOffset >= total`.

- **Merging + grouping for display**
  - `flattenNotificationPages(pages)` merges `pages[]` into one list, deduping by notification `id`.
  - `groupNotificationsForDisplay(items)` buckets by `"today" | "yesterday" | "earlier"` and keeps newest-first ordering.

- **Optimistic mark-as-read with rollback**
  - Optimistic updates patch *both* caches:
    - Infinite list cache
    - Badge list cache
  - Helpers in `src/components/notifications/notification-cache.ts`:
    - `readNotificationCachesSnapshot(...)` captures current cache values for rollback.
    - `writeOptimisticMarkRead(..., { ids } | { all: true })` patches cached pages to mark notifications as read.
    - `restoreNotificationCaches(...)` restores the snapshot if the mutation fails.
  - Patch behavior:
    - `applyReadToPage(...)` sets `is_read: true` and fills `read_at` with “now” when missing.
    - `mapInfiniteReadPages(...)` applies the patch across all infinite pages.

## Additional conventions (preferred patterns)

Use these patterns when expanding the template into a full app (they match how you’ve already built production code):

- **API module layout**
  - Prefer per-domain modules under `src/lib/Apis/<Domain>/*` (or `src/lib/api/<domain>/*` if you want a lowercase convention), exporting a `service` object of functions.
  - Keep API response envelope types close to the domain (example pattern: `ApiResponse<T> { success, message, data, errors }`).
- **HTTP base URL**
  - In larger apps, you may choose `NEXT_PUBLIC_API_BASE_URL` (used by `haba-o-jumla-fe`) instead of `NEXT_PUBLIC_BACKEND_URL`.
  - If you keep `API_PREFIX` in the template, keep it centralized and never string-concatenate `/api/v1` throughout the UI.
- **Auth redirect on 401**
  - Template uses `forceLogout()` (redirects to `/`).
  - `haba-o-jumla-fe` redirects to `/auth/login` and avoids redirect loops; use that behavior if you add an auth section.
- **Query defaults (tunable)**
  - Template defaults are more cache-friendly (30m stale).
  - `haba-o-jumla-fe` uses shorter cache (1m stale, 5m gc) for ecommerce-like freshness. Adjust per product needs.
- **Quality workflow**
  - Stronger validate pattern used in `haba-o-jumla-fe`: `lint + type-check + build`.
  - Adopt “no `console.log`” in production code and prefer typed errors/toasts.

## Environment/config touchpoints

- `NEXT_PUBLIC_BACKEND_URL` (fallback in code: `http://localhost:8000/`)
- `NEXT_PUBLIC_API_BASE_URL` (pattern used in `haba-o-jumla-fe`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_MENU_BUCKET` (defaults to `public`)

## Feature-add workflow for this skeleton

1. Add/extend route in `src/app/(main)` (or create a new route group if needed).
2. Keep page shell in layout components (`MainShell`-style) and UI primitives in `components/ui`.
3. If backend data is needed:
   - create `src/lib/api/<domain>/index.ts` (or `.tsx` if JSX needed),
   - export typed wrappers built on `get/post/put/patch/del`.
4. If runtime validation is needed, add colocated Zod schemas in `src/lib/api/<domain>/schema.ts`.
5. Use React Query hooks in client components, relying on shared `QueryProvider`.
6. Run `format`, `lint`, `test`, then `build` (or `validate`).

## Quality gate before handoff

- [ ] New API calls use `src/lib/https.ts` helpers and API prefix flow
- [ ] No duplicate auth/logout logic outside `https.ts` + `forceLogout.tsx`
- [ ] Route/layout additions preserve current `app` + `MainShell` structure
- [ ] Any new env var is documented near usage
- [ ] `bun run validate` passes
