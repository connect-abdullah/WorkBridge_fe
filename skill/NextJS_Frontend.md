## Date Shawarma Starter Template Skill

This repository doubles as a **starter template** for building modern web apps with **Next.js 15**, **TypeScript**, **TailwindCSS**, **Shadcn UI**, **TanStack Query**, **Supabase**, and a typed HTTP layer on top of **Axios**.

Use this file as your **quick-start + architecture overview** when you clone this repo to start a new project.

---

## Scripts & Workflows

All scripts live in `package.json`.

- **dev**: `next dev`  
  Start the development server (hot reloading, error overlays).

- **build**: `next build`  
  Create a production build of the app.

- **start**: `next start`  
  Run the production build locally (after `build`).

- **lint**: `next lint`  
  Run ESLint against the project.

- **format**: `prettier --write .`  
  Format the whole codebase with Prettier.

- **validate**: `bun run lint && bun run build`  
  Fast check to ensure the app **lints and builds** with one command.

- **test**: `vitest run`  
  Run the test suite once in CI-style mode.

- **test:watch**: `vitest`  
  Run tests in watch mode while developing.

You can execute these with your preferred package manager, for example:

- `bun run dev`, `bun run lint`, `bun run test`
- or `npm run dev`, `npm run lint`, `npm run test`

### Recommended daily flow

1. **Edit code**
2. **Format**: `format`
3. **Lint**: `lint`
4. **Test**: `test` / `test:watch`
5. **Build**: `build` (or `validate` before pushing)

---

## Folder Structure (High Level)

Key folders under `src/`:

- **`app/`**  
  Next.js App Router entry points, layouts, and app‑level files:
  - `app/layout.tsx`: root layout, global styles, and providers.
  - `app/(main)/layout.tsx`: main site layout for user‑facing routes.
  - `app/(main)/**`: main routes (home, profile, orders, checkout, complaints, auth, etc).
  - `app/admin/**`: admin routes (dashboard, products, orders, categories, complaints, reviews).
  - `app/not-found.tsx`: 404 page.
  - `app/robots.ts` / `app/sitemap.ts`: SEO / crawler configuration.

- **`components/`**  
  Reusable UI and layout pieces:
  - `components/ui/**`: Shadcn-style primitives (button, input, dialog, drawer, table, etc.), `toaster`/`toast` hooks, and Sonner notifications.
  - `components/layout/**`: page chrome such as `Header`, `Footer`, `MainLayoutClient`, `RouteAccessModal`, `CategoryBar`.
  - `components/home/**`: homepage feature components (e.g. `CategorySection`, `ProductCard`).
  - `components/skeleton/**`: loading states for cards, detail views, category bars.
  - Misc helpers like `ClientOnly`, `Loader`, `HeroCarousel`, `PrintReceiptButton`, etc.

- **`views/`**  
  Page-level containers that wire together data + UI:
  - `views/auth/*`: login, signup, forgot password flows.
  - `views/admin/*`: admin dashboard, orders, products, categories, reviews, complaints.
  - `views/Profile`, `views/Orders`, `views/ComplaintBox`, `views/Checkout`, `views/OrderDetail`, `views/OrderReceiptPrint`.
  - `views/admin/AdminLayout.tsx`: shared layout for admin views.

- **`lib/`**  
  Shared infrastructure, HTTP, and utilities:
  - `lib/https.ts`: typed Axios HTTP client + interceptors.
  - `lib/supabase.ts`: Supabase client + helpers for uploads.
  - `lib/providers/query-provider.tsx`: TanStack Query provider configuration.
  - `lib/forceLogout.tsx`: client-side logout helper.
  - `lib/utils.ts`: shared utilities (e.g. `cn`).
  - `lib/api/**`: per-domain API modules (`product`, `orders`, `user`, `reviews`, `complaints`, `category`, `admin`) and their `schema.tsx` files.

- **`store/`**  
  Centralized state for auth, cart, products, etc.:
  - `store/auth.tsx`, `store/cart.tsx`, `store/products.tsx`.

- **`hooks/`**  
  Reusable custom hooks:
  - `hooks/use-toast.ts`: toast hook wrapper.
  - `hooks/use-mobile.tsx`: helper for mobile-specific behavior.

- **`constants/`**  
  Static data and demo/mock content:
  - `constants/users.ts`, `constants/reviews.ts`, `constants/products.ts`, `constants/orders.ts`, `constants/categories.ts`.

- **`types/`**  
  Shared types:
  - `types/index.ts`: domain and helper type definitions.

Configs at the root:

- `tsconfig.json`: TypeScript settings with `@/*` alias to `src/*`.
- `tailwind.config.ts`: Tailwind theme + `tailwindcss-animate`.
- `postcss.config.mjs`: PostCSS + Tailwind + Autoprefixer.
- `next.config.ts`: Next.js configuration (when present).
- `vitest.config.ts`: test runner configuration.

---

## Core Building Blocks

### HTTP layer – `src/lib/https.ts`

Centralized Axios instance with:

- **Base URL** from `NEXT_PUBLIC_BACKEND_URL` (defaults to `http://localhost:8000/`).
- Shared **API prefix**: `API_PREFIX = "/api/v1"`, applied automatically via `withPrefix`.
- **Auth token injection** through a configurable `tokenGetter` and `Authorization: Bearer <token>` header.
- **Response interceptors** that:
  - Call `forceLogout()` on `401` to clear local state and redirect to `/`.
  - Log basic info for `403`, `404`, and `5xx` errors.
