import Link from "next/link";
import { Users, Clock, ArrowRight, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 md:p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Phase 1 Foundation Active</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-100">
              Prime OS Client Acquisition
            </h1>
            <p className="text-sm text-zinc-400">
              Mobile-first acquisition engine engineered for high-velocity outreach and rapid speed-to-lead follow-up.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/leads"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <span>Explore Leads</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Foundation Architecture Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2.5 text-zinc-300 font-medium text-sm">
            <Smartphone className="h-4 w-4 text-emerald-400" />
            <span>Mobile-First Shell</span>
          </div>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            Responsive down to 360px viewport with fixed bottom navigation and 44x44px touch targets.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2.5 text-zinc-300 font-medium text-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>PWA Standalone Ready</span>
          </div>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            Configured manifest and verified icon assets for home screen installation.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2.5 text-zinc-300 font-medium text-sm">
            <Users className="h-4 w-4 text-emerald-400" />
            <span>Unified Architecture</span>
          </div>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            Single Next.js 15 App Router codebase with zero microservice sprawl.
          </p>
        </div>
      </div>

      {/* Core Acquisition Pathways */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/leads"
          className="group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/60"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">Leads & Pipeline</h2>
                <p className="text-xs text-zinc-400">Phase 2 pipeline and CSV ingestion target</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        <Link
          href="/tasks"
          className="group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/60"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">Follow-up Tasks</h2>
                <p className="text-xs text-zinc-400">High-priority speed-to-lead queue target</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  );
}

