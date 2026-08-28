import {
  attributesConflict,
  attributesMatch,
  extractAttributes,
  partialPhoneModelBonus,
} from "@/lib/engine/attributes";
import { productTypesCompatible } from "@/lib/engine/product-type";
import { prepareSearchText } from "@/lib/engine/prepare";
import { getTokenWeight, tokenize } from "@/lib/engine/tokens";
import type { ExtractedAttributes } from "@/lib/engine/types";

const ATTRIBUTE_BONUS = 4;
const PRODUCT_TYPE_MATCH_BONUS = 14;
const EXACT_PHONE_MODEL_BONUS = 3;
const PARTIAL_MODEL_BONUS = 2;
const CONFLICT_PENALTY = 6;
const UNMATCHED_QUERY_TOKEN_PENALTY = 0.35;

export type ScoreBreakdown = {
  score: number;
  matchedTokens: string[];
  matchedAttributes: Partial<ExtractedAttributes>;
  attributes: Partial<ExtractedAttributes>;
  rejected: boolean;
};

export function scoreCandidate(
  query: string,
  itemName: string,
  idfMap: Map<string, number>,
): ScoreBreakdown {
  const queryText = prepareSearchText(query);
  const itemText = prepareSearchText(itemName);

  const queryTokens = tokenize(queryText);
  const itemTokens = new Set(tokenize(itemText));

  const queryAttributes = extractAttributes(queryText);
  const itemAttributes = extractAttributes(itemText);

  if (
    queryAttributes.productType &&
    !productTypesCompatible(queryAttributes.productType, itemAttributes.productType)
  ) {
    return {
      score: 0,
      matchedTokens: [],
      matchedAttributes: {},
      attributes: itemAttributes,
      rejected: true,
    };
  }

  let score = 0;
  const matchedTokens: string[] = [];

  if (
    queryAttributes.productType &&
    productTypesCompatible(queryAttributes.productType, itemAttributes.productType)
  ) {
    score += PRODUCT_TYPE_MATCH_BONUS;
  }

  for (const token of queryTokens) {
    const weight = getTokenWeight(token, idfMap);
    if (itemTokens.has(token)) {
      score += weight;
      matchedTokens.push(token);
    } else if (itemText.includes(token)) {
      score += weight * 0.75;
      matchedTokens.push(token);
    } else {
      score -= UNMATCHED_QUERY_TOKEN_PENALTY * Math.min(weight, 1.5);
    }
  }

  const matchedAttributes = attributesMatch(queryAttributes, itemAttributes);
  score += Object.keys(matchedAttributes).length * ATTRIBUTE_BONUS;

  if (
    queryAttributes.phoneModel &&
    itemAttributes.phoneModel &&
    queryAttributes.phoneModel.replace(/\s+/g, " ") ===
      itemAttributes.phoneModel.replace(/\s+/g, " ")
  ) {
    score += EXACT_PHONE_MODEL_BONUS;
  }

  if (partialPhoneModelBonus(queryAttributes, itemAttributes)) {
    score += PARTIAL_MODEL_BONUS;
  }

  if (attributesConflict(queryAttributes, itemAttributes)) {
    score -= CONFLICT_PENALTY;
  }

  return {
    score,
    matchedTokens,
    matchedAttributes,
    attributes: itemAttributes,
    rejected: false,
  };
}
