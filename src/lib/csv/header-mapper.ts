export const SUPPORTED_LEAD_FIELDS = [
  { key: "business_name", label: "Business Name *", required: true },
  { key: "contact_person", label: "Contact Person", required: false },
  { key: "phone", label: "Phone Number", required: false },
  { key: "email", label: "Email Address", required: false },
  { key: "website_url", label: "Website URL", required: false },
  { key: "category", label: "Category / Niche", required: false },
  { key: "city", label: "City", required: false },
  { key: "address", label: "Address", required: false },
  { key: "rating", label: "Rating (0-5)", required: false },
  { key: "whatsapp_number", label: "WhatsApp Number", required: false },
  { key: "status", label: "Pipeline Status", required: false },
  { key: "priority", label: "Priority", required: false },
  { key: "notes", label: "Notes", required: false },
] as const;

export type SupportedLeadFieldKey = (typeof SUPPORTED_LEAD_FIELDS)[number]["key"];

const HEADER_SYNONYMS: Record<SupportedLeadFieldKey, string[]> = {
  business_name: [
    "business_name",
    "business name",
    "company",
    "company name",
    "organization",
    "business",
    "client",
    "agency",
    "title",
    "store",
  ],
  contact_person: [
    "contact_person",
    "contact person",
    "contact",
    "contact name",
    "person",
    "owner",
    "full name",
    "first name",
    "name",
    "manager",
  ],
  phone: [
    "phone",
    "phone number",
    "telephone",
    "tel",
    "mobile",
    "mobile number",
    "cell",
    "contact number",
  ],
  email: [
    "email",
    "e-mail",
    "email address",
    "mail",
    "contact email",
  ],
  website_url: [
    "website_url",
    "website",
    "url",
    "site",
    "web",
    "domain",
    "homepage",
    "link",
  ],
  category: [
    "category",
    "niche",
    "industry",
    "type",
    "sector",
    "tag",
  ],
  city: [
    "city",
    "town",
    "location",
    "municipality",
  ],
  address: [
    "address",
    "street",
    "street address",
    "location address",
    "full address",
  ],
  rating: [
    "rating",
    "stars",
    "google rating",
    "review rating",
    "score",
  ],
  whatsapp_number: [
    "whatsapp_number",
    "whatsapp",
    "wa",
    "wa number",
    "whatsapp phone",
  ],
  status: [
    "status",
    "stage",
    "pipeline status",
    "pipeline stage",
  ],
  priority: [
    "priority",
    "urgency",
    "importance",
  ],
  notes: [
    "notes",
    "note",
    "comments",
    "description",
    "details",
  ],
};

export function autoDetectMapping(
  csvHeaders: string[]
): Record<string, SupportedLeadFieldKey | ""> {
  const mapping: Record<string, SupportedLeadFieldKey | ""> = {};
  const usedFields = new Set<SupportedLeadFieldKey>();

  for (const header of csvHeaders) {
    const normalizedHeader = header.trim().toLowerCase().replace(/[_\s-]+/g, " ");
    let matchedField: SupportedLeadFieldKey | "" = "";

    for (const [fieldKey, synonyms] of Object.entries(HEADER_SYNONYMS) as [
      SupportedLeadFieldKey,
      string[]
    ][]) {
      if (!usedFields.has(fieldKey)) {
        if (
          synonyms.includes(normalizedHeader) ||
          synonyms.some((syn) => normalizedHeader.includes(syn) || syn.includes(normalizedHeader))
        ) {
          matchedField = fieldKey;
          usedFields.add(fieldKey);
          break;
        }
      }
    }

    mapping[header] = matchedField;
  }

  return mapping;
}

