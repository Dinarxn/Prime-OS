import { cn } from "@/lib/utils";
import type { LeadPriority } from "@/types/database.types";

const PRIORITY_CONFIG: Record<
  LeadPriority,
  { label: string; text: string; bg: string; border: string }
> = {
  low: {
    label: "Low",
    text: "text-zinc-400",
    bg: "bg-zinc-900",
    border: "border-zinc-800",
  },
  medium: {
    label: "Medium",
    text: "text-blue-400",
    bg: "bg-blue-950/30",
    border: "border-blue-800/40",
  },
  high: {
    label: "High",
    text: "text-amber-400",
    bg: "bg-amber-950/30",
    border: "border-amber-800/40",
  },
  urgent: {
    label: "Urgent",
    text: "text-rose-400",
    bg: "bg-rose-950/40",
    border: "border-rose-800/50",
  },
};

export function LeadPriorityBadge({
  priority,
  className,
}: {
  priority: LeadPriority;
  className?: string;
}) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {config.label}
    </span>
  );
}

