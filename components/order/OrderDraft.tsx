import type { DraftLine } from "@/lib/order/types";

import DraftLineCard from "@/components/order/lines/DraftLineCard";

type OrderDraftProps = {
  lines: DraftLine[];
  hasSubmitted: boolean;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onPickOption: (id: string, sku: string) => void;
  resolvingLineId?: string | null;
};

export default function OrderDraft({
  lines,
  hasSubmitted,
  onQuantityChange,
  onRemove,
  onPickOption,
  resolvingLineId,
}: OrderDraftProps) {
  if (!hasSubmitted) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8">
        <p className="text-center text-sm text-gray-500">
          Submit your message to see the order draft here.
        </p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8">
        <p className="text-center text-sm text-gray-500">
          No order lines found in your message.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-gray-700">Order draft</h2>
      <div className="flex flex-col gap-3">
        {lines.map((line) => (
          <DraftLineCard
            key={line.id}
            line={line}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
            onPickOption={onPickOption}
            resolvingLineId={resolvingLineId}
          />
        ))}
      </div>
    </div>
  );
}
