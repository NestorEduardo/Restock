import type { DraftLine } from "@/lib/order/types";

type ClarificationLineCardProps = {
  line: DraftLine;
  onPickOption: (sku: string) => void;
  isResolving?: boolean;
};

function QuestionIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-3.5a2.25 2.25 0 0 0-2.15 2.86.75.75 0 1 1-1.45-.36A3.75 3.75 0 0 1 8 3.5a3.75 3.75 0 0 1 2.6 6.47.75.75 0 0 1-.35 1.01V11a.75.75 0 0 1-1.5 0v-.5a2.25 2.25 0 0 1 1.15-3.98A.75.75 0 0 0 8 4.5Z" />
      <circle cx="8" cy="12.5" r="0.75" />
    </svg>
  );
}

export default function ClarificationLineCard({
  line,
  onPickOption,
  isResolving = false,
}: ClarificationLineCardProps) {
  if (line.outcome.type !== "NEEDS_CLARIFICATION") {
    return null;
  }

  const outcome = line.outcome;

  return (
    <div className="rounded-xl border-2 border-warning-border bg-warning-bg p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-warning text-brand-foreground">
          <QuestionIcon />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-warning">
            Needs your answer
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            From: &ldquo;{line.raw}&rdquo;
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {outcome.question}
          </p>

          <p className="mt-3 text-xs font-medium text-warning-foreground">
            Choose {outcome.distinguishingAttribute.toLowerCase()}:
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {outcome.options.map((option) => (
              <button
                key={option.sku}
                type="button"
                disabled={isResolving}
                onClick={() => onPickOption(option.sku)}
                className="flex flex-col rounded-lg border border-warning-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-warning hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="text-sm font-semibold text-foreground">
                  {option.label}
                </span>
                <span className="mt-0.5 text-xs text-muted-foreground">
                  {option.name}
                </span>
              </button>
            ))}
          </div>

          {isResolving && (
            <p className="mt-2 text-xs text-warning-foreground">
              Updating selection…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
