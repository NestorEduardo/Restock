import { canConfirm, orderTotal } from "@/lib/order/draft-helpers";
import type { DraftLine } from "@/lib/order/types";

export type SerializedDraftLine = {
  lineId: string;
  raw: string;
  quantity: number;
  outcome: DraftLine["outcome"];
};

export type DraftSnapshot = {
  lines: SerializedDraftLine[];
  total: number;
  canSubmit: boolean;
  confirmed: boolean;
};

export function serializeDraftLine(line: DraftLine): SerializedDraftLine {
  return {
    lineId: line.id,
    raw: line.raw,
    quantity: line.quantity,
    outcome: line.outcome,
  };
}

export function serializeDraftSnapshot(
  lines: DraftLine[],
  confirmed = false,
): DraftSnapshot {
  return {
    lines: lines.map(serializeDraftLine),
    total: orderTotal(lines),
    canSubmit: canConfirm(lines),
    confirmed,
  };
}
