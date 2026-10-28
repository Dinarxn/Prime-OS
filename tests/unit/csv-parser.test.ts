import { describe, it, expect } from "vitest";
import { parseCsvText } from "@/lib/csv/parser";

describe("RFC 4180 CSV Parser", () => {
  it("parses standard CSV correctly", () => {
    const csv = `business_name,contact_person,phone\nApex Dental,Dr. Smith,5551234\nVanguard Law,Sarah Jenkins,5559876`;
    const result = parseCsvText(csv);

    expect(result.error).toBeUndefined();
    expect(result.headers).toEqual(["business_name", "contact_person", "phone"]);
    expect(result.rows.length).toBe(2);
    expect(result.rows[0]["business_name"]).toBe("Apex Dental");
    expect(result.rows[1]["contact_person"]).toBe("Sarah Jenkins");
  });

  it("handles commas inside quoted strings", () => {
    const csv = `business_name,address,city\n"Apex, Dental, LLC","104 Main St, Suite 2",Austin`;
    const result = parseCsvText(csv);

    expect(result.rows.length).toBe(1);
    expect(result.rows[0]["business_name"]).toBe("Apex, Dental, LLC");
    expect(result.rows[0]["address"]).toBe("104 Main St, Suite 2");
    expect(result.rows[0]["city"]).toBe("Austin");
  });

  it("handles escaped quotes properly", () => {
    const csv = `business_name,notes\n"Apex ""Premium"" Dental","High value client"`;
    const result = parseCsvText(csv);

    expect(result.rows.length).toBe(1);
    expect(result.rows[0]["business_name"]).toBe('Apex "Premium" Dental');
    expect(result.rows[0]["notes"]).toBe("High value client");
  });

  it("handles UTF-8 accented characters and umlauts", () => {
    const csv = `business_name,city\nCafé René,München\nSão Paulo Agency,São Paulo`;
    const result = parseCsvText(csv);

    expect(result.rows.length).toBe(2);
    expect(result.rows[0]["business_name"]).toBe("Café René");
    expect(result.rows[0]["city"]).toBe("München");
    expect(result.rows[1]["business_name"]).toBe("São Paulo Agency");
  });

  it("strips UTF-8 BOM if present", () => {
    const csv = `\uFEFFbusiness_name,phone\nApex Dental,5551234`;
    const result = parseCsvText(csv);

    expect(result.headers[0]).toBe("business_name");
    expect(result.rows.length).toBe(1);
  });

  it("returns error on completely empty input", () => {
    const result = parseCsvText("   \n\n  ");
    expect(result.error).toBeDefined();
    expect(result.rows.length).toBe(0);
  });
});

