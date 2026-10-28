import Link from "next/link";
import { Zap, ShieldCheck } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-4 pt-safe backdrop-blur-md md:hidden">
      <Link
        href="/"
        className="flex items-center gap-2 text-zinc-100 font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
        aria-label="Prime OS Dashboard"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <Zap className="h-4 w-4" />
        </div>
        <span className="text-sm font-bold tracking-wider">PRIME<span className="text-emerald-400">OS</span></span>
      </Link>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs font-medium text-zinc-400">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>Agency</span>
        </div>
      </div>
    </header>
  );
}

