import { prepareSearchText } from "@/lib/engine/prepare";
import type { CatalogItem } from "@/lib/types";

export const GENERIC_TOKENS = new Set([
  "a",
  "an",
  "and",
  "for",
  "give",
  "hey",
  "i",
  "in",
  "me",
  "need",
  "of",
  "or",
  "put",
  "send",
  "the",
  "to",
  "today",
  "with",
  "x",
  "wall",
  "car",
  "port",
  "dual",
  "single",
  "generic",
  "premium",
  "standard",
  "heavy",
  "duty",
  "accessory",
  "accessories",
  "product",
  "item",
  "ones",
  "one",
  "fast",
  "long",
  "bit",
  "everything",
  "dozen",
  "pallets",
  "pallet",
  "blister",
  "good",
  "morning",
  "how",
  "much",
  "is",
  "got",
  "last",
  "time",
  "those",
  "that",
  "these",
  "some",
  "down",
  "us",
  "wired",
  "bluetooth",
  "medium",
]);

export function tokenize(text: string): string[] {
  const normalized = prepareSearchText(text);
  const rawTokens = normalized.match(/[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? [];

  return rawTokens.filter(
    (token) => !GENERIC_TOKENS.has(token) && !/^\d+$/.test(token),
  );
}

export function buildIdfMap(items: CatalogItem[]): Map<string, number> {
  const documentFrequency = new Map<string, number>();
  const totalDocuments = items.length;

  for (const item of items) {
    const tokens = new Set(tokenize(item.name));
    for (const token of tokens) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
    }
  }

  const idfMap = new Map<string, number>();
  for (const [token, df] of documentFrequency) {
    idfMap.set(token, Math.log(totalDocuments / df));
  }

  return idfMap;
}

export function getTokenWeight(token: string, idfMap: Map<string, number>): number {
  const idf = idfMap.get(token);
  if (idf !== undefined) {
    return Math.max(idf, 0.1);
  }

  return 2.5;
}
