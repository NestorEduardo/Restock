"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { LineOutcome } from "@/lib/engine/types";
import {
  applyResolvedOutcome,
  canConfirm,
  createDraftLines,
  orderTotal,
  removeLine,
  updateLineQuantity,
} from "@/lib/order/draft-helpers";
import { serializeDraftSnapshot } from "@/lib/order/tool-serializers";
import type { DraftLine, ResolveResponse } from "@/lib/order/types";

type DraftSnapshot = ReturnType<typeof serializeDraftSnapshot>;

type OrderDraftContextValue = {
  message: string;
  setMessage: (message: string) => void;
  lines: DraftLine[];
  hasSubmitted: boolean;
  confirmed: boolean;
  isLoading: boolean;
  error: string | null;
  resolvingLineId: string | null;
  resolveMessage: (message: string) => Promise<DraftSnapshot>;
  pickOption: (lineId: string, sku: string) => Promise<DraftSnapshot>;
  updateQuantity: (id: string, quantity: number) => void;
  removeLine: (id: string) => void;
  confirmOrder: () => void;
  startOver: () => void;
  getDraftSnapshot: () => DraftSnapshot;
};

const OrderDraftContext = createContext<OrderDraftContextValue | null>(null);

export function useOrderDraft() {
  const context = useContext(OrderDraftContext);
  if (!context) {
    throw new Error("useOrderDraft must be used within OrderDraftProvider");
  }
  return context;
}

export function OrderDraftProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [resolvingLineId, setResolvingLineId] = useState<string | null>(null);

  const getDraftSnapshot = useCallback((): DraftSnapshot => {
    return serializeDraftSnapshot(lines, confirmed);
  }, [lines, confirmed]);

  const resolveMessage = useCallback(async (rawMessage: string) => {
    const trimmed = rawMessage.trim();
    if (!trimmed) {
      throw new Error("message is required");
    }

    setMessage(trimmed);
    setIsLoading(true);
    setError(null);
    setConfirmed(false);

    try {
      const response = await fetch("/api/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = (await response.json()) as ResolveResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to resolve message");
      }

      const nextLines = createDraftLines(data.lines);
      setLines(nextLines);
      setHasSubmitted(true);
      return serializeDraftSnapshot(nextLines, false);
    } catch (submitError) {
      const messageText =
        submitError instanceof Error
          ? submitError.message
          : "Failed to resolve message";
      setError(messageText);
      throw submitError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pickOption = useCallback(
    async (lineId: string, sku: string) => {
      const line = lines.find((entry) => entry.id === lineId);
      if (!line) {
        throw new Error(`Line not found: ${lineId}`);
      }
      if (line.outcome.type !== "NEEDS_CLARIFICATION") {
        throw new Error(`Line ${lineId} does not need clarification`);
      }

      setResolvingLineId(lineId);
      setError(null);

      try {
        const response = await fetch("/api/resolve-option", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sku,
            quantity: line.quantity,
            buyerUnit: line.buyerUnit,
          }),
        });

        const data = (await response.json()) as LineOutcome & { error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to resolve option");
        }

        let nextLines: DraftLine[] = [];
        setLines((current) => {
          nextLines = applyResolvedOutcome(current, lineId, data);
          return nextLines;
        });
        return serializeDraftSnapshot(nextLines, false);
      } catch (pickError) {
        const messageText =
          pickError instanceof Error
            ? pickError.message
            : "Failed to resolve option";
        setError(messageText);
        throw pickError;
      } finally {
        setResolvingLineId(null);
      }
    },
    [lines],
  );

  const updateQuantityHandler = useCallback((id: string, quantity: number) => {
    setLines((current) => updateLineQuantity(current, id, quantity));
  }, []);

  const removeLineHandler = useCallback((id: string) => {
    setLines((current) => removeLine(current, id));
  }, []);

  const confirmOrder = useCallback(() => {
    setConfirmed(true);
  }, []);

  const startOver = useCallback(() => {
    setMessage("");
    setLines([]);
    setHasSubmitted(false);
    setConfirmed(false);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      message,
      setMessage,
      lines,
      hasSubmitted,
      confirmed,
      isLoading,
      error,
      resolvingLineId,
      resolveMessage,
      pickOption,
      updateQuantity: updateQuantityHandler,
      removeLine: removeLineHandler,
      confirmOrder,
      startOver,
      getDraftSnapshot,
    }),
    [
      message,
      lines,
      hasSubmitted,
      confirmed,
      isLoading,
      error,
      resolvingLineId,
      resolveMessage,
      pickOption,
      updateQuantityHandler,
      removeLineHandler,
      confirmOrder,
      startOver,
      getDraftSnapshot,
    ],
  );

  return (
    <OrderDraftContext.Provider value={value}>
      {children}
    </OrderDraftContext.Provider>
  );
}