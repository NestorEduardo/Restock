import type { LineOutcome } from "@/lib/engine/types";

export type ResolveLineResponse = {
  raw: string;
  quantity: number;
  buyerUnit: string | null;
  outcome: LineOutcome;
};

export type ResolveResponse = {
  lines: ResolveLineResponse[];
};

export type ResolveOptionRequest = {
  sku: string;
  quantity: number;
  buyerUnit: string | null;
};

export type DraftLine = {
  id: string;
  raw: string;
  quantity: number;
  buyerUnit: string | null;
  outcome: LineOutcome;
};

export type DraftOrderState = {
  message: string;
  lines: DraftLine[];
  confirmed: boolean;
};
