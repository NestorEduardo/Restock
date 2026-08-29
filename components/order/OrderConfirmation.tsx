import { formatCurrency, lineTotal, orderTotal } from "@/lib/order/draft-helpers";
import type { DraftLine } from "@/lib/order/types";

type OrderConfirmationProps = {
  lines: DraftLine[];
  onStartOver: () => void;
};

export default function OrderConfirmation({
  lines,
  onStartOver,
}: OrderConfirmationProps) {
  const resolvedLines = lines.filter((line) => line.outcome.type === "RESOLVED");

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Order confirmed</h2>
      <p className="mt-1 text-sm text-gray-500">
        Your order has been submitted. This is a preview — no order was persisted.
      </p>

      <ul className="mt-4 divide-y divide-gray-100">
        {resolvedLines.map((line) => {
          if (line.outcome.type !== "RESOLVED") {
            return null;
          }

          const outcome = line.outcome;

          return (
            <li key={line.id} className="flex justify-between gap-4 py-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">{outcome.name}</p>
                <p className="text-gray-500">
                  {outcome.quantity} × {formatCurrency(outcome.price)} /{" "}
                  {outcome.unit}
                </p>
              </div>
              <span className="font-medium text-gray-900">
                {formatCurrency(lineTotal(outcome))}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
        <span className="font-semibold text-gray-900">Total</span>
        <span className="font-semibold text-gray-900">
          {formatCurrency(orderTotal(lines))}
        </span>
      </div>

      <button
        type="button"
        onClick={onStartOver}
        className="mt-6 text-sm text-gray-600 hover:text-gray-900"
      >
        Start over
      </button>
    </div>
  );
}
