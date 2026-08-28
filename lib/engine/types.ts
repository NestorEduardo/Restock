export const CLEAR_SCORE_RATIO_THRESHOLD = 1.15;

export type ExtractedAttributes = {
  productType?: string;
  connector?: string;
  length?: string;
  color?: string;
  phoneModel?: string;
  wattage?: string;
  capacity?: string;
};

export type SearchResult = {
  sku: string;
  name: string;
  score: number;
  groupKey: string;
  alternateSkus: string[];
  matchedTokens: string[];
  matchedAttributes: Partial<ExtractedAttributes>;
};

export type SearchClarity = {
  signal: "clear" | "ambiguous" | "none";
  scoreRatio: number;
};

export type SearchOptions = {
  topN?: number;
};
