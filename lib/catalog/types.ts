import type { CatalogItem } from "@/lib/types";

export type CatalogInfo = {
  distributor: string;
  itemCount: number;
  categories: string[];
};

export interface CatalogSource {
  listItems(tenantId: string): Promise<CatalogItem[]>;
  getInfo(tenantId: string): Promise<CatalogInfo>;
}
