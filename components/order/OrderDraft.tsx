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

function StatusSummary({ lines }: { lines: DraftLine[] }) {
  const resolved = lines.filter((l) => l.outcome.type === "RESOLVED").length;
  const clarification = lines.filter(
    (l) => l.outcome.type === "NEEDS_CLARIFICATION",
  ).length;
  const notFound = lines.filter((l) => l.outcome.type === "NOT_FOUND").length;

  return (
    <div className="flex flex-wrap gap-2">
      {resolved > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-1 text-xs font-medium text-success">
          <CheckIcon />
          {resolved} matched
        </span>
      )}
      {clarification > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2.5 py-1 text-xs font-medium text-warning">
          <QuestionIcon />
          {clarification} need{clarification === 1 ? "s" : ""} answer
          {clarification === 1 ? "" : "s"}
        </span>
      )}
      {notFound > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-bg px-2.5 py-1 text-xs font-medium text-danger">
          <XIcon />
          {notFound} not found
        </span>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-3.5a2.25 2.25 0 0 0-2.15 2.86.75.75 0 1 1-1.45-.36A3.75 3.75 0 0 1 8 3.5a3.75 3.75 0 0 1 2.6 6.47.75.75 0 0 1-.35 1.01V11a.75.75 0 0 1-1.5 0v-.5a2.25 2.25 0 0 1 1.15-3.98A.75.75 0 0 0 8 4.5Z" />
      <circle cx="8" cy="12.5" r="0.75" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M4.28 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.66-2.72a.75.75 0 1 1 1.08 1.04L9.06 8l2.68 2.74a.75.75 0 1 1-1.08 1.04L8 9.06l-2.66 2.72a.75.75 0 1 1-1.08-1.04L6.94 8 4.28 5.26a.75.75 0 0 1 0-1.04Z" />
    </svg>
  );
}

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
      <section className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-surface-raised p-8">
        <p className="text-center text-sm text-muted-foreground">
          Submit your order to see matched products here.
        </p>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className="flex min-h-48 items-center justify-center rounded-xl border border-border bg-surface p-8 shadow-card">
        <p className="text-center text-sm text-muted-foreground">
          No order lines found in your message.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-foreground">Order draft</h2>
        <StatusSummary lines={lines} />
      </div>
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
    </section>
  );
}
