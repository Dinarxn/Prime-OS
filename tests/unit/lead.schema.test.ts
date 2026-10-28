import { describe, it, expect } from "vitest";
import {
  LeadSchema,
  normalizePhone,
  normalizeUrl,
} from "@/lib/validations/lead.schema";

describe("Lead Validation & Normalization", () => {
  it("validates a minimal valid lead", () => {
    const result = LeadSchema.safeParse({
      business_name: "Acme Corp",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.business_name).toBe("Acme Corp");
      expect(result.data.status).toBe("New");
      expect(result.data.priority).toBe("medium");
      expect(result.data.source).toBe("manual");
    }
  });

  it("rejects an empty business name", () => {
    const result = LeadSchema.safeParse({
      business_name: "   ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Business name is required");
    }
  });

  it("normalizes phone numbers to digits and leading plus", () => {
    expect(normalizePhone("+1 (555) 234-5678")).toBe("5552345678");
    expect(normalizePhone("555-234-5678")).toBe("5552345678");
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone(null)).toBeNull();
    expect(normalizePhone("12")).toBeNull(); // Less than 5 digits
  });

  it("normalizes website URLs and prepends https://", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com");
    expect(normalizeUrl("http://example.com")).toBe("http://example.com");
    expect(normalizeUrl("https://example.com")).toBe("https://example.com");
    expect(normalizeUrl("")).toBeNull();
    expect(normalizeUrl("javascript:alert(1)")).toBeNull();
  });

  it("validates emails and converts to lowercase", () => {
    const valid = LeadSchema.safeParse({
      business_name: "Test",
      email: "USER@EXAMPLE.COM",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.email).toBe("user@example.com");
    }

    const invalid = LeadSchema.safeParse({
      business_name: "Test",
      email: "not-an-email",
    });
    expect(invalid.success).toBe(false);
  });

  it("enforces rating boundaries between 0 and 5", () => {
    const valid = LeadSchema.safeParse({
      business_name: "Test",
      rating: 4.8,
    });
    expect(valid.success).toBe(true);

    const negative = LeadSchema.safeParse({
      business_name: "Test",
      rating: -1,
    });
    expect(negative.success).toBe(false);

    const tooHigh = LeadSchema.safeParse({
      business_name: "Test",
      rating: 6.0,
    });
    expect(tooHigh.success).toBe(false);
  });
});
