import type { AvailabilityFlag } from "@/lib/engine/types";

type AvailabilityBadgeProps = {
  availability: AvailabilityFlag;
};

export default function AvailabilityBadge({
  availability,
}: AvailabilityBadgeProps) {
  if (availability === "ok") {
    return null;
  }

  const label =
    availability === "out_of_stock" ? "Out of stock" : "Insufficient stock";

  return (
    <span className="inline-flex items-center rounded-md bg-warning-bg px-2 py-0.5 text-xs font-medium text-warning">
      {label}
    </span>
  );
}
