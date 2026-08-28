import type { CatalogSource } from "@/lib/catalog/types";
import type { DraftOrder } from "@/lib/types";

export { normalizeText } from "@/lib/engine/normalize";
export { stemWord, stemText } from "@/lib/engine/stem";
export { applySynonyms, SYNONYM_RULES } from "@/lib/engine/synonyms";
export { prepareSearchText } from "@/lib/engine/prepare";
export {
  PRODUCT_TYPE_RULES,
  extractProductType,
  productTypesCompatible,
} from "@/lib/engine/product-type";
export {
  attributesMatch,
  extractAttributes,
} from "@/lib/engine/attributes";
export { buildIdfMap, tokenize } from "@/lib/engine/tokens";
export { scoreCandidate } from "@/lib/engine/score";
export {
  buildGroupSignature,
  groupSearchResults,
  assessSearchClarity,
} from "@/lib/engine/grouping";
export { searchCatalog, analyzeSearchResults } from "@/lib/engine/search";
export {
  CLEAR_SCORE_RATIO_THRESHOLD,
} from "@/lib/engine/types";
export type {
  ExtractedAttributes,
  SearchClarity,
  SearchOptions,
  SearchResult,
} from "@/lib/engine/types";

export function resolveOrder(
  tenantId: string,
  rawText: string,
  catalog: CatalogSource,
): DraftOrder {
  void tenantId;
  void rawText;
  void catalog;
  throw new Error("Not implemented");
}