- Typed helper functions:
  - `get<T>()`, `post<T, B>()`, `put<T, B>()`, `patch<T, B>()`, `del<T>()`.

**Pattern:**  
Create per-domain API modules under `src/lib/api/<domain>/index.tsx` using these helpers, plus a colocated `schema.tsx` with Zod types.

### Supabase client – `src/lib/supabase.ts`

Lightweight wrapper over `@supabase/supabase-js`:

- Reads from environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Optional: `NEXT_PUBLIC_SUPABASE_MENU_BUCKET` (defaults to `"public"`).
- Exports:
  - `supabase`: a configured client or `null` if not properly configured.
  - `slugifyCategory(name: string)`: helper to turn category names into safe folder slugs.
  - `uploadProductPhoto(file: File, categorySlug: string)`: example helper to upload product images into a structured storage path and return a public URL.

Use this pattern for any future storage or Supabase operations.

### Query provider – `src/lib/providers/query-provider.tsx`

Encapsulates TanStack Query configuration:

- Creates a single `QueryClient` per app instance with:
  - `staleTime`: 30 minutes.
  - `gcTime`: 45 minutes.
  - `retry: 1`.
  - `refetchOnWindowFocus`, `refetchOnMount`, `refetchOnReconnect`: all disabled by default for stability.
- `QueryProvider` wraps `children` with `QueryClientProvider`.

**Usage:**  
Import and use in your `app/providers.tsx` or root `layout.tsx` so every page has access to React Query:

- `app/providers.tsx` typically composes `QueryProvider` with theme, toaster, and other global providers.

### Force logout – `src/lib/forceLogout.tsx`

Client-side helper that:

- Clears auth-related entries from `localStorage` and `document.cookie`.
- Optionally redirects to `/` when `redirect = true` (default).

Used by the HTTP layer on `401` responses to ensure stale tokens don’t break the app.

### Utilities – `src/lib/utils.ts`

Currently a simple Tailwind utility:

- `cn(...inputs: ClassValue[])`: merges classnames via `clsx` + `tailwind-merge`.

Use `cn` wherever you build dynamic Tailwind class lists.

---

## Architecture Patterns

- **Domain-based API modules**  
  For each domain (`product`, `orders`, `user`, `reviews`, `complaints`, `category`, `admin`):
  - `src/lib/api/<domain>/schema.tsx`: Zod schemas + TS types.
  - `src/lib/api/<domain>/index.tsx`: small functions that call `get/post/put/patch/del` from `lib/https.ts`.

- **Views vs components**  
  - `views/**` are **page containers**: they orchestrate data fetching, state, and domain logic.
  - `components/**` are **reusable building blocks**: layout, cards, skeletons, buttons, and other primitives.

- **Routing and layouts**  
  - Use Next.js **route groups** `(main)` and `admin` to keep user and admin flows separate.
  - `app/(main)/layout.tsx` and `app/admin/layout.tsx` provide distinct shells.

- **State management**  
  - `store/auth.tsx`, `store/cart.tsx`, and `store/products.tsx` centralize client-side state.
  - Prefer colocated API + schema modules plus global stores for cross-page coordination.

---

## Creating a New Project from This Template

1. **Create a new repo from this one**
   - Either clone this repo and push to a new origin, or use it as a GitHub template if configured.
2. **Rename things**
   - Update `name` in `package.json`.
   - Change any branding text, logos, and SEO metadata.
   - Adjust environment variables in `.env.local` for your new backend/Supabase project.
3. **Prune or adapt domains**
   - Remove any `lib/api/*`, `views/*`, and `components/*` you don’t need.
   - Keep the patterns (HTTP, Supabase, query provider, layout shell) and swap in your own domains.
4. **Install dependencies**
   - Run your package manager’s install (e.g. `bun install`, `npm install`, or `pnpm install`).
5. **Run the app**
   - Start development: `bun run dev` / `npm run dev`.
   - Run checks: `lint`, `test`, `validate`.
6. **Optional: use `project-template/`**
   - The `project-template/` folder (see below) provides a leaner skeleton you can copy into brand-new projects if you don’t want all of Date Shawarma’s domain logic.

---

## `project-template/` Overview

This repo also contains a `project-template/` folder that mirrors the **core structure and tooling** of this app with lighter, more generic content.

Inside `project-template/` you will find:

- A `package.json` that preserves the same scripts (`dev`, `build`, `start`, `lint`, `format`, `validate`, `test`, `test:watch`) and core dependencies.
- A minimal `src/` tree with:
  - `app/` root + main layout + a few example routes (home, auth, one admin page).
  - `lib/` with `https.ts`, `supabase.ts`, `providers/query-provider.tsx`, `forceLogout.tsx`, `utils.ts`, and example `api/*` modules with placeholder endpoints.
  - `components/` with the Shadcn UI primitives and core layout components.
  - `views/` with very simple example screens that you can quickly replace.
  - `store/`, `hooks/`, `constants/`, and `types/` with minimal but representative examples.
- Copied and trimmed versions of config files:
  - `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`, `vitest.config.ts`.

**To start a fresh app from `project-template/`:**

1. Copy the `project-template/` folder and rename it to your new project name.
2. Move its contents to the repo root (so `project-template/src` becomes top-level `src`, etc.).
3. Update `package.json`, env vars, and branding.
4. Install dependencies and run `dev`.

This keeps your **architecture and tooling consistent** across projects while letting each new app customize domain logic freely.

