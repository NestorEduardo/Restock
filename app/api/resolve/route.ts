import { JsonCatalogSource } from "@/lib/catalog/json-source";
import { decideLine } from "@/lib/engine/decide";
import { OpenAILineSplitter } from "@/lib/providers/openai-splitter";

type ResolveRequest = {
  message?: string;
};

export async function POST(request: Request) {
  let body: ResolveRequest;

  try {
    body = (await request.json()) as ResolveRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 500 },
    );
  }

  try {
    const catalog = new JsonCatalogSource();
    const items = await catalog.listItems("demo");
    const splitter = new OpenAILineSplitter();
    const splitLines = await splitter.split(message);

    const lines = splitLines.map((line) => ({
      raw: line.raw,
      quantity: line.quantity,
      buyerUnit: line.unit,
      outcome: decideLine(line, items),
    }));

    return Response.json({ lines });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to resolve message";
    return Response.json({ error: message }, { status: 500 });
  }
}
