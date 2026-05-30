# OnFocus

A modern, premium multi-vendor discovery platform connecting people with artists, vendors, venues, and event professionals.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/onfocus run dev` — run the frontend (port 21917, preview at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, wouter, TanStack Query, Framer Motion, Tailwind CSS, shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/listings.ts` — listings table (artists, vendors, venues)
- `lib/db/src/schema/inquiries.ts` — inquiries + partner applications tables
- `artifacts/api-server/src/routes/` — API route handlers
- `artifacts/onfocus/src/pages/` — frontend pages
- `artifacts/onfocus/src/components/` — shared UI components

## Architecture decisions

- Contract-first: OpenAPI spec drives both server Zod schemas and React Query hooks via Orval codegen
- Single listings table with a `type` discriminator (artist | vendor | venue) for discovery simplicity
- Featured listings and platform stats are lightweight read-only endpoints for homepage polish
- All API routes under `/api` prefix; frontend at `/` root

## Product

**OnFocus** is a premium creative discovery platform. Users can:
- Browse and search artists (musicians, singers, DJs, anchors, dancers, bands, performers)
- Discover vendors (decor, catering, photography, makeup, lighting, wedding planning, production)
- Explore venues (banquet halls, cafes, open lawns, luxury venues, clubs, rooftops, wedding venues)
- View individual profile/portfolio pages with image galleries and details
- Submit contact inquiries
- Apply to join as an artist/vendor/venue partner

## User preferences

- Soft neutral color palette (white, light grey, charcoal black) — no loud colors or heavy gradients
- Editorial, spacious, calm aesthetic — premium but accessible
- No emojis in the UI

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Always run `pnpm run typecheck:libs` after changing DB schema files before typechecking server code
- `pnpm --filter @workspace/db run push` applies schema changes to the dev database

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
