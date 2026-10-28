import { Users, Upload, Filter, Plus } from "lucide-react";

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Leads & Pipeline</h1>
          <p className="text-xs text-zinc-400">Manage client acquisition prospects, stages, and quick outreach.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-400 cursor-not-allowed opacity-70"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            disabled
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-emerald-600/50 px-3.5 py-2 text-xs font-semibold text-zinc-950 cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar Shell */}
      <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2.5">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Filter className="h-3.5 w-3.5 text-zinc-500" />
          <span>Stage: All (New, Contacted, Qualified, Closed)</span>
        </div>
        <span className="text-[11px] text-zinc-500 font-mono">Phase 2 Target</span>
      </div>

      {/* Empty State / Ready Container */}
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
          <Users className="h-6 w-6" />
        </div>
        <h2 className="mt-3.5 text-sm font-semibold text-zinc-200">No leads ingested yet</h2>
        <p className="mt-1 text-xs text-zinc-500 max-w-sm">
          Lead ingestion, CSV batch upload, and dual mobile-card/desktop-table views will be activated in Phase 2 following database schema review.
        </p>
      </div>
    </div>
  );
}

