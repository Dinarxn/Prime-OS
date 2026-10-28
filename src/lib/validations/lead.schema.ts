import { z } from "zod";
import type { LeadStatus, LeadPriority, LeadSource } from "@/types/database.types";

export const LEAD_STATUSES: [LeadStatus, ...LeadStatus[]] = [
  "New",
  "Contacted",
  "Interested",
  "Follow-up",
  "Meeting",
  "Proposal",
  "Won",
  "Lost",
];

export const LEAD_PRIORITIES: [LeadPriority, ...LeadPriority[]] = [
  "low",
  "medium",
  "high",
  "urgent",
];

export const LEAD_SOURCES: [LeadSource, ...LeadSource[]] = [
  "manual",
  "csv_import",
  "google_maps",
  "website",
  "inbound",
  "other",
];

export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Keep only digits
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 5) return null;
  // If standard US 11 digits starting with 1, strip country code for consistent 10-digit matching
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.substring(1);
  }
  return digits;
}

export function normalizeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Reject javascript: or data: URIs
  if (/^(javascript|data):/i.test(trimmed)) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const LeadSchema = z.object({
  business_name: z
    .string()
    .trim()
    .min(1, "Business name is required")
    .max(200, "Business name cannot exceed 200 characters"),
  contact_person: z
    .string()
    .trim()
    .max(150, "Contact person cannot exceed 150 characters")
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)),
  phone: z
    .string()
    .nullable()
    .optional()
    .transform((val) => normalizePhone(val)),
  email: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val.toLowerCase() : null))
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Please enter a valid email address"
    ),
  website_url: z
    .string()
    .nullable()
    .optional()
    .transform((val) => normalizeUrl(val)),
  category: z
    .string()
    .trim()
    .max(100)
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)),
  address: z
    .string()
    .trim()
    .max(300)
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)),
  city: z
    .string()
    .trim()
    .max(100)
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)),
  rating: z
    .number()
    .min(0, "Rating cannot be negative")
    .max(5, "Rating cannot exceed 5.0")
    .nullable()
    .optional(),
  google_maps_url: z
    .string()
    .nullable()
    .optional()
    .transform((val) => normalizeUrl(val)),
  instagram_url: z
    .string()
    .nullable()
    .optional()
    .transform((val) => normalizeUrl(val)),
  whatsapp_number: z
    .string()
    .nullable()
    .optional()
    .transform((val) => normalizePhone(val)),
  source: z.enum(LEAD_SOURCES).default("manual"),
  status: z.enum(LEAD_STATUSES).default("New"),
  priority: z.enum(LEAD_PRIORITIES).default("medium"),
  notes: z
    .string()
    .trim()
    .max(5000, "Notes cannot exceed 5,000 characters")
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)),
});

export type LeadInput = z.input<typeof LeadSchema>;
export type LeadOutput = z.output<typeof LeadSchema>;

export const LeadFilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  city: z.string().optional(),
  priority: z.string().optional(),
  source: z.string().optional(),
  hasWebsite: z.enum(["all", "yes", "no"]).default("all"),
  sortBy: z.enum(["created_at", "business_name", "rating", "status"]).default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(5).max(100).default(25),
});

export type LeadFilterInput = z.infer<typeof LeadFilterSchema>;
