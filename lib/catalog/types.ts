import type { CatalogItem } from "@/lib/types";

export interface CatalogSource {
  listItems(tenantId: string): Promise<CatalogItem[]>;
}
