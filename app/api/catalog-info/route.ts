import { JsonCatalogSource } from "@/lib/catalog/json-source";

export async function GET() {
  try {
    const catalog = new JsonCatalogSource();
    const info = await catalog.getInfo("demo");
    return Response.json(info);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load catalog info";
    return Response.json({ error: message }, { status: 500 });
  }
}
