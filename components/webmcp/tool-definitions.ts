import {
  canConfirm,
  orderTotal,
  pendingClarificationCount,
} from "@/lib/order/draft-helpers";

import { webMcpOrderActionsRef } from "@/components/webmcp/actions-ref";

export const RESTOCK_WEBMCP_TOOL_COUNT = 5;

export function createRestockWebMcpTools(): WebMCPToolDefinition[] {
  return [
    {
      name: "resolve_order",
      description:
        "Submit a buyer's order request written in natural language (e.g. 'send me 2 cases of usb c cables and 10 screen protectors for the 14 pro') and get back the resolved order lines, including which ones still need the buyer to pick between options. Updates the on-screen order draft with the results.",
      inputSchema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description:
              "The buyer's raw order request, in natural language.",
          },
        },
        required: ["message"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (args: Record<string, unknown>) => {
        const message = args.message;
        if (typeof message !== "string" || !message.trim()) {
          throw new Error("message is required");
        }
        return webMcpOrderActionsRef.current.resolveMessage(message);
      },
    },
    {
      name: "get_catalog_info",
      description:
        "Get the distributor's name, how many items are in the catalog, and the list of product categories carried. Use this to orient before making order requests.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async () => {
        const response = await fetch("/api/catalog-info");
        const data = (await response.json()) as {
          distributor?: string;
          itemCount?: number;
          categories?: string[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load catalog info");
        }
        return {
          distributor: data.distributor,
          itemCount: data.itemCount,
          categories: data.categories,
        };
      },
    },
    {
      name: "choose_option",
      description:
        "Resolve a pending order line that needs clarification by picking one of its offered options, the same way clicking an option button in the UI does. Use after resolve_order returns a line with type NEEDS_CLARIFICATION.",
      inputSchema: {
        type: "object",
        properties: {
          lineId: {
            type: "string",
            description: "The id of the pending clarification line to resolve.",
          },
          sku: {
            type: "string",
            description:
              "The sku of the chosen option, from that line's options list.",
          },
        },
        required: ["lineId", "sku"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (args: Record<string, unknown>) => {
        const lineId = args.lineId;
        const sku = args.sku;
        if (typeof lineId !== "string" || !lineId.trim()) {
          throw new Error("lineId is required");
        }
        if (typeof sku !== "string" || !sku.trim()) {
          throw new Error("sku is required");
        }
        return webMcpOrderActionsRef.current.pickOption(lineId, sku);
      },
    },
    {
      name: "get_order_draft",
      description:
        "Get the current state of the buyer's order draft: every line with its outcome (resolved, needing clarification, or not found), and the running total price.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: () => webMcpOrderActionsRef.current.getDraftSnapshot(),
    },
    {
      name: "submit_order",
      description:
        "Submit the buyer's order draft for confirmation. Fails with a clear message if any line still needs clarification — every line must be resolved first (mirrors the UI's disabled Confirm button). This changes state and should prompt the buyer for confirmation before running.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      execute: () => {
        const snapshot = webMcpOrderActionsRef.current.getDraftSnapshot();
        const currentLines = webMcpOrderActionsRef.current.lines;

        if (snapshot.lines.length === 0) {
          throw new Error("Cannot submit: order draft is empty");
        }

        if (!canConfirm(currentLines)) {
          const pending = pendingClarificationCount(currentLines);
          throw new Error(
            `Cannot submit: ${pending} line${pending === 1 ? "" : "s"} still need${pending === 1 ? "s" : ""} clarification`,
          );
        }

        webMcpOrderActionsRef.current.confirmOrder();
        return {
          confirmed: true,
          total: orderTotal(currentLines),
          lineCount: currentLines.filter(
            (line) => line.outcome.type === "RESOLVED",
          ).length,
        };
      },
    },
  ];
}
