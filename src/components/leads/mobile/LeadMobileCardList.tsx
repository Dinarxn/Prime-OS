"use client";

import { Phone, MessageSquare, Star, Globe, Edit, Trash2 } from "lucide-react";
import type { LeadRow, LeadStatus } from "@/types/database.types";
import { LeadStatusBadge } from "../LeadStatusBadge";
import { LeadPriorityBadge } from "../LeadPriorityBadge";
import { LEAD_STATUSES } from "@/lib/validations/lead.schema";

interface LeadMobileCardListProps {
  leads: LeadRow[];
  onViewDetails: (lead: LeadRow) => void;
  onEditLead: (lead: LeadRow) => void;
  onDeleteLead: (lead: LeadRow) => void;
  onQuickStatusChange: (id: string, status: LeadStatus) => void;
}

export function LeadMobileCardList({
  leads,
  onViewDetails,
  onEditLead,
  onDeleteLead,
  onQuickStatusChange,
}: LeadMobileCardListProps) {
  return (
    <div className="block md:hidden space-y-3">
      {leads.map((lead) => {
        const rawPhone = lead.phone || lead.whatsapp_number;
        const cleanDigits = rawPhone ? rawPhone.replace(/[^\d]/g, "") : "";

        return (
          <div
            key={lead.id}
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-3 backdrop-blur-sm transition-all"
          >
            {/* Top Row: Business Name & Status Pill */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onViewDetails(lead)}
                  className="text-left font-bold text-sm text-zinc-100 hover:text-emerald-400 transition-colors line-clamp-1"
                >
                  {lead.business_name}
                </button>
                {lead.contact_person && (
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {lead.contact_person}
                  </p>
                )}
              </div>

              <div className="relative shrink-0">
                <select
                  value={lead.status}
                  onChange={(e) =>
                    onQuickStatusChange(lead.id, e.target.value as LeadStatus)
                  }
                  aria-label="Change status"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                >
                  {LEAD_STATUSES.map((st) => (
                    <option key={st} value={st} className="bg-zinc-900 text-zinc-100">
                      {st}
                    </option>
                  ))}
                </select>
                <LeadStatusBadge status={lead.status} />
              </div>
            </div>

            {/* Middle Meta Info: Location, Rating, Website Tag, Priority */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 border-t border-zinc-800/60 pt-2.5">
              {lead.city && (
                <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[11px] text-zinc-300">
                  {lead.city}
                </span>
              )}

              {lead.rating && (
                <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span>{lead.rating.toFixed(1)}</span>
                </div>
              )}

              {lead.website_url ? (
                <a
                  href={lead.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-2 py-0.5 rounded"
                >
                  <Globe className="h-3 w-3" />
                  <span>Website</span>
                </a>
              ) : (
                <span className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                  Needs Audit
                </span>
              )}

              <LeadPriorityBadge priority={lead.priority} />
            </div>

            {/* Bottom Thumb Action Dock (Green Zone, 44x44px Touch Targets) */}
            <div className="grid grid-cols-4 gap-2 pt-1 border-t border-zinc-800/60">
              {/* Call Button */}
              {lead.phone ? (
                <a
                  href={`tel:${lead.phone}`}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold active:scale-[0.98] transition-all"
                  aria-label={`Call ${lead.business_name}`}
                >
                  <Phone className="h-4 w-4" />
                  <span>Call</span>
                </a>
              ) : (
                <button
                  disabled
                  type="button"
                  className="min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-950/50 text-zinc-600 border border-zinc-900 cursor-not-allowed opacity-40 text-xs"
                >
                  <Phone className="h-4 w-4" />
                </button>
              )}

              {/* WhatsApp Button */}
              {cleanDigits ? (
                <a
                  href={`https://wa.me/${cleanDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700/80 hover:bg-zinc-700 text-xs font-medium active:scale-[0.98] transition-all"
                  aria-label={`WhatsApp ${lead.business_name}`}
                >
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  <span>WA</span>
                </a>
              ) : (
                <button
                  disabled
                  type="button"
                  className="min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-950/50 text-zinc-600 border border-zinc-900 cursor-not-allowed opacity-40 text-xs"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              )}

              {/* Edit Lead */}
              <button
                type="button"
                onClick={() => onEditLead(lead)}
                className="min-h-[44px] flex items-center justify-center gap-1 rounded-xl bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 hover:bg-zinc-700 text-xs font-medium active:scale-[0.98] transition-all"
                aria-label="Edit Lead"
              >
                <Edit className="h-4 w-4 text-zinc-400" />
                <span>Edit</span>
              </button>

              {/* Delete Lead */}
              <button
                type="button"
                onClick={() => onDeleteLead(lead)}
                className="min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-rose-400 border border-zinc-700/60 hover:bg-rose-950/30 text-xs transition-all"
                aria-label="Delete Lead"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
