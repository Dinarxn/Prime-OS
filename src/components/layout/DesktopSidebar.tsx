"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Clock, Settings, Zap, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Acquisition Pulse", icon: LayoutDashboard },
  { href: "/leads", label: "Leads & Pipeline", icon: Users },
  { href: "/tasks", label: "Speed-to-Lead Tasks", icon: Clock },
  { href: "/settings", label: "Workspace Settings", icon: Settings },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Desktop Sidebar"
      className="hidden md:flex h-screen w-64 flex-col justify-between border-r border-zinc-800 bg-zinc-950/70 p-4 shrink-0 sticky top-0"
    >
      <div className="flex flex-col gap-6">
        {/* Brand header */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wider text-zinc-100">
                PRIME<span className="text-emerald-400">OS</span>
              </div>
              <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Client Acquisition
              </div>
            </div>
          </div>
          <span className="rounded-md border border-zinc-800 bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
            v0.2
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                  isActive
                    ? "bg-zinc-900 text-zinc-100 border border-zinc-700/80 shadow-sm before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r before:bg-emerald-400"
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-emerald-400 stroke-[2.2]" : "text-zinc-400 stroke-[1.8]"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Workspace Footer */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-300">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-zinc-200">
                Default Agency
              </div>
              <div className="text-[10px] text-zinc-500">Free Workspace</div>
            </div>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            Owner
          </span>
        </div>
      </div>
    </aside>
  );
}

