import { describe, it, expect } from "vitest";
import { detectDuplicates } from "@/lib/csv/duplicate-detector";
import type { LeadRow } from "@/types/database.types";

describe("CSV Duplicate Detection", () => {
  const existingLeads: LeadRow[] = [
    {
      id: "lead-1",
      workspace_id: "ws-1",
      business_name: "Apex Dental",
      contact_person: "Dr. Smith",
      phone: "+15551234567",
      email: "contact@apexdental.com",
      website_url: "https://apexdental.com",
      category: "Dental",
      address: null,
      city: "Austin",
      rating: 4.8,
      google_maps_url: null,
      instagram_url: null,
      whatsapp_number: null,
      source: "manual",
      status: "New",
      priority: "high",
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  it("detects duplicates matching existing database phone numbers", () => {
    const incoming = [
      {
        index: 0,
        business_name: "Apex Dental Clinic",
        phone: "(555) 123-4567", // Same normalized phone
        email: "different@email.com",
        city: "Austin",
      },
    ];

    const matches = detectDuplicates(incoming, existingLeads);
    expect(matches.length).toBe(1);
    expect(matches[0].reason).toBe("phone");
    expect(matches[0].isExistingLead).toBe(true);
  });

  it("detects duplicates matching existing database emails (case-insensitive)", () => {
    const incoming = [
      {
        index: 0,
        business_name: "Apex Branch",
        phone: "+15559999999",
        email: "CONTACT@APEXDENTAL.COM",
        city: "Austin",
      },
    ];

    const matches = detectDuplicates(incoming, existingLeads);
    expect(matches.length).toBe(1);
    expect(matches[0].reason).toBe("email");
  });

  it("detects intra-file duplicate rows inside the CSV itself", () => {
    const incoming = [
      {
        index: 0,
        business_name: "Unique Business A",
        phone: "+15550001111",
        email: "a@test.com",
        city: "Dallas",
      },
      {
        index: 1,
        business_name: "Repeated Row",
        phone: "+15550001111", // Repeated phone
        email: "different@test.com",
        city: "Dallas",
      },
    ];

    const matches = detectDuplicates(incoming, []);
    expect(matches.length).toBe(1);
    expect(matches[0].index).toBe(1);
    expect(matches[0].reason).toBe("phone");
    expect(matches[0].isExistingLead).toBe(false);
  });

  it("returns zero matches when all rows are unique", () => {
    const incoming = [
      {
        index: 0,
        business_name: "Brand New A",
        phone: "+15551112222",
        email: "newa@test.com",
        city: "Houston",
      },
      {
        index: 1,
        business_name: "Brand New B",
        phone: "+15553334444",
        email: "newb@test.com",
        city: "Houston",
      },
    ];

    const matches = detectDuplicates(incoming, existingLeads);
    expect(matches.length).toBe(0);
  });
});

