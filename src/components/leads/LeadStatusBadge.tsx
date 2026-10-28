import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types/database.types";

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  New: {
    label: "New",
    bg: "bg-sky-950/40",
    text: "text-sky-400",
    border: "border-sky-800/50",
    dot: "bg-sky-400",
  },
  Contacted: {
    label: "Contacted",
    bg: "bg-amber-950/40",
    text: "text-amber-400",
    border: "border-amber-800/50",
    dot: "bg-amber-400",
  },
  Interested: {
    label: "Interested",
    bg: "bg-cyan-950/40",
    text: "text-cyan-400",
    border: "border-cyan-800/50",
    dot: "bg-cyan-400",
  },
  "Follow-up": {
    label: "Follow-up",
    bg: "bg-indigo-950/40",
    text: "text-indigo-400",
    border: "border-indigo-800/50",
    dot: "bg-indigo-400",
  },
  Meeting: {
    label: "Meeting",
    bg: "bg-purple-950/40",
    text: "text-purple-400",
    border: "border-purple-800/50",
    dot: "bg-purple-400",
  },
  Proposal: {
    label: "Proposal",
    bg: "bg-violet-950/40",
    text: "text-violet-400",
    border: "border-violet-800/50",
    dot: "bg-violet-400",
  },
  Won: {
    label: "Won",
    bg: "bg-emerald-950/40",
    text: "text-emerald-400",
    border: "border-emerald-800/50",
    dot: "bg-emerald-400",
  },
  Lost: {
    label: "Lost",
    bg: "bg-rose-950/40",
    text: "text-rose-400",
    border: "border-rose-800/50",
    dot: "bg-rose-400",
  },
};

export function LeadStatusBadge({
  status,
  className,
}: {
  status: LeadStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.New;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)} />
      <span>{config.label}</span>
    </span>
  );
}

