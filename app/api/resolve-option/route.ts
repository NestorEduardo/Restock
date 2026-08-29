import { JsonCatalogSource } from "@/lib/catalog/json-source";
import { resolveBySku } from "@/lib/order/resolve-by-sku";

type ResolveOptionRequest = {
  sku?: string;
  quantity?: number;
  buyerUnit?: string | null;
};

export async function POST(request: Request) {
  let body: ResolveOptionRequest;

  try {
    body = (await request.json()) as ResolveOptionRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sku = body.sku?.trim();
  if (!sku) {
    return Response.json({ error: "sku is required" }, { status: 400 });
  }

  const quantity = body.quantity;
  if (quantity === undefined || quantity === null || quantity < 1) {
    return Response.json(
      { error: "quantity must be a positive number" },
      { status: 400 },
    );
  }

  const buyerUnit = body.buyerUnit ?? null;

  try {
    const catalog = new JsonCatalogSource();
    const items = await catalog.listItems("demo");
    const outcome = resolveBySku(sku, quantity, buyerUnit, items);

    if (outcome.type === "NOT_FOUND") {
      return Response.json({ error: `SKU not found: ${sku}` }, { status: 404 });
    }

    return Response.json(outcome);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to resolve option";
    return Response.json({ error: message }, { status: 500 });
  }
}
