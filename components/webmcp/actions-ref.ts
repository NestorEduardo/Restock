import type { DraftLine } from "@/lib/order/types";
import type { serializeDraftSnapshot } from "@/lib/order/tool-serializers";

type DraftSnapshot = ReturnType<typeof serializeDraftSnapshot>;

export type WebMcpOrderActions = {
  lines: DraftLine[];
  resolveMessage: (message: string) => Promise<DraftSnapshot>;
  pickOption: (lineId: string, sku: string) => Promise<DraftSnapshot>;
  confirmOrder: () => void;
  getDraftSnapshot: () => DraftSnapshot;
};

function notReady(): never {
  throw new Error("Order draft is not ready yet");
}

const defaultActions: WebMcpOrderActions = {
  lines: [],
  resolveMessage: async () => notReady(),
  pickOption: async () => notReady(),
  confirmOrder: () => notReady(),
  getDraftSnapshot: () => notReady(),
};

export const webMcpOrderActionsRef: { current: WebMcpOrderActions } = {
  current: defaultActions,
};

export function setWebMcpOrderActions(actions: WebMcpOrderActions) {
  webMcpOrderActionsRef.current = actions;
}
