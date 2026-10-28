"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Upload,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import type { LeadRow, LeadStatus } from "@/types/database.types";
import { LeadFilterToolbar } from "./LeadFilterToolbar";
import { LeadDataTable } from "./desktop/LeadDataTable";
import { LeadMobileCardList } from "./mobile/LeadMobileCardList";
import { LeadUpsertModal } from "./LeadUpsertModal";
import { LeadDetailModal } from "./LeadDetailModal";
import { LeadDeleteConfirmModal } from "./LeadDeleteConfirmModal";
import { CsvImportWizard } from "./csv/CsvImportWizard";
import {
  createLeadAction,
  updateLeadAction,
  deleteLeadAction,
  bulkDeleteLeadsAction,
  bulkUpdateStatusAction,
  getLeadsAction,
} from "@/actions/leads.actions";
import { LEAD_STATUSES } from "@/lib/validations/lead.schema";

interface LeadsClientPageProps {
  initialLeads: LeadRow[];
  initialTotalCount: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
  initialCities: string[];
}

export function LeadsClientPage({
  initialLeads,
  initialTotalCount,
  initialPage,
  initialPageSize,
  initialTotalPages,
  initialCities,
}: LeadsClientPageProps) {
  const [leads, setLeads] = useState<LeadRow[]>(initialLeads);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [cities] = useState<string[]>(initialCities);

  // Filters state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("all");
  const [priority, setPriority] = useState("all");
  const [hasWebsite, setHasWebsite] = useState<"all" | "yes" | "no">("all");
  const [sortBy, setSortBy] = useState<"created_at" | "business_name" | "rating" | "status">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadRow | null>(null);
  const [detailLead, setDetailLead] = useState<LeadRow | null>(null);
  const [deletingLead, setDeletingLead] = useState<LeadRow | null>(null);
  const [isCsvWizardOpen, setIsCsvWizardOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Helper to re-fetch leads with current filters
  function refreshLeads(overridePage?: number) {
    startTransition(async () => {
      const res = await getLeadsAction({
        search: search || undefined,
        status: status !== "all" ? status : undefined,
        city: city !== "all" ? city : undefined,
        priority: priority !== "all" ? priority : undefined,
        hasWebsite,
        sortBy,
        sortOrder,
        page: overridePage ?? page,
        pageSize,
      });

      if (res.success && res.data) {
        setLeads(res.data.leads);
        setTotalCount(res.data.totalCount);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
      }
    });
  }

  // Handle filter changes
  function handleSearchChange(newSearch: string) {
    setSearch(newSearch);
    startTransition(async () => {
      const res = await getLeadsAction({
        search: newSearch || undefined,
        status: status !== "all" ? status : undefined,
        city: city !== "all" ? city : undefined,
        priority: priority !== "all" ? priority : undefined,
        hasWebsite,
        sortBy,
        sortOrder,
        page: 1,
        pageSize,
      });
      if (res.success && res.data) {
        setLeads(res.data.leads);
        setTotalCount(res.data.totalCount);
        setPage(1);
        setTotalPages(res.data.totalPages);
      }
    });
  }

  function handleStatusFilterChange(newStatus: string) {
    setStatus(newStatus);
    startTransition(async () => {
      const res = await getLeadsAction({
        search: search || undefined,
        status: newStatus !== "all" ? newStatus : undefined,
        city: city !== "all" ? city : undefined,
        priority: priority !== "all" ? priority : undefined,
        hasWebsite,
        sortBy,
        sortOrder,
        page: 1,
        pageSize,
      });
      if (res.success && res.data) {
        setLeads(res.data.leads);
        setTotalCount(res.data.totalCount);
        setPage(1);
        setTotalPages(res.data.totalPages);
      }
    });
  }

  function handleCityFilterChange(newCity: string) {
    setCity(newCity);
    startTransition(async () => {
      const res = await getLeadsAction({
        search: search || undefined,
        status: status !== "all" ? status : undefined,
        city: newCity !== "all" ? newCity : undefined,
        priority: priority !== "all" ? priority : undefined,
        hasWebsite,
        sortBy,
        sortOrder,
        page: 1,
        pageSize,
      });
      if (res.success && res.data) {
        setLeads(res.data.leads);
        setTotalCount(res.data.totalCount);
        setPage(1);
        setTotalPages(res.data.totalPages);
      }
    });
  }

  function handlePriorityFilterChange(newPriority: string) {
    setPriority(newPriority);
    startTransition(async () => {
      const res = await getLeadsAction({
        search: search || undefined,
        status: status !== "all" ? status : undefined,
        city: city !== "all" ? city : undefined,
        priority: newPriority !== "all" ? newPriority : undefined,
        hasWebsite,
        sortBy,
        sortOrder,
        page: 1,
        pageSize,
      });
      if (res.success && res.data) {
        setLeads(res.data.leads);
        setTotalCount(res.data.totalCount);
        setPage(1);
        setTotalPages(res.data.totalPages);
      }
    });
  }

  function handleHasWebsiteFilterChange(val: "all" | "yes" | "no") {
    setHasWebsite(val);
    startTransition(async () => {
      const res = await getLeadsAction({
        search: search || undefined,
        status: status !== "all" ? status : undefined,
        city: city !== "all" ? city : undefined,
        priority: priority !== "all" ? priority : undefined,
        hasWebsite: val,
        sortBy,
        sortOrder,
        page: 1,
        pageSize,
      });
      if (res.success && res.data) {
        setLeads(res.data.leads);
        setTotalCount(res.data.totalCount);
        setPage(1);
        setTotalPages(res.data.totalPages);
      }
    });
  }

  function handleClearFilters() {
    setSearch("");
    setStatus("all");
    setCity("all");
    setPriority("all");
    setHasWebsite("all");
    startTransition(async () => {
      const res = await getLeadsAction({ page: 1, pageSize });
      if (res.success && res.data) {
        setLeads(res.data.leads);
        setTotalCount(res.data.totalCount);
        setPage(1);
        setTotalPages(res.data.totalPages);
      }
    });
  }

  // Sorting
  function handleSortChange(col: "created_at" | "business_name" | "rating" | "status") {
    const nextOrder = sortBy === col && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(col);
    setSortOrder(nextOrder);
    startTransition(async () => {
      const res = await getLeadsAction({
        search: search || undefined,
        status: status !== "all" ? status : undefined,
        city: city !== "all" ? city : undefined,
        priority: priority !== "all" ? priority : undefined,
        hasWebsite,
        sortBy: col,
        sortOrder: nextOrder,
        page: 1,
        pageSize,
      });
      if (res.success && res.data) {
        setLeads(res.data.leads);
        setTotalCount(res.data.totalCount);
        setPage(1);
        setTotalPages(res.data.totalPages);
      }
    });
  }

  // Selection
  function toggleSelectLead(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l.id));
    }
  }

  // Quick Inline Status Change
  async function handleQuickStatusChange(id: string, newStatus: LeadStatus) {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
    await updateLeadAction(id, { status: newStatus });
  }

  // Upsert Action Handler
  async function handleUpsertSubmit(payload: Record<string, unknown>) {
    if (editingLead) {
      const res = await updateLeadAction(editingLead.id, payload);
      if (res.success) {
        refreshLeads();
      }
      return res;
    } else {
      const res = await createLeadAction(payload);
      if (res.success) {
        refreshLeads(1);
      }
      return res;
    }
  }

  // Delete Action Handler
  async function handleDeleteConfirm() {
    if (!deletingLead) return;
    await deleteLeadAction(deletingLead.id);
    setDeletingLead(null);
    setSelectedIds((prev) => prev.filter((i) => i !== deletingLead.id));
    refreshLeads();
  }

  // Bulk Operations
  async function handleBulkDelete() {
    if (!selectedIds.length) return;
    await bulkDeleteLeadsAction(selectedIds);
    setSelectedIds([]);
    refreshLeads();
  }

  async function handleBulkStageChange(newStatus: LeadStatus) {
    if (!selectedIds.length) return;
    await bulkUpdateStatusAction(selectedIds, newStatus);
    setSelectedIds([]);
    refreshLeads();
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">
              Leads & Pipeline
            </h1>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-400">
              {totalCount}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage your client acquisition prospects, pipeline stages, and contact touches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCsvWizardOpen(true)}
            className="min-h-[44px] flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 hover:border-zinc-700 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-colors"
          >
            <Upload className="h-4 w-4 text-emerald-400" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingLead(null);
              setIsUpsertOpen(true);
            }}
            className="min-h-[44px] flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-zinc-950 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <LeadFilterToolbar
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusFilterChange}
        city={city}
        onCityChange={handleCityFilterChange}
        priority={priority}
        onPriorityChange={handlePriorityFilterChange}
        hasWebsite={hasWebsite}
        onHasWebsiteChange={handleHasWebsiteFilterChange}
        cities={cities}
        totalCount={totalCount}
        onClearFilters={handleClearFilters}
      />

      {/* Bulk Action Float Bar (Desktop only, when rows selected) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-zinc-900/90 px-4 py-2.5 backdrop-blur-md shadow-lg animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{selectedIds.length} leads selected</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) handleBulkStageChange(e.target.value as LeadStatus);
              }}
              className="min-h-[36px] rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="" disabled>
                Change Stage...
              </option>
              {LEAD_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleBulkDelete}
              className="min-h-[36px] flex items-center gap-1.5 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 px-3 py-1 text-xs font-medium transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Leads List: Desktop Table & Mobile Cards */}
      {leads.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <LeadDataTable
            leads={leads}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelectLead}
            onToggleSelectAll={toggleSelectAll}
            onViewDetails={(lead) => setDetailLead(lead)}
            onEditLead={(lead) => {
              setEditingLead(lead);
              setIsUpsertOpen(true);
            }}
            onDeleteLead={(lead) => setDeletingLead(lead)}
            onQuickStatusChange={handleQuickStatusChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />

          {/* Mobile Cards View */}
          <LeadMobileCardList
            leads={leads}
            onViewDetails={(lead) => setDetailLead(lead)}
            onEditLead={(lead) => {
              setEditingLead(lead);
              setIsUpsertOpen(true);
            }}
            onDeleteLead={(lead) => setDeletingLead(lead)}
            onQuickStatusChange={handleQuickStatusChange}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs text-zinc-400">
              <div>
                Page <span className="font-semibold text-zinc-200">{page}</span> of{" "}
                <span className="font-semibold text-zinc-200">{totalPages}</span> ({totalCount} total)
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isPending}
                  onClick={() => refreshLeads(page - 1)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 disabled:opacity-40 text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages || isPending}
                  onClick={() => refreshLeads(page + 1)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 disabled:opacity-40 text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-sm font-bold text-zinc-200">No leads found</h2>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm">
            {search || status !== "all"
              ? "No leads matched your filter criteria. Try adjusting or clearing filters."
              : "Your client acquisition pipeline is empty. Add your first prospect or import a CSV list."}
          </p>

          <div className="mt-5 flex items-center gap-3">
            {search || status !== "all" ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Clear Filters
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsCsvWizardOpen(true)}
                  className="min-h-[44px] flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingLead(null);
                    setIsUpsertOpen(true);
                  }}
                  className="min-h-[44px] flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-zinc-950"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Lead</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <LeadUpsertModal
        isOpen={isUpsertOpen}
        onClose={() => {
          setIsUpsertOpen(false);
          setEditingLead(null);
        }}
        onSubmit={handleUpsertSubmit}
        initialData={editingLead}
      />

      <LeadDetailModal
        lead={detailLead}
        onClose={() => setDetailLead(null)}
        onEdit={(lead) => {
          setEditingLead(lead);
          setIsUpsertOpen(true);
        }}
      />

      <LeadDeleteConfirmModal
        lead={deletingLead}
        isOpen={Boolean(deletingLead)}
        onClose={() => setDeletingLead(null)}
        onConfirm={handleDeleteConfirm}
        loading={false}
      />

      <CsvImportWizard
        isOpen={isCsvWizardOpen}
        onClose={() => setIsCsvWizardOpen(false)}
        existingLeads={leads}
        onImportSuccess={() => {
          setIsCsvWizardOpen(false);
          refreshLeads(1);
        }}
      />
    </div>
  );
}

