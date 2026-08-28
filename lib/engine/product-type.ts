import { prepareSearchText } from "@/lib/engine/prepare";

export type ProductTypeRule = {
  pattern: RegExp;
  type: string;
};

/** Longest / most specific patterns first. */
export const PRODUCT_TYPE_RULES: ProductTypeRule[] = [
  { pattern: /\bcamera lens protector\b/, type: "camera lens protector" },
  { pattern: /\bscreen protector\b/, type: "screen protector" },
  { pattern: /\bselfie stick\b/, type: "selfie stick" },
  { pattern: /\bwireless charger\b/, type: "wireless charger" },
  { pattern: /\bwall charger\b/, type: "wall charger" },
  { pattern: /\bcar charger\b/, type: "car charger" },
  { pattern: /\bphone grip\b/, type: "phone grip" },
  { pattern: /\bpower bank\b/, type: "power bank" },
  { pattern: /\bmicro sd\b/, type: "memory card" },
  { pattern: /\bmemory card\b/, type: "memory card" },
  { pattern: /\bring light\b/, type: "ring light" },
  { pattern: /\bbluetooth earbuds\b/, type: "earbuds" },
  { pattern: /\bearbuds\b/, type: "earbuds" },
  { pattern: /\bheadphones\b/, type: "headphones" },
  { pattern: /\bcharger\b/, type: "charger" },
  { pattern: /\bcable\b/, type: "cable" },
  { pattern: /\bcase\b/, type: "case" },
  { pattern: /\bspeaker\b/, type: "speaker" },
  { pattern: /\bmount\b/, type: "mount" },
  { pattern: /\badapter\b/, type: "adapter" },
  { pattern: /\bbattery\b/, type: "battery" },
  { pattern: /\btripod\b/, type: "tripod" },
];

const CHARGER_FAMILY = new Set([
  "charger",
  "wall charger",
  "car charger",
  "wireless charger",
]);

export function extractProductType(text: string): string | undefined {
  const normalized = prepareSearchText(text);

  if (/\b\d+\s+cases?\s+of\b/.test(normalized)) {
    const withoutCaseUnit = normalized.replace(/\b\d+\s+cases?\s+of\b/g, " ");
    return extractProductTypeFromText(withoutCaseUnit);
  }

  return extractProductTypeFromText(normalized);
}

function extractProductTypeFromText(normalized: string): string | undefined {
  for (const rule of PRODUCT_TYPE_RULES) {
    if (rule.pattern.test(normalized)) {
      return rule.type;
    }
  }

  return undefined;
}

export function productTypesCompatible(
  queryType: string | undefined,
  itemType: string | undefined,
): boolean {
  if (!queryType) {
    return true;
  }

  if (!itemType) {
    return false;
  }

  if (queryType === itemType) {
    return true;
  }

  if (queryType === "charger" && CHARGER_FAMILY.has(itemType)) {
    return true;
  }

  return false;
}
