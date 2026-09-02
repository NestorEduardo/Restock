import { readFileSync } from "fs";
import path from "path";

import type { CatalogInfo, CatalogSource } from "@/lib/catalog/types";
import type { CatalogItem } from "@/lib/types";

type CatalogJson = {
  distributor: string;
  currency: string;
  updated: string;
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
  private cachedCatalog: CatalogJson | null = null;
  private cachedInfo: CatalogInfo | null = null;

  private loadCatalog(): CatalogJson {
    if (this.cachedCatalog) {
      return this.cachedCatalog;
    }

    const catalogPath = path.join(process.cwd(), "data", "catalog.json");
    const raw = readFileSync(catalogPath, "utf-8");
    this.cachedCatalog = JSON.parse(raw) as CatalogJson;
    return this.cachedCatalog;
  }

  async listItems(tenantId: string): Promise<CatalogItem[]> {
    const parsed = this.loadCatalog();

    return parsed.products.map((product) => ({
      tenantId,
      id: product.sku,
      name: product.name,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
    }));
  }

  async getInfo(tenantId: string): Promise<CatalogInfo> {
    void tenantId;
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
