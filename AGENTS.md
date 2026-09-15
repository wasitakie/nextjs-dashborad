<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project Guide for Agents

## Project Snapshot

This is `nextjs-dashboard`, a Next.js 16 App Router dashboard for EcomFlow. The UI is an operations workspace for e-commerce, customer chat, analytics, and SaaS task management. Most screens are Thai-first with some English product labels.

Core stack:

- Next.js `16.2.11` with React `19.2.4`
- App Router under `app/`
- TypeScript
- Tailwind CSS v4 via `@import "tailwindcss"` in `app/globals.css`
- `lucide-react` for icons
- `next-themes` for dark mode
- Recharts for charts
- Prisma schema exists for PostgreSQL task data, but current app actions mostly use in-memory mock data

## Required Reading Before Code Changes

Before editing Next.js code, read the relevant local docs in `node_modules/next/dist/docs/`. Do not rely on older Next.js assumptions.

Useful starting points:

- App Router overview: `node_modules/next/dist/docs/01-app/index.md`
- Project structure: `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- Layouts and pages: `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- Server and client components: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- Fetching data: `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`
- Mutating data: `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
- Version 16 upgrade notes: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

## Repository Layout

- `app/layout.tsx`: root layout, metadata, theme provider, sidebar shell.
- `app/page.tsx`: dashboard overview.
- `app/*/page.tsx`: route pages for analytics, chat, products, profile, tasks, task list, order and kanban.
- `components/`: shared UI such as `Header`, `Sidebar`, theme provider, and chat components.
- `lib/actions.ts`: async app actions backed by module-level in-memory arrays.
- `lib/data.ts`: TypeScript types and seed-like mock data used by the UI.
- `lib/prisma.ts`: Prisma client helper.
- `prisma/schema.prisma`: PostgreSQL schema for task management.
- `prisma/seed.ts`: Prisma seed script.

## Development Commands

Use pnpm because this repo has `pnpm-lock.yaml`.

- Install dependencies: `pnpm install`
- Start dev server: `pnpm dev`
- Lint: `pnpm lint`
- Production build: `pnpm build`
- Seed database: `pnpm db:seed`

Run `pnpm lint` after code changes when practical. Run `pnpm build` for changes touching routing, data boundaries, or framework behavior.

## Coding Conventions

- Keep TypeScript strict and prefer explicit shared types from `lib/data.ts`.
- Use the `@/` path alias for imports from project root.
- Match the existing semicolon style in the file being edited; this repo currently has mixed formatting.
- Keep components small enough to scan, but avoid introducing abstractions that are not reused.
- Prefer `const`, typed props, and pure derived values with `useMemo` when existing patterns already do that.
- Keep comments rare and useful.

## Next.js and React Rules

- Pages and layouts live in `app/` and should follow App Router conventions.
- Add `"use client"` only when a component uses client-only hooks, browser APIs, event handlers, or state.
- Keep server-only code out of client components unless it is exposed through an approved action/helper pattern already used in the app.
- Use `next/link` for internal navigation.
- Be careful with hydration: the root layout uses `suppressHydrationWarning` and `next-themes`.
- When changing metadata, use the App Router metadata APIs documented locally.

## Data and State Rules

- Do not assume Prisma is the live source for the current UI. `lib/actions.ts` currently uses in-memory arrays from `lib/data.ts` for fast interactive behavior.
- If switching a feature from mock data to Prisma, do it deliberately and update all affected actions, loading states, and seed expectations.
- Keep status strings aligned with existing union types:
  - Orders: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`
  - Payments: `PAID`, `PENDING`, `REFUNDED`
  - Products: `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`
  - Conversations: `OPEN`, `PENDING`, `RESOLVED`
  - SaaS tasks: `BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`
- Validate user input before mutating in-memory or Prisma-backed data.

## UI and Product Direction

- Build the actual dashboard workflow, not a marketing landing page.
- Preserve the operational admin feel: dense, scannable, restrained, and useful.
- Support dark mode with `dark:` classes whenever adding visible UI.
- Use `lucide-react` icons for navigation, buttons, empty states, and compact controls.
- Keep Thai labels natural when editing user-facing copy. Mixed Thai/English is acceptable where the current product already uses it.
- Avoid decorative-only visuals. Visual elements should help users inspect status, compare data, or take action.
- Keep layouts responsive. Check mobile widths when editing header, sidebar, tables, kanban columns, or dense cards.
- Avoid nested cards and oversized hero sections inside dashboard pages.

## Styling Notes

- Tailwind v4 is configured through CSS imports, not a traditional `tailwind.config` file.
- Global theme tokens and dark mode custom variant are in `app/globals.css`.
- Existing UI leans on slate surfaces, compact rounded controls, thin borders, and subtle shadows.
- Prefer consistent spacing and predictable controls over heavy gradients or decorative effects.

## Prisma Notes

- Prisma datasource requires `DATABASE_URL`.
- Schema provider is PostgreSQL.
- Do not run destructive migrations or reset database state unless explicitly asked.
- If editing `prisma/schema.prisma`, consider whether `prisma/seed.ts`, `lib/prisma.ts`, and any task-related UI need updates too.

## Quality Checklist

Before handing off substantial changes:

- Relevant local Next.js docs were checked.
- `pnpm lint` was run or a reason was given.
- `pnpm build` was run for framework, routing, or data-boundary changes when practical.
- UI was checked for light and dark mode regressions when visible screens changed.
- No unrelated files, generated artifacts, or user changes were reverted.
