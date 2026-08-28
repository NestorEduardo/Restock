import OpenAI from "openai";

import type { LineSplitter, SplitLine } from "@/lib/engine/split";

export const LINE_SPLIT_PROMPT = `You split buyer messages from a B2B distributor ordering portal into structured order lines.

Return a JSON object with a "lines" array. Each line has:
- quantity (number): how many the buyer wants. Use 1 when they did not specify a number.
- unit (string or null): the buyer's exact unit word if they used one ("case", "cases", "dozen", "pallet", "ea", "cse", etc.). Do NOT normalize or convert units. Use null when no unit was stated.
- description (string): product text only — no quantity, no unit, no filler phrases ("send me", "i need", "put me down for"). Ready to search a product catalog.
- raw (string): the original text fragment this line came from, so the UI can show where each line originated.

Rules:
1. Greetings, small talk, and filler with no order → return an empty lines array. Do not invent products.
2. Price or availability questions (e.g. "how much is...") → empty lines array. Not an order.
3. Vague requests with no actionable product detail (e.g. "send me a bit of everything") → empty lines array, or at most one line with a vague description. Never fabricate specific products.
4. One message may contain multiple lines separated by commas, "and", colons, newlines, or dash lists. Strip greetings and list formatting.
5. Preserve trailing-x quantity form: "bluetooth earbuds x 6" → quantity 6, description "bluetooth earbuds".
6. Implicit quantity: "a ring light" → quantity 1.
7. Unit vs product context: "2 cases of usb c cables" → unit is "cases" (packaging unit), description "usb c cables". But "2 cases for the 14" → unit is null, description "cases for the 14" (phone cases are the product).
8. Preserve unusual units exactly: "3 pallets of usb c cables" → unit "pallet" (singular or plural as buyer said), not normalized.
9. "put me down for 2 dozen clear cases 15 pro" → quantity 2, unit "dozen", description "clear cases 15 pro".

Examples:
- "hey good morning" → { "lines": [] }
- "how much is the 6ft usb c cable?" → { "lines": [] }
- "bluetooth earbuds x 6" → { "lines": [{ "quantity": 6, "unit": null, "description": "bluetooth earbuds", "raw": "bluetooth earbuds x 6" }] }
- "a ring light" → { "lines": [{ "quantity": 1, "unit": null, "description": "ring light", "raw": "a ring light" }] }
- "hey, for today: 5 lightning 3ft, 5 lightning 6ft and 3 45w chargers" → three lines, greeting stripped
- "need:\\n- 12 clear cases iphone 14\\n- 6 bluetooth earbuds\\n- 2 medium speakers" → three lines from dash list`;

const SPLIT_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    lines: {
      type: "array",
      items: {
        type: "object",
        properties: {
          quantity: { type: "number" },
          unit: { type: ["string", "null"] },
          description: { type: "string" },
          raw: { type: "string" },
        },
        required: ["quantity", "unit", "description", "raw"],
        additionalProperties: false,
      },
    },
  },
  required: ["lines"],
  additionalProperties: false,
} as const;

type SplitResponse = {
  lines: SplitLine[];
};

export type OpenAILineSplitterOptions = {
  apiKey?: string;
  model?: string;
};

export class OpenAILineSplitter implements LineSplitter {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAILineSplitterOptions = {}) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is required for OpenAILineSplitter. Set it in the environment or pass apiKey.",
      );
    }

    this.client = new OpenAI({ apiKey });
    this.model = options.model ?? "gpt-4o-mini";
  }

  async split(message: string): Promise<SplitLine[]> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: LINE_SPLIT_PROMPT },
        { role: "user", content: message },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "order_lines",
          strict: true,
          schema: SPLIT_RESPONSE_SCHEMA,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned an empty split response.");
    }

    const parsed = JSON.parse(content) as SplitResponse;
    return parsed.lines.map((line) => ({
      quantity: line.quantity,
      unit: line.unit,
      description: line.description,
      raw: line.raw,
    }));
  }
}
