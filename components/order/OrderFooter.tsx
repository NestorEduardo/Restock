import {
  canConfirm,
  formatCurrency,
  orderTotal,
  pendingClarificationCount,
} from "@/lib/order/draft-helpers";
import type { DraftLine } from "@/lib/order/types";

type OrderFooterProps = {
  lines: DraftLine[];
  hasSubmitted: boolean;
  onConfirm: () => void;
};

export default function OrderFooter({
  lines,
  hasSubmitted,
  onConfirm,
}: OrderFooterProps) {
  if (!hasSubmitted || lines.length === 0) {
    return null;
  }

  const pending = pendingClarificationCount(lines);
  const resolved = lines.filter((l) => l.outcome.type === "RESOLVED").length;
  const confirmEnabled = canConfirm(lines);

  return (
    <div className="sticky bottom-0 -mx-4 mt-4 border-t border-border bg-surface/95 px-4 py-4 shadow-elevated backdrop-blur-sm sm:-mx-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(orderTotal(lines))}
          </span>
          <span className="text-xs text-muted-foreground">
            {resolved} line{resolved === 1 ? "" : "s"} matched
            {pending > 0 && (
              <>
                {" · "}
                <span className="text-warning">
                  {pending} awaiting answer{pending === 1 ? "" : "s"}
                </span>
              </>
            )}
          </span>
        </div>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!confirmEnabled}
          className="w-full rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-muted disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          Confirm order
        </button>
      </div>
    </div>
  );
}
