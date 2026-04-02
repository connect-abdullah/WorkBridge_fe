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

## Additional conventions from `haba-o-jumla-fe` (preferred patterns)

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
