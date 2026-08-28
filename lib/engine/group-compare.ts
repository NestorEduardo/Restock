import { prepareSearchText } from "@/lib/engine/prepare";
import { productTypesCompatible } from "@/lib/engine/product-type";
import {
  PRODUCT_CHANGING_ATTRIBUTES,
  type ExtractedAttributes,
  type ProductChangingAttribute,
  type SearchResult,
} from "@/lib/engine/types";

export const COMPETITIVE_SCORE_RATIO = 0.7;

export type DistinguishingAttribute = {
  attribute: ProductChangingAttribute;
  values: string[];
  groups: SearchResult[];
};

function normalisePhoneModel(model: string): string {
  return model
    .replace(/^(iphone|galaxy)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function hasUnspecifiedPhoneModelInQuery(
  queryAttributes: Partial<ExtractedAttributes>,
  description: string,
): boolean {
  if (queryAttributes.phoneModel) {
    return false;
  }

  const normalized = prepareSearchText(description);

  if (/\bgalaxy\b/.test(normalized)) {
    return !/\bgalaxy\s+[as]\d+/i.test(normalized);
  }

  if (/\biphone\b/.test(normalized)) {
    return !/\biphone\s+\d+/i.test(normalized);
  }

  return false;
}

export function findUnspecifiedPhoneModelClarification(
  results: SearchResult[],
  queryAttributes: Partial<ExtractedAttributes>,
  description: string,
): DistinguishingAttribute | null {
  if (!hasUnspecifiedPhoneModelInQuery(queryAttributes, description)) {
    return null;
  }

  const normalized = prepareSearchText(description);
  const isGalaxyQuery = /\bgalaxy\b/.test(normalized);

  const familyGroups = results.filter((group) => {
    const model = group.groupAttributes.phoneModel;
    if (!model) {
      return false;
    }

    if (isGalaxyQuery) {
      return /\bgalaxy\b/i.test(model);
    }

    return /\biphone\b/i.test(model) || /^\d{2}\b/.test(model);
  });

  let values = distinctValuesForAttribute(familyGroups, "phoneModel");
  if (values.length < 2) {
    return null;
  }

  if (values.length > 4) {
    values = values.slice(0, 4);
  }

  const groups = values
    .map(
      (value) =>
        groupsForAttributeValue(familyGroups, "phoneModel", value)[0],
    )
    .filter((group): group is SearchResult => Boolean(group));

  if (groups.length < 2) {
    return null;
  }

  return { attribute: "phoneModel", values, groups };
}

export function attributesStrictlyEqual(
  left: string,
  right: string,
  key: ProductChangingAttribute,
): boolean {
  if (key === "phoneModel") {
    return normalisePhoneModel(left) === normalisePhoneModel(right);
  }

  return left.toLowerCase() === right.toLowerCase();
}

export function groupsDifferOnAttribute(
  left: Partial<ExtractedAttributes>,
  right: Partial<ExtractedAttributes>,
  key: ProductChangingAttribute,
): boolean {
  const leftValue = left[key];
  const rightValue = right[key];

  if (!leftValue || !rightValue) {
    return false;
  }

  return !attributesStrictlyEqual(leftValue, rightValue, key);
}

export function groupsHaveProductChangingConflict(
  top: SearchResult,
  other: SearchResult,
): boolean {
  for (const attribute of PRODUCT_CHANGING_ATTRIBUTES) {
    if (
      groupsDifferOnAttribute(top.groupAttributes, other.groupAttributes, attribute)
    ) {
      return true;
    }
  }

  return false;
}

function isCompatibleGroup(
  queryAttributes: Partial<ExtractedAttributes>,
  group: SearchResult,
): boolean {
  return productTypesCompatible(
    queryAttributes.productType,
    group.groupAttributes.productType,
  );
}

export function getCompetitiveGroups(
  results: SearchResult[],
  queryAttributes: Partial<ExtractedAttributes>,
): SearchResult[] {
  if (results.length === 0) {
    return [];
  }

  const topScore = results[0].score;
  const minScore = topScore * COMPETITIVE_SCORE_RATIO;

  return results.filter(
    (group) =>
      group.score >= minScore && isCompatibleGroup(queryAttributes, group),
  );
}

function distinctValuesForAttribute(
  groups: SearchResult[],
  attribute: ProductChangingAttribute,
): string[] {
  const values = new Map<string, string>();

  for (const group of groups) {
    const value = group.groupAttributes[attribute];
    if (!value) {
      continue;
    }

    const key =
      attribute === "phoneModel" ? normalisePhoneModel(value) : value.toLowerCase();

    if (!values.has(key)) {
      values.set(key, value);
    }
  }

  return [...values.values()];
}

function groupsForAttributeValue(
  groups: SearchResult[],
  attribute: ProductChangingAttribute,
  value: string,
): SearchResult[] {
  return groups.filter((group) => {
    const groupValue = group.groupAttributes[attribute];
    if (!groupValue) {
      return false;
    }

    if (attribute === "phoneModel") {
      return normalisePhoneModel(groupValue) === normalisePhoneModel(value);
    }

    return attributesStrictlyEqual(groupValue, value, attribute);
  });
}

export function findDistinguishingAttribute(
  results: SearchResult[],
  queryAttributes: Partial<ExtractedAttributes>,
): DistinguishingAttribute | null {
  const competitive = getCompetitiveGroups(results, queryAttributes);

  if (competitive.length < 2) {
    return null;
  }

  for (const attribute of PRODUCT_CHANGING_ATTRIBUTES) {
    const values = distinctValuesForAttribute(competitive, attribute);

    if (values.length < 2 || values.length > 4) {
      continue;
    }

    const groups = values.flatMap((value) =>
      groupsForAttributeValue(competitive, attribute, value).slice(0, 1),
    );

    if (groups.length >= 2) {
      return { attribute, values, groups: groups.slice(0, 4) };
    }
  }

  return null;
}

export function hasProductChangingOverride(
  results: SearchResult[],
  queryAttributes: Partial<ExtractedAttributes>,
): boolean {
  if (results.length < 2) {
    return false;
  }

  const competitive = getCompetitiveGroups(results, queryAttributes);
  const top = competitive[0];

  if (!top) {
    return false;
  }

  return competitive.slice(1).some((group) => groupsHaveProductChangingConflict(top, group));
}
