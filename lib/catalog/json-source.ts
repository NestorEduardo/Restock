import { readFileSync } from "fs";
import path from "path";

import type { CatalogSource } from "@/lib/catalog/types";
import type { CatalogItem } from "@/lib/types";

type CatalogJson = {
  products: Array<{
    sku: string;
    name: string;
  }>;
};

export class JsonCatalogSource implements CatalogSource {
  private cachedItems: CatalogItem[] | null = null;

  async listItems(tenantId: string): Promise<CatalogItem[]> {
    if (this.cachedItems) {
      return this.cachedItems.map((item) => ({ ...item, tenantId }));
    }

    const catalogPath = path.join(process.cwd(), "data", "catalog.json");
    const raw = readFileSync(catalogPath, "utf-8");
    const parsed = JSON.parse(raw) as CatalogJson;

    this.cachedItems = parsed.products.map((product) => ({
      tenantId,
      id: product.sku,
      name: product.name,
    }));

    return this.cachedItems;
  }
}
