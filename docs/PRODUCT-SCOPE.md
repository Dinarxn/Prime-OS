# Prime OS — Product Scope

## 1. Mission & Vision
Prime OS is a production-oriented, mobile-first client acquisition operating system built specifically for a web-selling agency. Its primary purpose is to convert cold prospects into booked design/development audits and closed retainers with maximum speed, zero friction, and high operational reliability.

Prime OS prioritizes:
- **Speed to Lead**: Immediate notification and 1-tap outreach on mobile.
- **Low Cognitive Overhead**: Clean, dense, distraction-free interface without bloated enterprise complexity.
- **Reliable Portability**: First-class experience across mobile browsers, desktop browsers, and installable PWA.

---

## 2. Target Users & Operating Modes
- **Sales Reps & Closers on Mobile**: Fast lead triage, 1-tap phone dialing, WhatsApp messaging, SMS dispatch, objection scripts, and rapid post-call outcome logging while away from desk.
- **Outreach Operators on Desktop**: CSV data ingestion, pipeline batch management, deep company research, and high-density lead list filtering.
- **Agency Leadership**: Pipeline velocity tracking, acquisition KPIs, conversion rates per outreach channel, and team member workload.

---

## 3. High-Priority Functional Workflows

### A. Lead Ingestion & Pipeline Management
- CSV lead import with column mapping and deduplication (email/phone/domain).
- Structured pipeline stages: `New`, `Contacted`, `Qualified`, `Audit Scheduled`, `Proposal Sent`, `Closed Won`, `Closed Lost`.
- Multi-dimensional filtering (by niche, deal value, stage, outreach channel, source).
- Instant search across contact name, company name, phone, and domain.

### B. Lead 360 Profile & Fast Action Docks
- Centralized company profile (domain, estimated budget, niche, decision-maker name, contact info).
- 1-tap action docks on mobile:
  - **Call**: Launch native dialer via `tel:`.
  - **WhatsApp**: Open direct chat thread with pre-filled pitch template via `wa.me`.
  - **Email**: Trigger email compose with personalized proposal copy.
  - **Script Copy**: 1-tap clipboard copy of objection handling lines.
- Complete chronological activity feed tracking all touches, call outcomes, and internal notes.

### C. Calling Queue & Return-to-App Logging
- Speed-to-lead queue highlighting overdue follow-ups and uncontacted prospects.
- **Return-to-App Pattern**: When a phone call initiated from the app terminates and the user returns to Prime OS, an automatic 1-tap bottom sheet prompts for call outcome (`Audit Booked`, `Left Voicemail`, `Gatekeeper`, `No Answer`, `Not Interested`) and schedules the next follow-up.

### D. Multi-Tenant Workspace Model
- Workspaces isolate agency data.
- User authentication and role-based permissions (`Owner`, `Admin`, `Member`).
- Database-enforced Row Level Security (RLS) guaranteeing that workspace records are never leaked across accounts.

---

## 4. Strict Non-Goals (Anti-Scope)
To avoid the bloat that caused the previous CRM system to degrade, the following are explicitly out of scope for Prime OS:
- **No Complex Accounting & Invoicing**: Prime OS handles acquisition and closing; post-close billing is handled by external tools (Stripe/QuickBooks).
- **No Project Management & Deliverables Tracking**: Client sprint delivery and design task management belong in Jira/Linear/Trello, not in the sales acquisition OS.
- **No Heavy Multi-Tier Support Ticketing**: Prime OS is an outbound and inbound client acquisition engine, not a customer help desk.
- **No Microservice Sprawl**: Zero standalone backend servers, no separate Express containers, no message broker clusters. Everything runs within a single unified Next.js App Router codebase with Supabase.

