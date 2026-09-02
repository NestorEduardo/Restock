import { formatCurrency, lineTotal } from "@/lib/order/draft-helpers";
import type { DraftLine } from "@/lib/order/types";

import AvailabilityBadge from "@/components/order/ui/AvailabilityBadge";
import BuyerUnitNote from "@/components/order/ui/BuyerUnitNote";

type ResolvedLineCardProps = {
  line: DraftLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

function CheckIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
    </svg>
  );
}

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
    <div className="rounded-xl border border-success-border bg-success-bg p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-success text-brand-foreground">
          <CheckIcon />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{outcome.name}</p>
              <p className="text-xs text-muted-foreground">{outcome.sku}</p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Remove line"
            >
              Remove
            </button>
          </div>

          <p className="mt-2 rounded-md bg-surface/60 px-2.5 py-1.5 text-xs leading-relaxed text-success-foreground">
            {outcome.reason}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Qty</span>
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
                className="w-16 rounded-md border border-border bg-surface px-2 py-1 text-sm text-foreground"
              />
            </label>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(outcome.price)} / {outcome.unit}
            </span>
            <span className="font-semibold text-foreground">
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
      </div>
    </div>
  );
}
