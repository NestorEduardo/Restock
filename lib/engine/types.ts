export const CLEAR_SCORE_RATIO_THRESHOLD = 1.15;

export const PRODUCT_CHANGING_ATTRIBUTES = [
  "productType",
  "phoneModel",
  "connector",
  "length",
  "size",
  "wattage",
  "capacity",
] as const;

export type ProductChangingAttribute =
  (typeof PRODUCT_CHANGING_ATTRIBUTES)[number];

export type ExtractedAttributes = {
  productType?: string;
  connector?: string;
  length?: string;
  size?: string;
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
  groupAttributes: Partial<ExtractedAttributes>;
};

export type SearchClarity = {
  signal: "clear" | "ambiguous" | "none";
  /** Top-vs-second score ratio; null when only one group matched (no competitor to compare). */
  scoreRatio: number | null;
};

export type SearchOptions = {
  topN?: number;
};

export type AvailabilityFlag = "ok" | "insufficient" | "out_of_stock";

export type ClarificationOption = {
  sku: string;
  name: string;
  label: string;
};

export type LineOutcome =
  | {
      type: "RESOLVED";
      sku: string;
      name: string;
      unit: string;
      price: number;
      quantity: number;
      reason: string;
      availability: AvailabilityFlag;
      unitRecognised: boolean;
      buyerUnit: string | null;
    }
  | {
      type: "NEEDS_CLARIFICATION";
      question: string;
      options: ClarificationOption[];
      distinguishingAttribute: string;
    }
  | {
      type: "NOT_FOUND";
      description: string;
    };
