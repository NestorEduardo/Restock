import type { AvailabilityFlag, LineOutcome } from "@/lib/engine/types";
import { recogniseBuyerUnit } from "@/lib/engine/units";
import type { CatalogItem } from "@/lib/types";

function buildAvailability(
  stock: number,
  quantity: number,
): AvailabilityFlag {
  if (stock === 0) {
    return "out_of_stock";
  }

  if (stock < quantity) {
    return "insufficient";
  }

  return "ok";
}

export function resolveBySku(
  sku: string,
  quantity: number,
  buyerUnit: string | null,
  items: CatalogItem[],
): LineOutcome {
  const catalogItem = items.find((item) => item.id === sku);

  if (!catalogItem) {
    return {
      type: "NOT_FOUND",
      description: sku,
    };
  }

  const unitRecognition = recogniseBuyerUnit(buyerUnit);

  return {
    type: "RESOLVED",
    sku: catalogItem.id,
    name: catalogItem.name,
    unit: catalogItem.unit,
    price: catalogItem.price,
    quantity,
    reason: "selected from clarification options",
    availability: buildAvailability(catalogItem.stock, quantity),
    unitRecognised: unitRecognition.recognised,
    buyerUnit,
  };
}
