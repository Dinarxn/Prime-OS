import { describe, it, expect, beforeEach } from "vitest";
import {
  createLeadAction,
  getLeadsAction,
  updateLeadAction,
  deleteLeadAction,
  bulkDeleteLeadsAction,
  bulkUpdateStatusAction,
  importLeadsBatchAction,
} from "@/actions/leads.actions";
import { memoryLeads } from "@/lib/mock-leads";

describe("Leads Server Actions & Persistence", () => {
  beforeEach(() => {
    // Reset to clean test state
    memoryLeads.length = 0;
    memoryLeads.push({
      id: "test-lead-1",
      workspace_id: "00000000-0000-0000-0000-000000000001",
      business_name: "Original Lead",
      contact_person: "John Doe",
      phone: "+15551112222",
      email: "john@original.com",
      website_url: "https://original.com",
      category: "Tech",
      address: null,
      city: "Austin",
      rating: 4.5,
      google_maps_url: null,
      instagram_url: null,
      whatsapp_number: null,
      source: "manual",
      status: "New",
      priority: "medium",
      notes: "Test notes",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });

  it("creates a new lead with server validation", async () => {
    const res = await createLeadAction({
      business_name: "Brand New Corp",
      contact_person: "Jane Doe",
      phone: "+15553334444",
      email: "jane@brandnew.com",
      city: "Dallas",
      status: "Contacted",
      priority: "high",
    });

    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data?.business_name).toBe("Brand New Corp");
    expect(res.data?.status).toBe("Contacted");
  });

  it("rejects lead creation with invalid required fields", async () => {
    const res = await createLeadAction({
      business_name: "   ", // whitespace only
    });

    expect(res.success).toBe(false);
    expect(res.fieldErrors?.business_name).toBeDefined();
  });

  it("filters leads by search query and city", async () => {
    // Add second lead
    await createLeadAction({
      business_name: "Searchable Unique Business",
      city: "Houston",
    });

    const searchRes = await getLeadsAction({ search: "Unique" });
    expect(searchRes.success).toBe(true);
    expect(searchRes.data?.leads.length).toBe(1);
    expect(searchRes.data?.leads[0].business_name).toBe("Searchable Unique Business");

    const cityRes = await getLeadsAction({ city: "Austin" });
    expect(cityRes.success).toBe(true);
    expect(cityRes.data?.leads.every((l) => l.city === "Austin")).toBe(true);
  });

  it("updates an existing lead safely", async () => {
    const res = await updateLeadAction("test-lead-1", {
      status: "Won",
      rating: 5.0,
    });

    expect(res.success).toBe(true);
    expect(res.data?.status).toBe("Won");
    expect(res.data?.rating).toBe(5.0);
  });

  it("deletes a lead by id", async () => {
    const res = await deleteLeadAction("test-lead-1");
    expect(res.success).toBe(true);

    const getRes = await getLeadsAction();
    expect(getRes.data?.leads.find((l) => l.id === "test-lead-1")).toBeUndefined();
  });

  it("supports bulk status change and bulk delete", async () => {
    const leadA = await createLeadAction({ business_name: "Lead A" });
    const leadB = await createLeadAction({ business_name: "Lead B" });

    const ids = [leadA.data!.id, leadB.data!.id];

    const bulkUpdateRes = await bulkUpdateStatusAction(ids, "Meeting");
    expect(bulkUpdateRes.success).toBe(true);
    expect(bulkUpdateRes.data?.updatedCount).toBe(2);

    const bulkDeleteRes = await bulkDeleteLeadsAction(ids);
    expect(bulkDeleteRes.success).toBe(true);
    expect(bulkDeleteRes.data?.deletedCount).toBe(2);
  });

  it("imports batches safely with bounded size", async () => {
    const batch = [
      { business_name: "Batch Lead 1", phone: "+15551110001", source: "csv_import" as const },
      { business_name: "Batch Lead 2", phone: "+15551110002", source: "csv_import" as const },
    ];

    const res = await importLeadsBatchAction(batch);
    expect(res.success).toBe(true);
    expect(res.data?.importedCount).toBe(2);
    expect(res.data?.failedCount).toBe(0);
  });
});

