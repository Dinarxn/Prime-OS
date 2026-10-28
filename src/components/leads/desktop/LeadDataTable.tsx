"use client";

import {
  Phone,
  Mail,
  Globe,
  Star,
  Edit2,
  Trash2,
  ExternalLink,
  MessageSquare,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { LeadRow, LeadStatus } from "@/types/database.types";
import { LeadStatusBadge } from "../LeadStatusBadge";
import { LeadPriorityBadge } from "../LeadPriorityBadge";
import { LEAD_STATUSES } from "@/lib/validations/lead.schema";

interface LeadDataTableProps {
  leads: LeadRow[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewDetails: (lead: LeadRow) => void;
  onEditLead: (lead: LeadRow) => void;
  onDeleteLead: (lead: LeadRow) => void;
  onQuickStatusChange: (id: string, status: LeadStatus) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (column: "created_at" | "business_name" | "rating" | "status") => void;
}

export function LeadDataTable({
  leads,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewDetails,
  onEditLead,
  onDeleteLead,
  onQuickStatusChange,
  sortBy,
  sortOrder,
  onSortChange,
}: LeadDataTableProps) {
  const allSelected = leads.length > 0 && selectedIds.length === leads.length;

  function renderSortIcon(col: "created_at" | "business_name" | "rating" | "status") {
    if (sortBy !== col) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-emerald-400" />
    ) : (
      <ArrowDown className="h-3 w-3 text-emerald-400" />
    );
  }

  return (
    <div className="hidden md:block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <th className="py-3 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  aria-label="Select all leads"
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-400"
                />
              </th>

              <th className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => onSortChange("business_name")}
                  className={`flex items-center gap-1.5 transition-colors ${
                    sortBy === "business_name" ? "text-emerald-400 font-semibold" : "hover:text-zinc-200"
                  }`}
                >
                  <span>Business & Contact</span>
                  {renderSortIcon("business_name")}
                </button>
              </th>

              <th className="py-3 px-3">
                <button
                  type="button"
                  onClick={() => onSortChange("status")}
                  className={`flex items-center gap-1.5 transition-colors ${
                    sortBy === "status" ? "text-emerald-400 font-semibold" : "hover:text-zinc-200"
                  }`}
                >
                  <span>Pipeline Stage</span>
                  {renderSortIcon("status")}
                </button>
              </th>

              <th className="py-3 px-3">Contact Channels</th>
              <th className="py-3 px-3">City</th>

              <th className="py-3 px-3">
                <button
                  type="button"
                  onClick={() => onSortChange("rating")}
                  className={`flex items-center gap-1.5 transition-colors ${
                    sortBy === "rating" ? "text-emerald-400 font-semibold" : "hover:text-zinc-200"
                  }`}
                >
                  <span>Rating / Score</span>
                  {renderSortIcon("rating")}
                </button>
              </th>

              <th className="py-3 px-3">Website</th>
              <th className="py-3 px-3">Priority</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800/60 text-xs">
            {leads.map((lead) => {
              const isSelected = selectedIds.includes(lead.id);

              return (
                <tr
                  key={lead.id}
                  className={`group transition-colors ${
                    isSelected ? "bg-emerald-950/15" : "hover:bg-zinc-900/60"
                  }`}
                >
                  <td className="py-3 px-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(lead.id)}
                      aria-label={`Select ${lead.business_name}`}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-400"
                    />
                  </td>

                  {/* Business & Contact */}
                  <td className="py-3 px-4 max-w-[220px]">
                    <button
                      type="button"
                      onClick={() => onViewDetails(lead)}
                      className="text-left font-semibold text-zinc-100 hover:text-emerald-400 transition-colors truncate block w-full"
                    >
                      {lead.business_name}
                    </button>
                    {lead.contact_person && (
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {lead.contact_person}
                      </div>
                    )}
                  </td>

                  {/* Pipeline Stage Dropdown */}
                  <td className="py-3 px-3">
                    <div className="relative inline-block cursor-pointer">
                      <LeadStatusBadge status={lead.status} />
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          onQuickStatusChange(lead.id, e.target.value as LeadStatus)
                        }
                        aria-label={`Change status for ${lead.business_name}`}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
                      >
                        {LEAD_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-zinc-900 text-zinc-200">
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Contact Channels (Phone, WA, Email) */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone}`}
                          title={`Call ${lead.phone}`}
                          className="h-7 w-7 rounded-lg border border-zinc-800 bg-zinc-900/80 flex items-center justify-center text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="h-7 w-7 rounded-lg border border-zinc-900 bg-zinc-950/40 flex items-center justify-center text-zinc-600">
                          <Phone className="h-3.5 w-3.5 opacity-30" />
                        </span>
                      )}

                      {lead.whatsapp_number || lead.phone ? (
                        <a
                          href={`https://wa.me/${(lead.whatsapp_number || lead.phone)?.replace(/[^\d]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open WhatsApp"
                          className="h-7 w-7 rounded-lg border border-zinc-800 bg-zinc-900/80 flex items-center justify-center text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </a>
                      ) : null}

                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          title={`Email ${lead.email}`}
                          className="h-7 w-7 rounded-lg border border-zinc-800 bg-zinc-900/80 flex items-center justify-center text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* City */}
                  <td className="py-3 px-3 text-zinc-300">
                    {lead.city || <span className="text-zinc-600">—</span>}
                  </td>

                  {/* Rating / Score */}
                  <td className="py-3 px-3">
                    {lead.rating ? (
                      <div className="flex items-center gap-1 font-mono text-zinc-200">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span>{lead.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>

                  {/* Website */}
                  <td className="py-3 px-3">
                    {lead.website_url ? (
                      <a
                        href={lead.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : (
                      <span className="inline-flex rounded bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 text-[10px] text-amber-300 font-medium">
                        No Site
                      </span>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-3">
                    <LeadPriorityBadge priority={lead.priority} />
                  </td>

                  {/* Actions Menu */}
                  <td className="py-3 px-3 text-right relative">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditLead(lead)}
                        title="Edit lead"
                        className="h-7 w-7 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 flex items-center justify-center transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteLead(lead)}
                        title="Delete lead"
                        className="h-7 w-7 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
