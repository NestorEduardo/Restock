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
  const confirmEnabled = canConfirm(lines);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4">
      <div className="flex flex-col gap-1 text-sm">
        <span className="text-gray-500">
          Order total:{" "}
          <span className="font-semibold text-gray-900">
            {formatCurrency(orderTotal(lines))}
          </span>
        </span>
        {pending > 0 && (
          <span className="text-amber-700">
            {pending} line{pending === 1 ? "" : "s"} need
            {pending === 1 ? "s" : ""} clarification
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onConfirm}
        disabled={!confirmEnabled}
        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        Confirm order
      </button>
    </div>
  );
}
