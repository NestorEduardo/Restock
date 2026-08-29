import type { LineOutcome } from "@/lib/engine/types";
import type { DraftLine, ResolveLineResponse } from "@/lib/order/types";

export function createDraftLines(apiLines: ResolveLineResponse[]): DraftLine[] {
  return apiLines.map((line) => ({
    id: crypto.randomUUID(),
    raw: line.raw,
    quantity: line.quantity,
    buyerUnit: line.buyerUnit,
    outcome: line.outcome,
  }));
}

export function lineTotal(outcome: LineOutcome): number {
  if (outcome.type !== "RESOLVED") {
    return 0;
  }

  return outcome.price * outcome.quantity;
}

export function orderTotal(lines: DraftLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line.outcome), 0);
}

export function pendingClarificationCount(lines: DraftLine[]): number {
  return lines.filter((line) => line.outcome.type === "NEEDS_CLARIFICATION")
    .length;
}

export function canConfirm(lines: DraftLine[]): boolean {
  return pendingClarificationCount(lines) === 0;
}

export function updateLineQuantity(
  lines: DraftLine[],
  id: string,
  quantity: number,
): DraftLine[] {
  return lines.map((line) => {
    if (line.id !== id || line.outcome.type !== "RESOLVED") {
      return line;
    }

    return {
      ...line,
      quantity,
      outcome: {
        ...line.outcome,
        quantity,
      },
    };
  });
}

export function removeLine(lines: DraftLine[], id: string): DraftLine[] {
  return lines.filter((line) => line.id !== id);
}

export function applyResolvedOutcome(
  lines: DraftLine[],
  id: string,
  outcome: LineOutcome,
): DraftLine[] {
  return lines.map((line) => {
    if (line.id !== id) {
      return line;
    }

    return {
      ...line,
      quantity: outcome.type === "RESOLVED" ? outcome.quantity : line.quantity,
      outcome,
    };
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
