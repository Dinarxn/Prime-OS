"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  LeadSchema,
  LeadFilterSchema,
  type LeadInput,
  type LeadOutput,
  type LeadFilterInput,
} from "@/lib/validations/lead.schema";
import type {
  LeadRow,
  LeadStatus,
  LeadPriority,
  LeadSource,
  LeadInsert,
  LeadUpdate,
} from "@/types/database.types";
import { memoryLeads, DEFAULT_WORKSPACE_ID } from "@/lib/mock-leads";

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface GetLeadsResult {
  leads: LeadRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  statusCounts: Record<string, number>;
  cities: string[];
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Outside Next.js request context (e.g. unit tests)
  }
}

// Helper to determine if live Supabase is configured
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("placeholder"));
}

export async function getLeadsAction(
  rawFilters?: Partial<LeadFilterInput>
): Promise<ActionResult<GetLeadsResult>> {
  try {
    const filters = LeadFilterSchema.parse(rawFilters ?? {});

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      let query = supabase.from("leads").select("*", { count: "exact" });

      if (filters.search) {
        query = query.or(
          `business_name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status as LeadStatus);
      }
      if (filters.city && filters.city !== "all") {
        query = query.eq("city", filters.city);
      }
      if (filters.priority && filters.priority !== "all") {
        query = query.eq("priority", filters.priority as LeadPriority);
      }
      if (filters.source && filters.source !== "all") {
        query = query.eq("source", filters.source as LeadSource);
      }
      if (filters.hasWebsite === "yes") {
        query = query.not("website_url", "is", null);
      } else if (filters.hasWebsite === "no") {
        query = query.is("website_url", null);
      }

      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize - 1;

      query = query
        .order(filters.sortBy, { ascending: filters.sortOrder === "asc" })
        .range(from, to);

      const { data, count, error } = await query;
      if (error) {
        return { success: false, error: error.message };
      }

      const totalCount = count ?? 0;
      return {
        success: true,
        data: {
          leads: (data as LeadRow[]) || [],
          totalCount,
          page: filters.page,
          pageSize: filters.pageSize,
          totalPages: Math.ceil(totalCount / filters.pageSize) || 1,
          statusCounts: {},
          cities: [],
        },
      };
    }

    // Memory Store Implementation (Fallback & Development Mode)
    let filtered = [...memoryLeads];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.business_name.toLowerCase().includes(s) ||
          (l.contact_person && l.contact_person.toLowerCase().includes(s)) ||
          (l.phone && l.phone.includes(s)) ||
          (l.email && l.email.toLowerCase().includes(s))
      );
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((l) => l.status === filters.status);
    }
    if (filters.city && filters.city !== "all") {
      filtered = filtered.filter((l) => l.city === filters.city);
    }
    if (filters.priority && filters.priority !== "all") {
      filtered = filtered.filter((l) => l.priority === filters.priority);
    }
    if (filters.source && filters.source !== "all") {
      filtered = filtered.filter((l) => l.source === filters.source);
    }
    if (filters.hasWebsite === "yes") {
      filtered = filtered.filter((l) => Boolean(l.website_url));
    } else if (filters.hasWebsite === "no") {
      filtered = filtered.filter((l) => !l.website_url);
    }

    // Calculate status counts & distinct cities across all leads
    const statusCounts: Record<string, number> = {};
    const citySet = new Set<string>();
    for (const lead of memoryLeads) {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
      if (lead.city) citySet.add(lead.city);
    }

    // Sorting
    filtered.sort((a, b) => {
      const dir = filters.sortOrder === "asc" ? 1 : -1;
      if (filters.sortBy === "business_name") {
        return a.business_name.localeCompare(b.business_name) * dir;
      }
      if (filters.sortBy === "rating") {
        return ((a.rating || 0) - (b.rating || 0)) * dir;
      }
      if (filters.sortBy === "status") {
        return a.status.localeCompare(b.status) * dir;
      }
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
    });

    const totalCount = filtered.length;
    const from = (filters.page - 1) * filters.pageSize;
    const paginated = filtered.slice(from, from + filters.pageSize);

    return {
      success: true,
      data: {
        leads: paginated,
        totalCount,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(totalCount / filters.pageSize) || 1,
        statusCounts,
        cities: Array.from(citySet).sort(),
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load leads";
    return { success: false, error: message };
  }
}

export async function createLeadAction(
  rawInput: unknown
): Promise<ActionResult<LeadRow>> {
  try {
    const validated = LeadSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: "Validation failed. Please correct form fields.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const data: LeadOutput = validated.data;

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Resolve workspace ID from user's profile
      let workspaceId = DEFAULT_WORKSPACE_ID;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("active_workspace_id")
          .eq("id", user.id)
          .single();
        if (profile?.active_workspace_id) {
          workspaceId = profile.active_workspace_id;
        }
      }

      const insertPayload: LeadInsert = {
        ...data,
        workspace_id: workspaceId,
      };

      const { data: inserted, error } = await supabase
        .from("leads")
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      safeRevalidate("/leads");
      return { success: true, data: inserted as LeadRow };
    }

    // Memory Store
    const newLead: LeadRow = {
      id: `lead-${Date.now()}`,
      workspace_id: DEFAULT_WORKSPACE_ID,
      business_name: data.business_name,
      contact_person: data.contact_person || null,
      phone: data.phone || null,
      email: data.email || null,
      website_url: data.website_url || null,
      category: data.category || null,
      address: data.address || null,
      city: data.city || null,
      rating: data.rating ?? null,
      google_maps_url: data.google_maps_url || null,
      instagram_url: data.instagram_url || null,
      whatsapp_number: data.whatsapp_number || null,
      source: data.source,
      status: data.status,
      priority: data.priority,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryLeads.unshift(newLead);
    safeRevalidate("/leads");
    return { success: true, data: newLead };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create lead";
    return { success: false, error: message };
  }
}

export async function updateLeadAction(
  id: string,
  rawInput: unknown
): Promise<ActionResult<LeadRow>> {
  try {
    const validated = LeadSchema.partial().safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: "Validation failed. Please correct form fields.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const updates = validated.data as LeadUpdate;

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: updated, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      safeRevalidate("/leads");
      return { success: true, data: updated as LeadRow };
    }

    // Memory Store
    const index = memoryLeads.findIndex((l) => l.id === id);
    if (index === -1) {
      return { success: false, error: "Lead not found" };
    }

    const existing = memoryLeads[index];
    const updatedLead: LeadRow = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    memoryLeads[index] = updatedLead;
    safeRevalidate("/leads");
    return { success: true, data: updatedLead };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update lead";
    return { success: false, error: message };
  }
}

export async function deleteLeadAction(id: string): Promise<ActionResult> {
  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) {
        return { success: false, error: error.message };
      }
      safeRevalidate("/leads");
      return { success: true };
    }

    // Memory Store
    const index = memoryLeads.findIndex((l) => l.id === id);
    if (index !== -1) {
      memoryLeads.splice(index, 1);
    }
    safeRevalidate("/leads");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete lead";
    return { success: false, error: message };
  }
}

export async function bulkDeleteLeadsAction(ids: string[]): Promise<ActionResult<{ deletedCount: number }>> {
  try {
    if (!ids.length) return { success: true, data: { deletedCount: 0 } };

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { error } = await supabase.from("leads").delete().in("id", ids);
      if (error) return { success: false, error: error.message };
      safeRevalidate("/leads");
      return { success: true, data: { deletedCount: ids.length } };
    }

    // Memory Store
    const idSet = new Set(ids);
    let deletedCount = 0;
    for (let i = memoryLeads.length - 1; i >= 0; i--) {
      if (idSet.has(memoryLeads[i].id)) {
        memoryLeads.splice(i, 1);
        deletedCount++;
      }
    }

    safeRevalidate("/leads");
    return { success: true, data: { deletedCount } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to bulk delete leads";
    return { success: false, error: message };
  }
}

export async function bulkUpdateStatusAction(
  ids: string[],
  status: LeadStatus
): Promise<ActionResult<{ updatedCount: number }>> {
  try {
    if (!ids.length) return { success: true, data: { updatedCount: 0 } };

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("leads")
        .update({ status } as LeadUpdate)
        .in("id", ids);
      if (error) return { success: false, error: error.message };
      safeRevalidate("/leads");
      return { success: true, data: { updatedCount: ids.length } };
    }

    // Memory Store
    const idSet = new Set(ids);
    let updatedCount = 0;
    for (const lead of memoryLeads) {
      if (idSet.has(lead.id)) {
        lead.status = status;
        lead.updated_at = new Date().toISOString();
        updatedCount++;
      }
    }

    safeRevalidate("/leads");
    return { success: true, data: { updatedCount } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to bulk update status";
    return { success: false, error: message };
  }
}

export async function importLeadsBatchAction(
  leads: LeadInput[]
): Promise<ActionResult<{ importedCount: number; failedCount: number; errors: string[] }>> {
  try {
    // Bound batch size to 100 max per request to avoid unbounded payload attacks
    const safeBatch = leads.slice(0, 100);
    const validRows: LeadOutput[] = [];
    const errors: string[] = [];

    for (let i = 0; i < safeBatch.length; i++) {
      const result = LeadSchema.safeParse(safeBatch[i]);
      if (result.success) {
        validRows.push(result.data);
      } else {
        errors.push(`Row ${i + 1}: ${result.error.issues[0]?.message || "Invalid row"}`);
      }
    }

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let workspaceId = DEFAULT_WORKSPACE_ID;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("active_workspace_id")
          .eq("id", user.id)
          .single();
        if (profile?.active_workspace_id) {
          workspaceId = profile.active_workspace_id;
        }
      }

      const rowsToInsert: LeadInsert[] = validRows.map((r) => ({
        ...r,
        workspace_id: workspaceId,
        source: "csv_import" as const,
      }));

      const { error } = await supabase.from("leads").insert(rowsToInsert);
      if (error) {
        return {
          success: false,
          error: error.message,
          data: { importedCount: 0, failedCount: validRows.length + errors.length, errors },
        };
      }

      safeRevalidate("/leads");
      return {
        success: true,
        data: {
          importedCount: validRows.length,
          failedCount: errors.length,
          errors,
        },
      };
    }

    // Memory Store Ingestion
    for (const row of validRows) {
      memoryLeads.unshift({
        id: `lead-import-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        workspace_id: DEFAULT_WORKSPACE_ID,
        business_name: row.business_name,
        contact_person: row.contact_person || null,
        phone: row.phone || null,
        email: row.email || null,
        website_url: row.website_url || null,
        category: row.category || null,
        address: row.address || null,
        city: row.city || null,
        rating: row.rating ?? null,
        google_maps_url: row.google_maps_url || null,
        instagram_url: row.instagram_url || null,
        whatsapp_number: row.whatsapp_number || null,
        source: "csv_import",
        status: row.status || "New",
        priority: row.priority || "medium",
        notes: row.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    safeRevalidate("/leads");
    return {
      success: true,
      data: {
        importedCount: validRows.length,
        failedCount: errors.length,
        errors,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to import batch";
    return { success: false, error: message };
  }
}
