import { readFileSync } from "fs";
import path from "path";

import type { CatalogInfo, CatalogSource } from "@/lib/catalog/types";
import type { CatalogItem } from "@/lib/types";

type CatalogJson = {
  distributor: string;
  products: Array<{
    sku: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    unit: string;
  }>;
};

export class JsonCatalogSource implements CatalogSource {
  private cachedItems: CatalogItem[] | null = null;
  private cachedInfo: CatalogInfo | null = null;

  private loadCatalog(): CatalogJson {
    const catalogPath = path.join(process.cwd(), "data", "catalog.json");
    const raw = readFileSync(catalogPath, "utf-8");
    return JSON.parse(raw) as CatalogJson;
  }

  async listItems(tenantId: string): Promise<CatalogItem[]> {
    if (this.cachedItems) {
      return this.cachedItems.map((item) => ({ ...item, tenantId }));
    }

    const parsed = this.loadCatalog();

    this.cachedItems = parsed.products.map((product) => ({
      tenantId,
      id: product.sku,
      name: product.name,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
    }));

    return this.cachedItems;
  }

  async getInfo(_tenantId: string): Promise<CatalogInfo> {
    if (this.cachedInfo) {
      return this.cachedInfo;
    }

    const parsed = this.loadCatalog();
    const categories = [
      ...new Set(parsed.products.map((product) => product.category)),
    ].sort();

    this.cachedInfo = {
      distributor: parsed.distributor,
      itemCount: parsed.products.length,
      categories,
    };

    return this.cachedInfo;
  }
}
