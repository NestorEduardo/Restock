import type { DraftLine } from "@/lib/order/types";

type NotFoundLineCardProps = {
  line: DraftLine;
  onRemove: () => void;
};

export default function NotFoundLineCard({
  line,
  onRemove,
}: NotFoundLineCardProps) {
  if (line.outcome.type !== "NOT_FOUND") {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Not found
          </p>
          <p className="mt-1 text-sm text-red-700">
            {line.outcome.description}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            From: &ldquo;{line.raw}&rdquo;
          </p>
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
    </div>
  );
}
