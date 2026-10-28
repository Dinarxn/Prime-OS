# Prime OS — System Architecture

## 1. Architectural Philosophy
Prime OS replaces the overengineered dual-repository model (standalone Express backend + Prisma + Docker) with a **unified, high-performance, full-stack Next.js 15 App Router architecture**.

Key principles:
1. **Server-First Paradigm**: React Server Components (RSC) fetch data on the server with zero client JavaScript bundle overhead. Client components (`"use client"`) are restricted strictly to interactive leaf components.
2. **Cohesive Mutations**: Server Actions handle business logic mutations with strict Zod schema validation, CSRF origin verification, and type-safe returns.
3. **Database-Level Isolation**: Multi-tenancy is enforced directly by PostgreSQL Row Level Security (RLS) via Supabase, not by application-level `WHERE` clauses alone.
4. **Decoupled Providers**: Communication and AI engines are accessed through pure TypeScript interfaces, allowing mock development without external API dependencies.

---

## 2. System Topology

```mermaid
graph TD
    Client["Client Viewports (Mobile / PWA / Desktop)"] -->|HTTPS| EdgeMiddleware["Next.js Edge Middleware (Session Refresh & Route Guard)"]
    
    subgraph "Next.js 15 App Router (Single Runtime)"
        EdgeMiddleware --> RSC["React Server Components (Direct Read with RLS)"]
        EdgeMiddleware --> ServerActions["Server Actions (Zod-Validated Mutations)"]
        EdgeMiddleware --> RouteHandlers["Route Handlers (External Webhooks Only)"]
    end
    
    subgraph "Supabase Backend (PostgreSQL + Auth)"
        RSC -->|@supabase/ssr| SupabaseAuth["Supabase Auth (getUser Cryptographic Check)"]
        ServerActions -->|@supabase/ssr| SupabaseAuth
        SupabaseAuth --> Postgres["PostgreSQL Engine"]
        Postgres --> RLS["Row Level Security Policies (Workspace Isolation)"]
    end
    
    subgraph "Provider Adapters (Deferred to Phase 5)"
        ServerActions -.-> ProviderContracts["Provider Contracts (Email, SMS, WhatsApp, Phone, AI)"]
    end
```

---

## 3. Directory Structure
```text
Prime OS/
├── docs/                      # Architectural and engineering specifications
│   ├── PRODUCT-SCOPE.md
│   ├── ARCHITECTURE.md
│   ├── IMPLEMENTATION-ROADMAP.md
│   ├── MOBILE-PWA-STRATEGY.md
│   └── ENGINEERING-RULES.md
├── public/                    # Static assets, verified PWA icons & manifest
│   ├── icons/
│   │   ├── icon.svg
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── apple-touch-icon.png
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth routes (Phase 2)
│   │   ├── (dashboard)/       # Core application shell & feature routes
│   │   │   ├── layout.tsx     # Authenticated shell layout
│   │   │   ├── page.tsx       # Overview pulse
│   │   │   ├── leads/page.tsx # Pipeline view
│   │   │   ├── tasks/page.tsx # Speed-to-lead queue
│   │   │   └── settings/page.tsx
│   │   ├── globals.css        # Tailwind CSS v4 & theme variables
│   │   └── layout.tsx         # Root HTML layout & PWA meta
│   ├── components/
│   │   ├── layout/            # Dual-shell navigation (MobileHeader, MobileBottomNav, DesktopSidebar, AppShell)
│   │   └── ui/                # Accessible design system primitives
│   ├── lib/
│   │   └── utils.ts           # Styling & formatting helpers (cn, formatters)
│   └── types/                 # Shared domain & TypeScript definitions
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 4. Conceptual Data Model & Tenancy Strategy
*(Deferred from live implementation; documented for architectural review)*

### Core Domain Entities:
1. **`workspaces`**: Agency tenant container (`id`, `name`, `slug`, `created_at`).
2. **`workspace_members`**: Tenancy junction (`workspace_id`, `user_id`, `role: owner | admin | member`).
3. **`profiles`**: Public user details linked to Supabase Auth (`id`, `email`, `full_name`, `avatar_url`, `active_workspace_id`).
4. **`leads`**: Core acquisition records (`id`, `workspace_id`, `business_name`, `contact_name`, `email`, `phone`, `website`, `stage`, `priority`, `estimated_value`, `assigned_to`, `source`, `custom_fields`).
5. **`communications`**: Omni-channel timeline entries (`id`, `workspace_id`, `lead_id`, `channel: email | sms | whatsapp | call | note`, `direction: inbound | outbound | system`, `subject`, `content`, `status`, `metadata`).
6. **`tasks`**: Follow-ups and speed-to-lead queue items (`id`, `workspace_id`, `lead_id`, `title`, `due_date`, `status: pending | completed | cancelled`, `assigned_to`).

### Multi-Tenant Row Level Security (RLS) Pattern:
Every tenant table enforces workspace boundary validation:
```sql
-- Conceptual RLS Policy Template (For Phase 2)
CREATE POLICY "Tenant Workspace Isolation" ON public.leads
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = leads.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );
```

---

## 5. Communication & AI Provider Contracts
*(Pure architectural contracts; implementation deferred to Phase 5)*

```typescript
export interface SendMessageOptions {
  to: string;
  body: string;
  subject?: string;
  mediaUrls?: string[];
}

export interface ProviderResult {
  success: boolean;
  externalMessageId?: string;
  error?: string;
}

export interface EmailProvider {
  send(options: SendMessageOptions): Promise<ProviderResult>;
}

export interface SMSProvider {
  send(options: SendMessageOptions): Promise<ProviderResult>;
}

export interface WhatsAppProvider {
  send(options: SendMessageOptions): Promise<ProviderResult>;
}

export interface TelephonyProvider {
  initiateCall(params: { to: string; from: string; callbackUrl: string }): Promise<ProviderResult>;
}

export interface AIProvider {
  enrichLead(rawInput: { website?: string; businessName: string }): Promise<{
    summary: string;
    suggestedHook: string;
    techStackDetected: string[];
  }>;
}
```

---

## 6. Security Boundaries
- **No Client Secrets**: Service role keys (`SUPABASE_SERVICE_ROLE_KEY`) are forbidden in browser bundles.
- **Cryptographic Token Refresh**: Middleware uses `supabase.auth.getUser()` rather than unvalidated JWT payload parsing (`getSession()`).
- **Input Validation**: All Server Actions validate inputs via Zod schemas before processing.

