import { MobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { DesktopSidebar } from "./DesktopSidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Mobile Top Bar */}
      <MobileHeader />

      {/* Desktop Persistent Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pb-24 md:pb-8 pt-3 md:pt-6 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

