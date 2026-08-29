"use client";

import { useState } from "react";

import type { LineOutcome } from "@/lib/engine/types";
import {
  applyResolvedOutcome,
  createDraftLines,
  removeLine,
  updateLineQuantity,
} from "@/lib/order/draft-helpers";
import type { DraftLine, ResolveResponse } from "@/lib/order/types";

import MessageInput from "@/components/order/MessageInput";
import OrderConfirmation from "@/components/order/OrderConfirmation";
import OrderDraft from "@/components/order/OrderDraft";
import OrderFooter from "@/components/order/OrderFooter";

export default function OrderPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [resolvingLineId, setResolvingLineId] = useState<string | null>(null);

  async function handleSubmit() {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

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

      setLines(createDraftLines(data.lines));
      setHasSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to resolve message",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePickOption(lineId: string, sku: string) {
    const line = lines.find((entry) => entry.id === lineId);
    if (!line) {
      return;
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

      setLines((current) => applyResolvedOutcome(current, lineId, data));
    } catch (pickError) {
      setError(
        pickError instanceof Error
          ? pickError.message
          : "Failed to resolve option",
      );
    } finally {
      setResolvingLineId(null);
    }
  }

  function handleQuantityChange(id: string, quantity: number) {
    setLines((current) => updateLineQuantity(current, id, quantity));
  }

  function handleRemove(id: string) {
    setLines((current) => removeLine(current, id));
  }

  function handleConfirm() {
    setConfirmed(true);
  }

  function handleStartOver() {
    setMessage("");
    setLines([]);
    setHasSubmitted(false);
    setConfirmed(false);
    setError(null);
  }

  if (confirmed) {
    return (
      <OrderConfirmation lines={lines} onStartOver={handleStartOver} />
    );
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <MessageInput
          message={message}
          isLoading={isLoading}
          error={error}
          onMessageChange={setMessage}
          onSubmit={handleSubmit}
        />
        <OrderDraft
          lines={lines}
          hasSubmitted={hasSubmitted}
          onQuantityChange={handleQuantityChange}
          onRemove={handleRemove}
          onPickOption={handlePickOption}
          resolvingLineId={resolvingLineId}
        />
      </div>
      <OrderFooter
        lines={lines}
        hasSubmitted={hasSubmitted}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
