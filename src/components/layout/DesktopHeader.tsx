"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, Upload, ChevronRight } from "lucide-react";

const ROUTE_CONFIG: Record<string, { title: string; section: string }> = {
  "/": { title: "Acquisition Pulse", section: "Dashboard" },
  "/leads": { title: "Leads & Pipeline", section: "Acquisition" },
  "/tasks": { title: "Speed-to-Lead Tasks", section: "Execution" },
  "/settings": { title: "Workspace Settings", section: "System" },
};

export function DesktopHeader() {
  const pathname = usePathname();
  const current = ROUTE_CONFIG[pathname] || {
    title: pathname.replace("/", "").toUpperCase() || "Dashboard",
    section: "Prime OS",
  };

  return (
    <header className="hidden md:flex h-16 w-full items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-8 backdrop-blur-md sticky top-0 z-20">
      {/* Route Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-zinc-500 font-medium">{current.section}</span>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
        <span className="text-zinc-200 font-semibold">{current.title}</span>
      </div>

      {/* Right Telemetry & Quick Action Shortcuts */}
      <div className="flex items-center gap-4">
        {/* System Health Pulse */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono tracking-wide">SYSTEM READY</span>
        </div>

        {/* Global Action Shortcuts */}
        <div className="flex items-center gap-2">
          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors"
          >
            <Upload className="h-3.5 w-3.5 text-zinc-400" />
            <span>Import CSV</span>
          </Link>
          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Lead</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

