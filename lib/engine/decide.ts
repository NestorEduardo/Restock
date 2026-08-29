import { extractAttributes } from "@/lib/engine/attributes";
import {
  findDistinguishingAttribute,
  findUnspecifiedPhoneModelClarification,
  getCompetitiveGroups,
  hasProductChangingOverride,
} from "@/lib/engine/group-compare";
import { assessSearchClarity } from "@/lib/engine/grouping";
import type { ClarificationQuestioner } from "@/lib/engine/questioner";
import { searchCatalog } from "@/lib/engine/search";
import type { SplitLine } from "@/lib/engine/split";
import type {
  AvailabilityFlag,
  ClarificationOption,
  ExtractedAttributes,
  LineOutcome,
  ProductChangingAttribute,
  SearchResult,
} from "@/lib/engine/types";
import { recogniseBuyerUnit } from "@/lib/engine/units";
import { FakeQuestioner } from "@/lib/providers/fake-questioner";
import type { CatalogItem } from "@/lib/types";

const ATTRIBUTE_LABELS: Record<ProductChangingAttribute, string> = {
  productType: "product type",
  phoneModel: "model",
  variant: "type",
  connector: "connector",
  length: "length",
  size: "size",
  wattage: "wattage",
  capacity: "capacity",
};

const REASON_ATTRIBUTE_ORDER: Array<keyof ExtractedAttributes> = [
  "productType",
  "phoneModel",
  "variant",
  "connector",
  "length",
  "size",
  "wattage",
  "capacity",
  "color",
];

function formatAttributeLabel(
  key: keyof ExtractedAttributes,
  value: string,
): string {
  if (key === "connector") {
    if (value === "usb-c") {
      return "USB-C";
    }
    if (value === "micro-usb") {
      return "Micro-USB";
    }
    if (value === "lightning") {
      return "Lightning";
    }
  }

  if (key === "wattage") {
    return value.endsWith("w") ? value : `${value}W`;
  }

  return value;
}

function isVagueProductQuery(
  queryAttributes: Partial<ExtractedAttributes>,
  description: string,
): boolean {
  if (queryAttributes.productType) {
    return false;
  }

  const normalised = description.toLowerCase();
  const hasVagueReference = /\b(ones|those|these|stuff|things)\b/.test(
    normalised,
  );
  const hasSpecificAttributes = Boolean(
    queryAttributes.connector ||
      queryAttributes.length ||
      queryAttributes.phoneModel ||
      queryAttributes.wattage ||
      queryAttributes.capacity,
  );

  return hasVagueReference || !hasSpecificAttributes;
}

function buildMatchReason(
  groupAttributes: Partial<ExtractedAttributes>,
): string {
  const parts: string[] = [];

  for (const key of REASON_ATTRIBUTE_ORDER) {
    const value = groupAttributes[key];
    if (!value) {
      continue;
    }

    parts.push(formatAttributeLabel(key, value));
  }

  if (parts.length === 0) {
    return "matched catalog item";
  }

  return `matched ${parts.join(", ")}`;
}

function buildAvailability(stock: number, quantity: number): AvailabilityFlag {
  if (stock === 0) {
    return "out_of_stock";
  }

  if (stock < quantity) {
    return "insufficient";
  }

  return "ok";
}

function formatOptionLabel(
  attribute: ProductChangingAttribute,
  value: string,
): string {
  if (attribute === "productType") {
    return value;
  }

  return formatAttributeLabel(attribute, value);
}

function buildClarificationOptions(
  groups: SearchResult[],
  attribute: ProductChangingAttribute,
): ClarificationOption[] {
  return groups.map((group) => {
    const value = group.groupAttributes[attribute] ?? group.name;
    return {
      sku: group.sku,
      name: group.name,
      label: formatOptionLabel(attribute, value),
    };
  });
}

function buildClarificationOutcome(
  attribute: ProductChangingAttribute,
  values: string[],
  groups: SearchResult[],
  questioner: ClarificationQuestioner,
): LineOutcome {
  const options = buildClarificationOptions(groups, attribute);

  return {
    type: "NEEDS_CLARIFICATION",
    question: questioner.ask({
      attribute,
      values: values.map((value) => formatOptionLabel(attribute, value)),
    }),
    options,
    distinguishingAttribute: ATTRIBUTE_LABELS[attribute],
  };
}

