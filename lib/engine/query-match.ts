import { prepareSearchText } from "@/lib/engine/prepare";
import { tokenize } from "@/lib/engine/tokens";
import type { CatalogItem } from "@/lib/types";

export function queryHasUnmatchedProductTokens(
  query: string,
  items: CatalogItem[],
): boolean {
  const queryTokens = tokenize(prepareSearchText(query));
  if (queryTokens.length === 0) {
    return false;
  }

  const catalogTokens = new Set<string>();
  for (const item of items) {
    for (const token of tokenize(item.name)) {
      catalogTokens.add(token);
    }
  }

  return queryTokens.some(
    (token) =>
      !catalogTokens.has(token) &&
      !catalogTokens.has(`${token}s`) &&
      !catalogTokens.has(token.slice(0, -1)),
  );
}
