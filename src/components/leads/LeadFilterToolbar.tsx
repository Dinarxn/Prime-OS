"use client";

import { Search, X, Filter } from "lucide-react";
import { LEAD_STATUSES, LEAD_PRIORITIES } from "@/lib/validations/lead.schema";

interface LeadFilterToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  city: string;
  onCityChange: (val: string) => void;
  priority: string;
  onPriorityChange: (val: string) => void;
  hasWebsite: string;
  onHasWebsiteChange: (val: "all" | "yes" | "no") => void;
  cities: string[];
  totalCount: number;
  onClearFilters: () => void;
}

export function LeadFilterToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  city,
  onCityChange,
  priority,
  onPriorityChange,
  hasWebsite,
  onHasWebsiteChange,
  cities,
  totalCount,
  onClearFilters,
}: LeadFilterToolbarProps) {
  const isFiltered =
    Boolean(search) ||
    (status && status !== "all") ||
    (city && city !== "all") ||
    (priority && priority !== "all") ||
    hasWebsite !== "all";

  return (
    <div className="space-y-3">
      {/* Search and Quick Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search business, contact, phone, email..."
            className="w-full min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900/60 pl-10 pr-9 py-2 text-[16px] md:text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 min-h-[32px] min-w-[32px] flex items-center justify-center text-zinc-500 hover:text-zinc-300"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by Status"
            className="min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-[16px] md:text-xs font-medium text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Status: All</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* City Dropdown */}
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            aria-label="Filter by City"
            className="min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-[16px] md:text-xs font-medium text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">City: All</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            aria-label="Filter by Priority"
            className="min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-[16px] md:text-xs font-medium text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Priority: All</option>
            {LEAD_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Website Filter Dropdown */}
          <select
            value={hasWebsite}
            onChange={(e) => onHasWebsiteChange(e.target.value as "all" | "yes" | "no")}
            aria-label="Filter by Website Presence"
            className="min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-[16px] md:text-xs font-medium text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Website: All</option>
            <option value="yes">Has Website</option>
            <option value="no">Needs Website (Audit)</option>
          </select>
        </div>
      </div>

      {/* Filter Status Summary & Clear Button */}
      {isFiltered && (
        <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/40 border border-zinc-800/80 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-emerald-400" />
            <span>Showing filtered results ({totalCount} leads matched)</span>
          </div>

          <button
            type="button"
            onClick={onClearFilters}
            className="min-h-[36px] flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1 rounded transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}

