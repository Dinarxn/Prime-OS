import Link from "next/link";
import {
  Clock,
  ArrowRight,
  ShieldCheck,
  Database,
  ArrowUpRight,
} from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Executive Command Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-zinc-950 p-6 md:p-8 backdrop-blur-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Acquisition Engine Active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">
              Agency Command Center
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              High-velocity client acquisition OS. Manage outreach pipelines, execute speed-to-lead follow-ups, and ingest prospect databases with multi-tenant data isolation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/leads"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all shadow-lg shadow-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <span>Launch Leads Pipeline</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      </div>

      {/* Core Pipeline Funnel Pathways */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Pipeline Pathways
          </h2>
          <span className="text-xs text-zinc-500">Interactive stages</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Link
            href="/leads"
            className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/80 hover:translate-y-[-1px]"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-medium uppercase tracking-wider">Prospects</span>
              <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-lg font-bold text-zinc-100">Ingested Pool</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Raw unqualified accounts and inbound entries</p>
          </Link>

          <Link
            href="/leads"
            className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/80 hover:translate-y-[-1px]"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-medium uppercase tracking-wider">Active Outreach</span>
              <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-lg font-bold text-zinc-100">In Contact</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Direct phone, WhatsApp & email touchpoints</p>
          </Link>

          <Link
            href="/tasks"
            className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/80 hover:translate-y-[-1px]"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-medium uppercase tracking-wider">Call Queue</span>
              <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-lg font-bold text-zinc-100">Speed-to-Lead</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Urgent follow-ups & scheduled reminders</p>
          </Link>

          <Link
            href="/leads"
            className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/80 hover:translate-y-[-1px]"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-medium uppercase tracking-wider">Conversions</span>
              <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-lg font-bold text-zinc-100">Qualified Deals</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Audit-ready client opportunities</p>
          </Link>
        </div>
      </div>

      {/* System Infrastructure Telemetry */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            System & Infrastructure Telemetry
          </h2>
          <span className="text-xs text-emerald-400 font-mono">100% OPERATIONAL</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Tenant Isolation</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-zinc-200">PostgreSQL RLS Active</div>
            <p className="text-xs text-zinc-500">
              Strict workspace isolation enforced via Supabase security policies.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Speed-to-Lead SLA</span>
              <Clock className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-zinc-200">&lt; 5-Min Target</div>
            <p className="text-xs text-zinc-500">
              Engineered for instant 1-tap dialer execution and rapid touchpoints.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Ingestion Engine</span>
              <Database className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-zinc-200">CSV & Maps Parser</div>
            <p className="text-xs text-zinc-500">
              Intelligent column auto-detection and duplicate prevention protocol.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
