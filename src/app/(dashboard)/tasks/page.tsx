import { Clock, CheckCircle2 } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Speed-to-Lead Tasks</h1>
          <p className="text-xs text-zinc-400">Prioritized call queue and scheduled outreach follow-ups.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>0 Pending</span>
          </div>
        </div>
      </div>

      {/* Empty State / Ready Container */}
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
          <Clock className="h-6 w-6" />
        </div>
        <h2 className="mt-3.5 text-sm font-semibold text-zinc-200">No pending follow-ups</h2>
        <p className="mt-1 text-xs text-zinc-500 max-w-sm">
          The calling queue and automated post-call outcome logging flow will be activated in Phase 4.
        </p>
      </div>
    </div>
  );
}
