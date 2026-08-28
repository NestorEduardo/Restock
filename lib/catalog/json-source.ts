import type { CatalogSource } from "@/lib/catalog/types";
import type { CatalogItem } from "@/lib/types";

export class JsonCatalogSource implements CatalogSource {
  async listItems(tenantId: string): Promise<CatalogItem[]> {
    void tenantId;
    return [];
  }
}
