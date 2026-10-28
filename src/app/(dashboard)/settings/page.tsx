import { Building2, Smartphone } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">Settings & Workspace</h1>
        <p className="text-xs text-zinc-400">Configure agency profile, mobile preferences, and system defaults.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Workspace Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">Agency Workspace</h2>
              <p className="text-xs text-zinc-500">Tenant organization container</p>
            </div>
          </div>

          <div className="space-y-2 border-t border-zinc-800/80 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Workspace Name</span>
              <span className="font-medium text-zinc-200">Default Agency</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Isolation Mode</span>
              <span className="font-mono text-[11px] text-emerald-400">PostgreSQL RLS</span>
            </div>
          </div>
        </div>

        {/* Mobile & PWA Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">Mobile & PWA</h2>
              <p className="text-xs text-zinc-500">Device display and touch settings</p>
            </div>
          </div>

          <div className="space-y-2 border-t border-zinc-800/80 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Display Mode</span>
              <span className="font-medium text-zinc-200">Standalone PWA</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Minimum Viewport</span>
              <span className="font-mono text-[11px] text-zinc-300">360px</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Minimum Touch Target</span>
              <span className="font-mono text-[11px] text-zinc-300">44 x 44px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
