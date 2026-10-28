"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import type { LeadRow } from "@/types/database.types";

interface LeadDeleteConfirmModalProps {
  lead: LeadRow | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export function LeadDeleteConfirmModal({
  lead,
  isOpen,
  onClose,
  onConfirm,
  loading,
}: LeadDeleteConfirmModalProps) {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-zinc-900 p-6 shadow-2xl space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-zinc-100">Delete Lead?</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-zinc-200">
                &ldquo;{lead.business_name}&rdquo;
              </span>
              ? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-[44px] rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 px-5 py-2 text-xs font-bold text-white transition-colors"
          >
            {loading ? (
              <span>Deleting...</span>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
