import type { CatalogSource } from "@/lib/catalog/types";
import type { DraftOrder } from "@/lib/types";

export function resolveOrder(
  tenantId: string,
  rawText: string,
  catalog: CatalogSource,
): DraftOrder {
  void tenantId;
  void rawText;
  void catalog;
  throw new Error("Not implemented");
}
