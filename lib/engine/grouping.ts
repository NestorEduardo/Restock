import { CLEAR_SCORE_RATIO_THRESHOLD } from "@/lib/engine/types";
import type { ExtractedAttributes, SearchClarity, SearchResult } from "@/lib/engine/types";

export function buildGroupSignature(
  attributes: Partial<ExtractedAttributes>,
): string {
  const parts: string[] = [];

  if (attributes.productType) {
    parts.push(`type:${attributes.productType}`);
  }
  if (attributes.connector) {
    parts.push(`connector:${attributes.connector}`);
  }
  if (attributes.length) {
    parts.push(`length:${attributes.length}`);
  }
  if (attributes.color) {
    parts.push(`color:${attributes.color}`);
  }
  if (attributes.phoneModel) {
    parts.push(`model:${attributes.phoneModel}`);
  }
  if (attributes.wattage) {
    parts.push(`wattage:${attributes.wattage}`);
  }
  if (attributes.capacity) {
    parts.push(`capacity:${attributes.capacity}`);
  }

  return parts.length > 0 ? parts.join("|") : "unknown";
}

type RawSearchResult = SearchResult & {
  attributes: Partial<ExtractedAttributes>;
};

export function groupSearchResults(results: RawSearchResult[]): SearchResult[] {
  const groups = new Map<
    string,
    SearchResult & { attributes: Partial<ExtractedAttributes> }
  >();

  for (const result of results) {
    const groupKey = buildGroupSignature(result.attributes);
    const existing = groups.get(groupKey);

    if (!existing || result.score > existing.score) {
      const previousSkus = existing
        ? [existing.sku, ...existing.alternateSkus]
        : [];
      const alternateSkus = [...previousSkus, ...result.alternateSkus].filter(
        (sku) => sku !== result.sku,
      );

      groups.set(groupKey, {
        ...result,
        groupKey,
        alternateSkus,
      });
      continue;
    }

    existing.alternateSkus.push(result.sku);
  }

  return [...groups.values()]
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.name.localeCompare(right.name);
    })
    .map(({ attributes, ...result }) => {
      void attributes;
      return result;
    });
}

export function assessSearchClarity(results: SearchResult[]): SearchClarity {
  if (results.length === 0) {
    return { signal: "none", scoreRatio: 0 };
  }

  if (results.length === 1) {
    return { signal: "clear", scoreRatio: null };
  }

  const topScore = results[0].score;
  const nextGroupScore = results[1].score;
  const scoreRatio = topScore / nextGroupScore;

  return {
    signal: scoreRatio >= CLEAR_SCORE_RATIO_THRESHOLD ? "clear" : "ambiguous",
    scoreRatio: Number(scoreRatio.toFixed(3)),
  };
}
