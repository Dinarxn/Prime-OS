import { Zap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4 py-12 antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      <div className="w-full max-w-sm sm:max-w-md space-y-6">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-wider">
              PRIME<span className="text-emerald-400">OS</span>
            </span>
          </Link>
          <p className="text-xs text-zinc-400">
            Client Acquisition Operating System
          </p>
        </div>

        {/* Auth form container */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-md shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}

