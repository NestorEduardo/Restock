import { assessSearchClarity, groupSearchResults } from "@/lib/engine/grouping";
import { queryHasUnmatchedProductTokens } from "@/lib/engine/query-match";
import { scoreCandidate } from "@/lib/engine/score";
import { buildIdfMap } from "@/lib/engine/tokens";
import type { SearchClarity, SearchOptions, SearchResult } from "@/lib/engine/types";
import type { CatalogItem } from "@/lib/types";

export function searchCatalog(
  query: string,
  items: CatalogItem[],
  options?: SearchOptions,
): SearchResult[] {
  if (queryHasUnmatchedProductTokens(query, items)) {
    return [];
  }

  const topN = options?.topN ?? 10;
  const idfMap = buildIdfMap(items);

  const rawResults: Array<
    Omit<SearchResult, "groupAttributes"> & {
      attributes: Partial<SearchResult["groupAttributes"]>;
    }
  > = [];

  for (const item of items) {
    const breakdown = scoreCandidate(query, item.name, idfMap);
    if (breakdown.rejected || breakdown.score <= 0) {
      continue;
    }

    rawResults.push({
      sku: item.id,
      name: item.name,
      score: Number(breakdown.score.toFixed(2)),
      groupKey: "",
      alternateSkus: [],
      matchedTokens: breakdown.matchedTokens,
      matchedAttributes: breakdown.matchedAttributes,
      attributes: breakdown.attributes,
    });
  }

  rawResults.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return left.name.localeCompare(right.name);
  });

  return groupSearchResults(rawResults).slice(0, topN);
}

export function analyzeSearchResults(results: SearchResult[]): SearchClarity {
  return assessSearchClarity(results);
}
