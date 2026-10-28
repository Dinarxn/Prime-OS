import { normalizePhone } from "@/lib/validations/lead.schema";
import type { LeadRow } from "@/types/database.types";

export interface DuplicateCheckItem {
  index: number;
  business_name: string;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
}

export interface DuplicateMatch {
  index: number;
  reason: "phone" | "email" | "business_name_city";
  matchedWith: string; // Existing lead business name or earlier row number
  isExistingLead: boolean;
}

export function detectDuplicates(
  incomingItems: DuplicateCheckItem[],
  existingLeads: LeadRow[] = []
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  // Maps for existing DB leads
  const existingByPhone = new Map<string, string>();
  const existingByEmail = new Map<string, string>();
  const existingByNameCity = new Map<string, string>();

  for (const lead of existingLeads) {
    if (lead.phone) {
      const normPhone = normalizePhone(lead.phone);
      if (normPhone) existingByPhone.set(normPhone, lead.business_name);
    }
    if (lead.email) {
      existingByEmail.set(lead.email.toLowerCase().trim(), lead.business_name);
    }
    if (lead.business_name) {
      const key = `${lead.business_name.toLowerCase().trim()}::${(lead.city || "").toLowerCase().trim()}`;
      existingByNameCity.set(key, lead.business_name);
    }
  }

  // Maps for intra-file tracking
  const fileSeenPhones = new Map<string, number>();
  const fileSeenEmails = new Map<string, number>();
  const fileSeenNameCities = new Map<string, number>();

  for (const item of incomingItems) {
    const normPhone = normalizePhone(item.phone);
    const normEmail = item.email ? item.email.toLowerCase().trim() : null;
    const nameCityKey = `${item.business_name.toLowerCase().trim()}::${(item.city || "").toLowerCase().trim()}`;

    // 1. Check against DB leads first
    if (normPhone && existingByPhone.has(normPhone)) {
      matches.push({
        index: item.index,
        reason: "phone",
        matchedWith: `Existing Lead: ${existingByPhone.get(normPhone)}`,
        isExistingLead: true,
      });
      continue;
    }

    if (normEmail && existingByEmail.has(normEmail)) {
      matches.push({
        index: item.index,
        reason: "email",
        matchedWith: `Existing Lead: ${existingByEmail.get(normEmail)}`,
        isExistingLead: true,
      });
      continue;
    }

    if (existingByNameCity.has(nameCityKey)) {
      matches.push({
        index: item.index,
        reason: "business_name_city",
        matchedWith: `Existing Lead: ${existingByNameCity.get(nameCityKey)}`,
        isExistingLead: true,
      });
      continue;
    }

    // 2. Check intra-file duplicate
    if (normPhone) {
      if (fileSeenPhones.has(normPhone)) {
        matches.push({
          index: item.index,
          reason: "phone",
          matchedWith: `Row #${fileSeenPhones.get(normPhone)! + 1}`,
          isExistingLead: false,
        });
        continue;
      }
      fileSeenPhones.set(normPhone, item.index);
    }

    if (normEmail) {
      if (fileSeenEmails.has(normEmail)) {
        matches.push({
          index: item.index,
          reason: "email",
          matchedWith: `Row #${fileSeenEmails.get(normEmail)! + 1}`,
          isExistingLead: false,
        });
        continue;
      }
      fileSeenEmails.set(normEmail, item.index);
    }

    if (fileSeenNameCities.has(nameCityKey)) {
      matches.push({
        index: item.index,
        reason: "business_name_city",
        matchedWith: `Row #${fileSeenNameCities.get(nameCityKey)! + 1}`,
        isExistingLead: false,
      });
      continue;
    }
    fileSeenNameCities.set(nameCityKey, item.index);
  }

  return matches;
}

