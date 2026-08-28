export type CatalogItem = {
  tenantId: string;
  id: string;
  name: string;
};

export type OrderLine = {
  tenantId: string;
  rawText: string;
};

export type DraftOrder = {
  tenantId: string;
  lines: OrderLine[];
};
