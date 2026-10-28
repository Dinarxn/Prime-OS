import { describe, it, expect } from "vitest";
import { autoDetectMapping } from "@/lib/csv/header-mapper";

describe("CSV Header Alias Auto-Detection", () => {
  it("matches standard column names", () => {
    const headers = ["business_name", "phone", "email", "city"];
    const mapping = autoDetectMapping(headers);

    expect(mapping["business_name"]).toBe("business_name");
    expect(mapping["phone"]).toBe("phone");
    expect(mapping["email"]).toBe("email");
    expect(mapping["city"]).toBe("city");
  });

  it("matches common synonym variations", () => {
    const headers = [
      "Company Name",
      "Contact Person",
      "Mobile Phone",
      "E-mail Address",
      "Web URL",
      "Google Rating",
    ];
    const mapping = autoDetectMapping(headers);

    expect(mapping["Company Name"]).toBe("business_name");
    expect(mapping["Contact Person"]).toBe("contact_person");
    expect(mapping["Mobile Phone"]).toBe("phone");
    expect(mapping["E-mail Address"]).toBe("email");
    expect(mapping["Web URL"]).toBe("website_url");
    expect(mapping["Google Rating"]).toBe("rating");
  });

  it("leaves unknown headers unmapped", () => {
    const headers = ["Internal ID", "Random_Data_Field"];
    const mapping = autoDetectMapping(headers);

    expect(mapping["Internal ID"]).toBe("");
    expect(mapping["Random_Data_Field"]).toBe("");
  });
});

