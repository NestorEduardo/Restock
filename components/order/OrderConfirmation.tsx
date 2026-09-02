import { formatCurrency, lineTotal, orderTotal } from "@/lib/order/draft-helpers";
import type { DraftLine } from "@/lib/order/types";

type OrderConfirmationProps = {
  lines: DraftLine[];
  onStartOver: () => void;
};

function CheckCircleIcon() {
  return (
    <svg className="size-10 text-success" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function OrderConfirmation({
  lines,
  onStartOver,
}: OrderConfirmationProps) {
  const resolvedLines = lines.filter((line) => line.outcome.type === "RESOLVED");

  return (
    <section className="mx-auto w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-elevated sm:p-8">
      <div className="flex flex-col items-center text-center">
        <CheckCircleIcon />
        <h2 className="mt-4 text-xl font-bold text-foreground">
          Order confirmed
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your order has been submitted. This is a preview — no order was
          persisted.
        </p>
      </div>

      <ul className="mt-8 divide-y divide-border">
        {resolvedLines.map((line) => {
          if (line.outcome.type !== "RESOLVED") {
            return null;
          }

          const outcome = line.outcome;

          return (
            <li
              key={line.id}
              className="flex justify-between gap-4 py-4 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{outcome.name}</p>
                <p className="text-xs text-muted-foreground">
                  {outcome.quantity} × {formatCurrency(outcome.price)} /{" "}
                  {outcome.unit}
                </p>
              </div>
              <span className="shrink-0 font-semibold text-foreground">
                {formatCurrency(lineTotal(outcome))}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-base font-bold text-foreground">Total</span>
        <span className="text-base font-bold text-foreground">
          {formatCurrency(orderTotal(lines))}
        </span>
      </div>

      <button
        type="button"
        onClick={onStartOver}
        className="mt-8 w-full rounded-lg border border-border bg-surface-raised px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Start over
      </button>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Ordering powered by{" "}
        <span className="font-medium text-foreground">Restock</span>
      </p>
    </section>
  );
}
