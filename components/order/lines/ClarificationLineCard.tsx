import type { DraftLine } from "@/lib/order/types";

type ClarificationLineCardProps = {
  line: DraftLine;
  onPickOption: (sku: string) => void;
  isResolving?: boolean;
};

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
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
        Needs clarification
      </p>
      <p className="mt-1 text-sm text-gray-500">
        From: &ldquo;{line.raw}&rdquo;
      </p>
      <p className="mt-2 font-medium text-gray-900">{outcome.question}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {outcome.options.map((option) => (
          <button
            key={option.sku}
            type="button"
            disabled={isResolving}
            onClick={() => onPickOption(option.sku)}
            className="rounded-md border border-amber-400 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
