# Prime OS — Engineering Rules & Standards

## 1. Type Safety & TypeScript Strictness
- **Strict Mode Mandate**: `tsconfig.json` must enforce `"strict": true` and `"noImplicitAny": true`.
- **Zero `any` Policy**: The `any` type is forbidden in production code. Use `unknown` with type narrowing, Discriminated Unions, or generics.
- **Type Generation**: Database types must be derived directly from PostgreSQL schema definitions (`src/types/database.types.ts`).
- **Domain Modeling**: Domain types must be kept separate from raw database rows in `src/types/domain.types.ts`.

---

## 2. Server-First React & Next.js Conventions
- **RSC by Default**: Every page and layout in `src/app/` is a React Server Component by default. Data fetching happens directly inside async Server Components.
- **Leaf Client Components**: `"use client"` directives must only be placed at the lowest possible leaf level (e.g. interactive buttons, inputs, modal triggers, drag-and-drop boards). Never mark entire page layouts as `"use client"` unless unavoidable.
- **Mutations via Server Actions**: All data mutations are handled by Server Actions placed in `src/actions/`.
- **Route Handlers**: `src/app/api/` is strictly reserved for external provider webhooks (e.g. Twilio, Resend, WhatsApp) that require external HTTP callbacks.

---

## 3. Validation & Security Guardrails
- **Zod Validation at Every Boundary**: Every Server Action and API Route Handler must validate incoming payloads using a Zod schema (`schema.safeParse()`). Never trust client input.
- **Action Return Format**: Server Actions must return a standardized discriminated union:
  ```typescript
  export type ActionResult<T> =
    | { success: true; data: T }
    | { success: false; error: string; fieldErrors?: Record<string, string[]> };
  ```
- **Zero Exposed Secrets**:
  - `NEXT_PUBLIC_*` variables are strictly limited to public endpoints (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
  - `SUPABASE_SERVICE_ROLE_KEY` and third-party API keys are strictly server-only and must never be imported in client-rendered components.
- **Input Sanitization**: Free-text notes and communication content must be escaped before rendering to eliminate XSS risks.

---

## 4. Design System & UI Rules
- **Color Palette**: Dark, neutral zinc foundation with restrained semantic status accents:
  - Canvas background: `bg-zinc-950` (`#09090b`)
  - Elevated surfaces & cards: `bg-zinc-900` (`#18181b`)
  - Sub-elements & borders: `border-zinc-800` (`#27272a`)
  - Primary text: `text-zinc-100` (`#f4f4f5`)
  - Secondary text: `text-zinc-400` (`#a1a1aa`)
  - Muted text & placeholders: `text-zinc-500` (`#71717a`)
- **Semantic Pipeline Stage Accents**:
  - *New / Uncontacted*: Sky (`text-sky-400 bg-sky-950/40 border-sky-800/50`)
  - *Contacted / In Discussion*: Amber (`text-amber-400 bg-amber-950/40 border-amber-800/50`)
  - *Qualified / Proposal*: Violet (`text-violet-400 bg-violet-950/40 border-violet-800/50`)
  - *Closed Won*: Emerald (`text-emerald-400 bg-emerald-950/40 border-emerald-800/50`)
  - *Closed Lost*: Rose (`text-rose-400 bg-rose-950/40 border-rose-800/50`)
- **Typography & Formatting**:
  - Form inputs must have minimum font-size 16px (`text-base` or `text-[16px] md:text-sm`) to prevent iOS Safari auto-zoom.
  - Numbers, monetary values, and dates must use `tabular-nums` to eliminate jitter.
- **States**: Every interactive component must handle: `default`, `hover`, `active`, `focus-visible`, `disabled`, and `loading`. Skeleton loaders must match exact card dimensions; never use full-screen blocking spinners.

---

## 5. Mobile-First Verification Gates
Before any pull request or phase completion:
1. `pnpm typecheck` (`tsc --noEmit`) must exit with code 0.
2. `pnpm lint` must pass without warnings or errors.
3. `pnpm build` must succeed with clean page output.
4. UI components must be tested at `360px` viewport width with zero horizontal scroll (`overflow-x: hidden`).
5. Touch targets must measure at least `44x44px` with minimum `8px` spacing.

