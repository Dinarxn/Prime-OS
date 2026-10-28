# Prime OS — Implementation Roadmap

## Overview
This roadmap establishes a five-phase, incremental delivery plan for Prime OS. Each phase defines concrete deliverables, strict dependencies, and unambiguous acceptance criteria.

---

## Phase 1: Foundation Audit, Architecture & Mobile-First Setup *(Current Phase)*
**Objective**: Inspect workspace, establish 5 core architectural specifications, build responsive dual-shell application layout (mobile bottom nav + desktop sidebar), configure PWA manifest with valid icon assets, and set up quality gates.

- **Dependencies**: None.
- **Deliverables**:
  - `docs/PRODUCT-SCOPE.md`
  - `docs/ARCHITECTURE.md`
  - `docs/IMPLEMENTATION-ROADMAP.md`
  - `docs/MOBILE-PWA-STRATEGY.md`
  - `docs/ENGINEERING-RULES.md`
  - Clean Next.js 15 App Router foundation (`src/app/`, `src/components/layout/`).
  - Dual-shell responsive layout supporting `>= 360px` viewports without horizontal scrolling.
  - PWA manifest (`public/manifest.json`) and verified icon assets in `public/icons/`.
- **Acceptance Criteria**:
  - `tsc --noEmit` completes with zero errors in strict mode.
  - `pnpm lint` passes cleanly.
  - `pnpm build` generates a production build without errors.
  - No database migration or live connection is executed.
  - No broken or placeholder icon paths exist in the manifest.

---

## Phase 2: Lead Data Model, Workspace Authorization & Pipeline Views
**Objective**: Review and approve database schema, implement Supabase SSR authentication, enable tenant RLS policies, support CSV lead ingestion, and deliver responsive pipeline views (compact cards on mobile, sortable table on desktop).

- **Dependencies**: Phase 1 foundation approval; Supabase staging project credentials.
- **Deliverables**:
  - SQL migration for `workspaces`, `workspace_members`, `profiles`, and `leads`.
  - Supabase client/server helper setup (`@supabase/ssr`) and middleware auth guard.
  - CSV lead import parser with column mapping and deduplication.
  - Pipeline views: responsive lead cards on mobile (`< 768px`) and high-density table on desktop (`>= 768px`).
  - Search, stage filtering, and pagination.
- **Acceptance Criteria**:
  - RLS policies prevent users from viewing or mutating leads from other workspaces.
  - CSV files with 1,000+ rows parse client-side without locking the UI.
  - Pipeline renders cleanly on 360px mobile viewport with zero horizontal overflow.

---

## Phase 3: Lead 360 Profile & Fast Action Docks
**Objective**: Build detailed lead view, chronological activity timeline, notes, and 1-tap mobile action docks (Call, WhatsApp, Email, Script copy).

- **Dependencies**: Phase 2 lead data model and pipeline views.
- **Deliverables**:
  - Lead detail page (`/leads/[id]`) with responsive tabs/drawers.
  - 1-tap action dock: native dialer (`tel:`), pre-filled WhatsApp deep link (`wa.me`), and mail client (`mailto:`).
  - Outreach script drawer with 1-tap clipboard copying for cold objection handling.
  - Chronological communication and note activity timeline.
- **Acceptance Criteria**:
  - Tapping action buttons immediately triggers native phone/WhatsApp handlers with correct parameters.
  - Copying scripts displays accessible confirmation toast without layout shift.
  - Notes can be created and persisted in real time.

---

## Phase 4: Calling Queue & Return-to-App Logging Workflow
**Objective**: Build prioritized speed-to-lead calling queue and the "Return-to-App" post-call outcome logger.

- **Dependencies**: Phase 3 action docks and activity timeline.
- **Deliverables**:
  - Prioritized calling queue view (`/tasks` or `/queue`) filtered by due date and uncontacted status.
  - Visibility change detection hook (`useReturnToApp`) that detects app reactivation after external dialer launch.
  - Rapid call outcome bottom sheet: 1-tap selection (`Audit Booked`, `Left Voicemail`, `Gatekeeper`, `No Answer`, `Not Interested`) with automatic follow-up task scheduler.
- **Acceptance Criteria**:
  - Exiting to native dialer and returning to Prime OS automatically surfaces the outcome bottom sheet.
  - Submitting outcome logs a communication record and updates lead stage in under 2 seconds.

---

## Phase 5: Provider Integrations & AI Lead Enrichment
**Objective**: Connect live communication providers (Twilio for SMS/voice, Resend for email, WhatsApp Cloud API) and AI prospect enrichment.

- **Dependencies**: Phase 4 calling workflow; production provider credentials.
- **Deliverables**:
  - Webhook route handlers for incoming messages and delivery status callbacks.
  - Live provider adapters fulfilling Phase 1 TypeScript contracts.
  - AI lead enrichment module: automated company summary, technology stack detection, and personalized outreach hook generation based on domain.
- **Acceptance Criteria**:
  - Inbound webhooks process cryptographically verified payloads with signature validation.
  - AI enrichment generates structured pitch hooks within 3 seconds without blocking UI responsiveness.

