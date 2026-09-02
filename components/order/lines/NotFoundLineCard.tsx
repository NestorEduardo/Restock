import type { DraftLine } from "@/lib/order/types";

type NotFoundLineCardProps = {
  line: DraftLine;
  onRemove: () => void;
};

function XCircleIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm3.28-3.78a.75.75 0 0 1 1.06 0L8 6.94l3.66-3.72a.75.75 0 1 1 1.08 1.04L9.06 8l3.68 3.74a.75.75 0 1 1-1.08 1.04L8 9.06l-3.66 3.72a.75.75 0 1 1-1.08-1.04L6.94 8 3.28 5.26a.75.75 0 0 1 0-1.04Z" />
    </svg>
  );
}

export default function NotFoundLineCard({
  line,
  onRemove,
}: NotFoundLineCardProps) {
  if (line.outcome.type !== "NOT_FOUND") {
    return null;
  }

  return (
    <div className="rounded-xl border border-danger-border bg-danger-bg p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-danger text-brand-foreground">
          <XCircleIcon />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-danger">
                Not found in catalog
              </p>
              <p className="mt-1 text-sm font-medium text-danger-foreground">
                {line.outcome.description}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                From: &ldquo;{line.raw}&rdquo;
              </p>
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
        </div>
      </div>
    </div>
  );
}
