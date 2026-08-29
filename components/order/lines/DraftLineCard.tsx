import type { DraftLine } from "@/lib/order/types";

import ClarificationLineCard from "@/components/order/lines/ClarificationLineCard";
import NotFoundLineCard from "@/components/order/lines/NotFoundLineCard";
import ResolvedLineCard from "@/components/order/lines/ResolvedLineCard";

type DraftLineCardProps = {
  line: DraftLine;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onPickOption: (id: string, sku: string) => void;
  resolvingLineId?: string | null;
};

export default function DraftLineCard({
  line,
  onQuantityChange,
  onRemove,
  onPickOption,
  resolvingLineId,
}: DraftLineCardProps) {
  switch (line.outcome.type) {
    case "RESOLVED":
      return (
        <ResolvedLineCard
          line={line}
          onQuantityChange={(quantity) => onQuantityChange(line.id, quantity)}
          onRemove={() => onRemove(line.id)}
        />
      );
    case "NEEDS_CLARIFICATION":
      return (
        <ClarificationLineCard
          line={line}
          onPickOption={(sku) => onPickOption(line.id, sku)}
          isResolving={resolvingLineId === line.id}
        />
      );
    case "NOT_FOUND":
      return (
        <NotFoundLineCard
          line={line}
          onRemove={() => onRemove(line.id)}
        />
      );
  }
}
