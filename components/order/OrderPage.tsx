"use client";

import { useOrderDraft } from "@/components/order/OrderDraftContext";
import MessageInput from "@/components/order/MessageInput";
import OrderConfirmation from "@/components/order/OrderConfirmation";
import OrderDraft from "@/components/order/OrderDraft";
import OrderFooter from "@/components/order/OrderFooter";

export default function OrderPage() {
  const {
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
    updateQuantity,
    removeLine,
    confirmOrder,
    startOver,
  } = useOrderDraft();

  async function handleSubmit() {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }
    await resolveMessage(trimmed);
  }

  if (confirmed) {
    return (
      <OrderConfirmation lines={lines} onStartOver={startOver} />
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
          onQuantityChange={updateQuantity}
          onRemove={removeLine}
          onPickOption={pickOption}
          resolvingLineId={resolvingLineId}
        />
      </div>
      <OrderFooter
        lines={lines}
        hasSubmitted={hasSubmitted}
        onConfirm={confirmOrder}
      />
    </div>
  );
}
