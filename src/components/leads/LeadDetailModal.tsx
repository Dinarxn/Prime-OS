"use client";

import {
  X,
  Phone,
  Mail,
  Globe,
  MapPin,
  Star,
  MessageSquare,
  Calendar,
  Building2,
  ExternalLink,
} from "lucide-react";
import type { LeadRow } from "@/types/database.types";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadPriorityBadge } from "./LeadPriorityBadge";

interface LeadDetailModalProps {
  lead: LeadRow | null;
  onClose: () => void;
  onEdit: (lead: LeadRow) => void;
}

export function LeadDetailModal({ lead, onClose, onEdit }: LeadDetailModalProps) {
  if (!lead) return null;

  const rawPhone = lead.phone || lead.whatsapp_number;
  const cleanDigits = rawPhone ? rawPhone.replace(/[^\d]/g, "") : "";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-100">{lead.business_name}</h2>
              <LeadStatusBadge status={lead.status} />
              <LeadPriorityBadge priority={lead.priority} />
            </div>
            {lead.contact_person && (
              <p className="text-xs text-zinc-400 mt-1">
                Contact: <span className="text-zinc-200 font-medium">{lead.contact_person}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1-Tap Action Dock */}
        <div className="grid grid-cols-3 gap-2.5">
          {lead.phone ? (
            <a
              href={`tel:${lead.phone}`}
              className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold transition-all"
            >
              <Phone className="h-4 w-4" />
              <span>Call Dialer</span>
            </a>
          ) : (
            <div className="min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-950 text-zinc-600 border border-zinc-900 text-xs opacity-50">
              No Phone
            </div>
          )}

          {cleanDigits ? (
            <a
              href={`https://wa.me/${cleanDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 text-xs font-medium transition-all"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          ) : (
            <div className="min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-950 text-zinc-600 border border-zinc-900 text-xs opacity-50">
              No WA
            </div>
          )}

          {lead.email ? (
            <a
              href={`mailto:${lead.email}`}
              className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 text-xs font-medium transition-all"
            >
              <Mail className="h-4 w-4 text-sky-400" />
              <span>Send Email</span>
            </a>
          ) : (
            <div className="min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-950 text-zinc-600 border border-zinc-900 text-xs opacity-50">
              No Email
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="space-y-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-zinc-500 block mb-0.5">Website</span>
              {lead.website_url ? (
                <a
                  href={lead.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline break-all"
                >
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span>{lead.website_url}</span>
                  <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                </a>
              ) : (
                <span className="text-amber-400">Needs Website Audit (No active site)</span>
              )}
            </div>

            <div>
              <span className="text-zinc-500 block mb-0.5">Location</span>
              <div className="flex items-center gap-1.5 text-zinc-200">
                <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span>
                  {[lead.address, lead.city].filter(Boolean).join(", ") || "No address provided"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-900">
            <div>
              <span className="text-zinc-500 block mb-0.5">Category</span>
              <div className="flex items-center gap-1.5 text-zinc-200">
                <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                <span>{lead.category || "General"}</span>
              </div>
            </div>

            <div>
              <span className="text-zinc-500 block mb-0.5">Rating</span>
              <div className="flex items-center gap-1 text-zinc-200 font-mono">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span>{lead.rating ? `${lead.rating.toFixed(1)} / 5.0` : "Unrated"}</span>
              </div>
            </div>

            <div>
              <span className="text-zinc-500 block mb-0.5">Added Date</span>
              <div className="flex items-center gap-1.5 text-zinc-200 font-mono text-[11px]">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                <span>{new Date(lead.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-zinc-300">Notes & Audit Observations</h3>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5 text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {lead.notes || "No notes recorded for this lead yet."}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(lead);
            }}
            className="min-h-[44px] rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-100 hover:bg-zinc-700 transition-colors"
          >
            Edit Record
          </button>
        </div>
      </div>
    </div>
  );
}

