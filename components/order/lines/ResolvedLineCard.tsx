import { formatCurrency, lineTotal } from "@/lib/order/draft-helpers";
import type { DraftLine } from "@/lib/order/types";

import AvailabilityBadge from "@/components/order/ui/AvailabilityBadge";
import BuyerUnitNote from "@/components/order/ui/BuyerUnitNote";

type ResolvedLineCardProps = {
  line: DraftLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export default function ResolvedLineCard({
  line,
  onQuantityChange,
  onRemove,
}: ResolvedLineCardProps) {
  if (line.outcome.type !== "RESOLVED") {
    return null;
  }

  const outcome = line.outcome;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900">{outcome.name}</p>
          <p className="text-sm text-gray-500">{outcome.sku}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-sm text-gray-400 hover:text-gray-600"
          aria-label="Remove line"
        >
          Remove
        </button>
      </div>

      <p className="mt-2 text-sm text-gray-600">{outcome.reason}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-gray-500">Qty</span>
          <input
            type="number"
            min={1}
            value={outcome.quantity}
            onChange={(event) => {
              const value = Number.parseInt(event.target.value, 10);
              if (!Number.isNaN(value) && value >= 1) {
                onQuantityChange(value);
              }
            }}
            className="w-16 rounded border border-gray-300 px-2 py-1 text-gray-900"
          />
        </label>
        <span className="text-gray-500">
          {formatCurrency(outcome.price)} / {outcome.unit}
        </span>
        <span className="font-medium text-gray-900">
          {formatCurrency(lineTotal(outcome))}
        </span>
        <AvailabilityBadge availability={outcome.availability} />
      </div>

      {!outcome.unitRecognised && outcome.buyerUnit && (
        <div className="mt-2">
          <BuyerUnitNote buyerUnit={outcome.buyerUnit} />
        </div>
      )}
    </div>
  );
}