function collectProductTypeGroups(
  results: SearchResult[],
): { values: string[]; groups: SearchResult[] } {
  const byType = new Map<string, SearchResult>();

  for (const group of results) {
    const productType = group.groupAttributes.productType;
    if (productType && !byType.has(productType)) {
      byType.set(productType, group);
    }
  }

  const values = [...byType.keys()].slice(0, 4);
  const groups = values
    .map((value) => byType.get(value))
    .filter((group): group is SearchResult => Boolean(group));

  return { values, groups };
}

function buildProductTypeClarification(
  results: SearchResult[],
  questioner: ClarificationQuestioner,
): LineOutcome {
  const { values, groups } = collectProductTypeGroups(results);

  if (values.length >= 2) {
    return buildClarificationOutcome("productType", values, groups, questioner);
  }

  return {
    type: "NEEDS_CLARIFICATION",
    question: "What type of product are you looking for?",
    options: groups.map((group) => ({
      sku: group.sku,
      name: group.name,
      label: group.groupAttributes.productType ?? group.name,
    })),
    distinguishingAttribute: ATTRIBUTE_LABELS.productType,
  };
}

function resolveLine(
  result: SearchResult,
  quantity: number,
  buyerUnit: string | null,
  itemById: Map<string, CatalogItem>,
): LineOutcome {
  const catalogItem = itemById.get(result.sku);

  if (!catalogItem) {
    return {
      type: "NOT_FOUND",
      description: result.name,
    };
  }

  const unitRecognition = recogniseBuyerUnit(buyerUnit);

  return {
    type: "RESOLVED",
    sku: result.sku,
    name: result.name,
    unit: catalogItem.unit,
    price: catalogItem.price,
    quantity,
    reason: buildMatchReason(result.groupAttributes),
    availability: buildAvailability(catalogItem.stock, quantity),
    unitRecognised: unitRecognition.recognised,
    buyerUnit,
  };
}

export function decideLine(
  line: SplitLine,
  items: CatalogItem[],
  questioner: ClarificationQuestioner = new FakeQuestioner(),
): LineOutcome {
  const results = searchCatalog(line.description, items, { topN: 15 });

  if (results.length === 0) {
    return {
      type: "NOT_FOUND",
      description: line.description,
    };
  }

  const queryAttributes = extractAttributes(line.description);
  const itemById = new Map(items.map((item) => [item.id, item]));
  const clarity = assessSearchClarity(results);
  const competitive = getCompetitiveGroups(results, queryAttributes);

  if (isVagueProductQuery(queryAttributes, line.description)) {
    return buildProductTypeClarification(competitive, questioner);
  }

  const needsClarification =
    clarity.signal === "ambiguous" ||
    hasProductChangingOverride(results, queryAttributes);

  if (needsClarification) {
    const unspecifiedModelClarification = findUnspecifiedPhoneModelClarification(
      results,
      queryAttributes,
      line.description,
    );
    if (unspecifiedModelClarification) {
      return buildClarificationOutcome(
        unspecifiedModelClarification.attribute,
        unspecifiedModelClarification.values,
        unspecifiedModelClarification.groups,
        questioner,
      );
    }

    const distinguishing = findDistinguishingAttribute(
      results,
      queryAttributes,
    );

    if (distinguishing) {
      return buildClarificationOutcome(
        distinguishing.attribute,
        distinguishing.values,
        distinguishing.groups,
        questioner,
      );
    }

    if (isVagueProductQuery(queryAttributes, line.description)) {
      return buildProductTypeClarification(competitive, questioner);
    }
  }

  const unspecifiedModelClarification = findUnspecifiedPhoneModelClarification(
    results,
    queryAttributes,
    line.description,
  );
  if (unspecifiedModelClarification) {
    return buildClarificationOutcome(
      unspecifiedModelClarification.attribute,
      unspecifiedModelClarification.values,
      unspecifiedModelClarification.groups,
      questioner,
    );
  }

  return resolveLine(results[0], line.quantity, line.unit, itemById);
}
