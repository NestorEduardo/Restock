import { extractProductType } from "@/lib/engine/product-type";
import { prepareSearchText } from "@/lib/engine/prepare";
import type { ExtractedAttributes } from "@/lib/engine/types";

const CONNECTOR_PATTERNS: Array<{ pattern: RegExp; value: string }> = [
  { pattern: /\busb-c\b/, value: "usb-c" },
  { pattern: /\blightning\b/, value: "lightning" },
  { pattern: /\bmicro-usb\b/, value: "micro-usb" },
];

const COLOR_PATTERN =
  /\b(black|white|red|blue|clear|green|pink|purple|gold|silver|gray|grey)\b/;

const PHONE_MODEL_PATTERNS: RegExp[] = [
  /\biphone\s+\d+(?:\s+pro(?:\s+max)?|\s+plus|\s+mini)?\b/,
  /\bgalaxy\s+s\d+(?:\s+ultra|\s+plus|\s+fe)?\b/,
  /\bgalaxy\s+a\d+\b/,
  /\bfor the (\d{2}(?:\s+pro(?:\s+max)?)?)\b/,
  /\bthe (\d{2}(?:\s+pro(?:\s+max)?)?)\b/,
  /\b(?:\d{2})\s+pro(?:\s+max)?\b/,
  /\b(?:\d{2})\s+plus\b/,
  /\b(?:\d{2})\b(?=\s*(?:pro|plus|max|mini|case|screen|protector|clear|tempered))/,
];

const WATTAGE_PATTERN = /\b(\d+)w\b/;
const CAPACITY_GB_PATTERN = /\b(\d+)\s*gb\b/;
const CAPACITY_MAH_PATTERN = /\b(\d+)\s*mah\b/;
const LENGTH_PATTERN = /\b(\d+ft)\b/;

function firstMatch(text: string, pattern: RegExp): string | undefined {
  const match = text.match(pattern);
  if (!match) {
    return undefined;
  }

  return match[1] ?? match[0];
}

export function extractAttributes(text: string): Partial<ExtractedAttributes> {
  const normalized = prepareSearchText(text);
  const attributes: Partial<ExtractedAttributes> = {};

  const productType = extractProductType(normalized);
  if (productType) {
    attributes.productType = productType;
  }

  for (const { pattern, value } of CONNECTOR_PATTERNS) {
    if (pattern.test(normalized)) {
      attributes.connector = value;
      break;
    }
  }

  const length = firstMatch(normalized, LENGTH_PATTERN);
  if (length) {
    attributes.length = length;
  }

  const color = firstMatch(normalized, COLOR_PATTERN);
  if (color) {
    attributes.color = color;
  }

  for (const pattern of PHONE_MODEL_PATTERNS) {
    const model = firstMatch(normalized, pattern);
    if (model) {
      attributes.phoneModel = model;
      break;
    }
  }

  const wattage = firstMatch(normalized, WATTAGE_PATTERN);
  if (wattage) {
    attributes.wattage = wattage;
  }

  const capacityGb = firstMatch(normalized, CAPACITY_GB_PATTERN);
  const capacityMah = firstMatch(normalized, CAPACITY_MAH_PATTERN);
  if (capacityGb) {
    attributes.capacity = capacityGb.replace(/\s+/g, "");
  } else if (capacityMah) {
    attributes.capacity = capacityMah.replace(/\s+/g, "");
  }

  return attributes;
}

export function attributesMatch(
  query: Partial<ExtractedAttributes>,
  item: Partial<ExtractedAttributes>,
): Partial<ExtractedAttributes> {
  const matched: Partial<ExtractedAttributes> = {};

  for (const key of Object.keys(query) as Array<keyof ExtractedAttributes>) {
    const queryValue = query[key];
    const itemValue = item[key];
    if (!queryValue || !itemValue) {
      continue;
    }

    if (key === "productType") {
      if (queryValue === itemValue) {
        matched.productType = queryValue;
      }
      continue;
    }

    if (queryValue === itemValue) {
      matched[key] = queryValue;
    }
  }

  return matched;
}

export function attributesConflict(
  query: Partial<ExtractedAttributes>,
  item: Partial<ExtractedAttributes>,
): boolean {
  if (query.phoneModel && item.phoneModel) {
    const queryModel = query.phoneModel.replace(/\s+/g, " ");
    const itemModel = item.phoneModel.replace(/\s+/g, " ");

    if (/^\d{2}$/.test(queryModel) && /\bgalaxy\b/.test(itemModel)) {
      return true;
    }

    if (phoneModelsCompatible(queryModel, itemModel)) {
      // compatible models — fall through to other attribute checks
    } else {
      return true;
    }
  }

  for (const key of Object.keys(query) as Array<keyof ExtractedAttributes>) {
    if (key === "phoneModel" || key === "productType") {
      continue;
    }
    const queryValue = query[key];
    const itemValue = item[key];
    if (queryValue && itemValue && queryValue !== itemValue) {
      return true;
    }
  }

  return false;
}

function phoneModelsCompatible(queryModel: string, itemModel: string): boolean {
  if (queryModel === itemModel) {
    return true;
  }

  const queryHasMax = /\bmax\b/.test(queryModel);
  const itemHasMax = /\bmax\b/.test(itemModel);
  if (queryHasMax !== itemHasMax) {
    return false;
  }

  if (itemModel.includes(queryModel) || queryModel.includes(itemModel)) {
    return true;
  }

  return partialPhoneModelMatch(queryModel, itemModel);
}

function partialPhoneModelMatch(queryModel: string, itemModel: string): boolean {
  const queryDigits = queryModel.match(/\d{2}/)?.[0];
  const itemDigits = itemModel.match(/\d{2}/)?.[0];
  if (!queryDigits || !itemDigits || queryDigits !== itemDigits) {
    return false;
  }

  const queryHasPro = /\bpro\b/.test(queryModel);
  const itemHasPro = /\bpro\b/.test(itemModel);
  if (queryHasPro && !itemHasPro) {
    return false;
  }

  const queryHasMax = /\bmax\b/.test(queryModel);
  const itemHasMax = /\bmax\b/.test(itemModel);
  if (queryHasMax !== itemHasMax) {
    return false;
  }

  return true;
}

export function partialPhoneModelBonus(
  query: Partial<ExtractedAttributes>,
  item: Partial<ExtractedAttributes>,
): boolean {
  if (!query.phoneModel || !item.phoneModel) {
    return false;
  }

  const queryModel = query.phoneModel.replace(/\s+/g, " ");
  const itemModel = item.phoneModel.replace(/\s+/g, " ");

  if (queryModel === itemModel) {
    return false;
  }

  return phoneModelsCompatible(queryModel, itemModel);
}
