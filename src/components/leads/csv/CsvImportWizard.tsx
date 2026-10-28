"use client";

import { useState } from "react";
import {
  X,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  CopyCheck,
  RefreshCw,
} from "lucide-react";
import { parseCsvText } from "@/lib/csv/parser";
import {
  autoDetectMapping,
  SUPPORTED_LEAD_FIELDS,
  type SupportedLeadFieldKey,
} from "@/lib/csv/header-mapper";
import { LeadSchema, type LeadInput } from "@/lib/validations/lead.schema";
import { detectDuplicates, type DuplicateMatch } from "@/lib/csv/duplicate-detector";
import { importLeadsBatchAction } from "@/actions/leads.actions";
import type { LeadRow } from "@/types/database.types";

interface CsvImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  existingLeads: LeadRow[];
  onImportSuccess: () => void;
}

type WizardStep = "upload" | "mapping" | "validation" | "duplicates" | "importing" | "complete";

export function CsvImportWizard({
  isOpen,
  onClose,
  existingLeads,
  onImportSuccess,
}: CsvImportWizardProps) {
  const [step, setStep] = useState<WizardStep>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, SupportedLeadFieldKey | "">>({});

  // Validation state
  const [validLeads, setValidLeads] = useState<LeadInput[]>([]);
  const [invalidRows, setInvalidRows] = useState<{ row: number; error: string }[]>([]);

  // Duplicate state
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Ingestion state
  const [progress, setProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<{
    totalImported: number;
    totalSkipped: number;
    errors: string[];
  }>({ totalImported: 0, totalSkipped: 0, errors: [] });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Step A: File Selection & Parsing
  function handleFileSelect(file: File) {
    setErrorMsg(null);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMsg("Please upload a valid .csv file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5MB limit.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCsvText(text);

      if (result.error || result.headers.length === 0) {
        setErrorMsg(result.error || "Could not parse CSV headers.");
        return;
      }

      setHeaders(result.headers);
      setRawRows(result.rows);
      setMapping(autoDetectMapping(result.headers));
      setStep("mapping");
    };
    reader.onerror = () => {
      setErrorMsg("Error reading file.");
    };
    reader.readAsText(file);
  }

  // Step B -> C: Validate Rows using Mappings
  function handleProcessMapping() {
    // Ensure business_name is mapped
    const hasBusinessName = Object.values(mapping).includes("business_name");
    if (!hasBusinessName) {
      setErrorMsg("You must map at least the 'Business Name' field to continue.");
      return;
    }

    setErrorMsg(null);
    const valids: LeadInput[] = [];
    const invalids: { row: number; error: string }[] = [];

    rawRows.forEach((row, idx) => {
      const candidate: Record<string, unknown> = {
        source: "csv_import",
      };

      for (const [csvCol, targetField] of Object.entries(mapping)) {
        if (targetField && row[csvCol]) {
          candidate[targetField] = row[csvCol].trim();
        }
      }

      if (candidate.rating && typeof candidate.rating === "string") {
        const parsed = parseFloat(candidate.rating);
        candidate.rating = isNaN(parsed) ? null : parsed;
      }

      const parseResult = LeadSchema.safeParse(candidate);
      if (parseResult.success) {
        valids.push(parseResult.data);
      } else {
        invalids.push({
          row: idx + 2, // 1-indexed, skipping header
          error: parseResult.error.issues[0]?.message || "Invalid row data",
        });
      }
    });

    setValidLeads(valids);
    setInvalidRows(invalids);

    // Run duplicate detection on valid leads
    const dupCheckItems = valids.map((lead, idx) => ({
      index: idx,
      business_name: lead.business_name,
      phone: lead.phone,
      email: lead.email,
      city: lead.city,
    }));

    const dupMatches = detectDuplicates(dupCheckItems, existingLeads);
    setDuplicates(dupMatches);

    setStep("validation");
  }

  // Step E: Commit Import in Bounded Chunks
  async function handleExecuteImport() {
    setStep("importing");
    setProgress(5);

    // Filter duplicates if user chose to skip
    let toImport = [...validLeads];
    const dupIndices = new Set(duplicates.map((d) => d.index));

    if (skipDuplicates && dupIndices.size > 0) {
      toImport = toImport.filter((_, idx) => !dupIndices.has(idx));
    }

    const skippedDupsCount = skipDuplicates ? dupIndices.size : 0;
    const chunkSize = 50;
    let totalImported = 0;
    const errors: string[] = [];

    for (let i = 0; i < toImport.length; i += chunkSize) {
      const batch = toImport.slice(i, i + chunkSize);
      const res = await importLeadsBatchAction(batch);

      if (res.success && res.data) {
        totalImported += res.data.importedCount;
        if (res.data.errors) errors.push(...res.data.errors);
      } else {
        errors.push(res.error || "Failed batch ingestion");
      }

      const currentPercent = Math.min(
        95,
        Math.round(((i + batch.length) / toImport.length) * 100)
      );
      setProgress(currentPercent);
    }

    setProgress(100);
    setImportSummary({
      totalImported,
      totalSkipped: skippedDupsCount + invalidRows.length,
      errors,
    });
    setStep("complete");
    onImportSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 shadow-2xl space-y-6">
        {/* Wizard Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-100">CSV Lead Import Wizard</h2>
            <p className="text-xs text-zinc-400">
              {step === "upload" && "Step 1 of 5: Select CSV file"}
              {step === "mapping" && "Step 2 of 5: Map CSV columns to lead fields"}
              {step === "validation" && "Step 3 of 5: Review validation results"}
              {step === "duplicates" && "Step 4 of 5: Review duplicate detection"}
              {step === "importing" && "Step 5 of 5: Ingesting records..."}
              {step === "complete" && "Import Finished"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {step === "upload" && (
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-emerald-500/60 bg-zinc-950/40 p-8 text-center cursor-pointer transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-emerald-400">
                <Upload className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-200">
                  Click to browse or drop your CSV file here
                </p>
                <p className="text-xs text-zinc-500">
                  Supports UTF-8 encoded .csv files up to 5MB (approx. 10,000+ leads)
                </p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                }}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* STEP 2: COLUMN MAPPING */}
        {step === "mapping" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>File: <strong className="text-zinc-200">{fileName}</strong> ({rawRows.length} rows)</span>
              <span>Matched Columns: {Object.values(mapping).filter(Boolean).length} / {headers.length}</span>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-xl border border-zinc-800 divide-y divide-zinc-800/80 bg-zinc-950/40">
              {headers.map((col) => (
                <div key={col} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-xs font-semibold text-zinc-200 block truncate">
                      {col}
                    </span>
                    {rawRows[0]?.[col] && (
                      <span className="text-[11px] text-zinc-500 truncate block">
                        Sample: &ldquo;{rawRows[0][col]}&rdquo;
                      </span>
                    )}
                  </div>

                  <select
                    value={mapping[col] || ""}
                    onChange={(e) =>
                      setMapping({ ...mapping, [col]: (e.target.value as SupportedLeadFieldKey) || "" })
                    }
                    className="min-h-[44px] rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[16px] md:text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">— Do Not Import —</option>
                    {SUPPORTED_LEAD_FIELDS.map((field) => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="min-h-[44px] flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-3 py-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleProcessMapping}
                className="min-h-[44px] flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-5 py-2 text-xs font-bold transition-colors"
              >
                <span>Continue to Validation</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ROW VALIDATION */}
        {step === "validation" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-base font-bold text-zinc-100 font-mono">{validLeads.length}</div>
                  <div className="text-xs text-emerald-400">Valid Leads Ready</div>
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-amber-400 shrink-0" />
                <div>
                  <div className="text-base font-bold text-zinc-100 font-mono">{invalidRows.length}</div>
                  <div className="text-xs text-amber-400">Invalid Rows (Will be skipped)</div>
                </div>
              </div>
            </div>

            {invalidRows.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-300">Invalid Rows Sample:</div>
                <div className="max-h-36 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 space-y-1 font-mono text-[11px] text-rose-400">
                  {invalidRows.slice(0, 5).map((inv, idx) => (
                    <div key={idx}>
                      Line {inv.row}: {inv.error}
                    </div>
                  ))}
                  {invalidRows.length > 5 && (
                    <div className="text-zinc-500 pt-1">
                      ...and {invalidRows.length - 5} more invalid rows
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep("mapping")}
                className="min-h-[44px] flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-3 py-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Adjust Mappings</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(duplicates.length > 0 ? "duplicates" : "validation")}
                onMouseDown={() => {
                  if (duplicates.length > 0) setStep("duplicates");
                  else handleExecuteImport();
                }}
                className="min-h-[44px] flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-5 py-2 text-xs font-bold transition-colors"
              >
                <span>{duplicates.length > 0 ? "Review Duplicates" : "Start Ingestion"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DUPLICATE REVIEW */}
        {step === "duplicates" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                <CopyCheck className="h-4 w-4" />
                <span>{duplicates.length} Potential Duplicate Records Detected</span>
              </div>
              <p className="text-xs text-zinc-400">
                Matches were identified based on existing phone numbers, email addresses, or business names.
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 cursor-pointer">
                <input
                  type="radio"
                  name="dupStrategy"
                  checked={skipDuplicates}
                  onChange={() => setSkipDuplicates(true)}
                  className="h-4 w-4 text-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-semibold text-zinc-200 block">Skip Duplicates (Recommended)</span>
                  <span className="text-zinc-500">
                    Import only unique net-new prospects ({validLeads.length - duplicates.length} leads).
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 cursor-pointer">
                <input
                  type="radio"
                  name="dupStrategy"
                  checked={!skipDuplicates}
                  onChange={() => setSkipDuplicates(false)}
                  className="h-4 w-4 text-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-semibold text-zinc-200 block">Import All Anyway</span>
                  <span className="text-zinc-500">
                    Proceed with all {validLeads.length} valid rows without skipping duplicates.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep("validation")}
                className="min-h-[44px] flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-3 py-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                className="min-h-[44px] flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-5 py-2 text-xs font-bold transition-colors"
              >
                <span>Confirm & Ingest Leads</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: IMPORTING PROGRESS */}
        {step === "importing" && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
            <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-100">Ingesting Leads into Workspace...</h3>
              <p className="text-xs text-zinc-400">Processing in secure batches with server validation</p>
            </div>
            <div className="w-full max-w-xs bg-zinc-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-xs text-zinc-400">{progress}%</span>
          </div>
        )}

        {/* STEP 6: COMPLETE SUMMARY */}
        {step === "complete" && (
          <div className="space-y-5 text-center py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-100">CSV Ingestion Complete!</h3>
              <p className="text-xs text-zinc-400">
                Your leads have been safely validated and added to the pipeline.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-1">
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Imported</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {importSummary.totalImported}
                </span>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-1">
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Skipped</span>
                <span className="text-xl font-bold font-mono text-zinc-400">
                  {importSummary.totalSkipped}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[44px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold py-2.5 transition-colors"
            >
              View Leads in Pipeline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
