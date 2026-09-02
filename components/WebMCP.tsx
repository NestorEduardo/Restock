"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

import { setWebMcpOrderActions } from "@/components/webmcp/actions-ref";
import {
  getRestockWebmcpDiagnostics,
  subscribeRestockWebmcp,
} from "@/components/webmcp/register";
import { formatWebMcpStatusLine } from "@/components/webmcp/format-status";
import { useOrderDraft } from "@/components/order/OrderDraftContext";

export default function WebMCP() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const {
    lines,
    resolveMessage,
    pickOption,
    confirmOrder,
    getDraftSnapshot,
  } = useOrderDraft();

  useLayoutEffect(() => {
    setWebMcpOrderActions({
      lines,
      resolveMessage,
      pickOption,
      confirmOrder,
      getDraftSnapshot,
    });
  }, [lines, resolveMessage, pickOption, confirmOrder, getDraftSnapshot]);

  const diagnostics = useSyncExternalStore(
    subscribeRestockWebmcp,
    getRestockWebmcpDiagnostics,
    getRestockWebmcpDiagnostics,
  );

  if (!mounted) {
    return null;
  }

  return (
    <p className="text-[10px] text-muted-foreground/60">
      {formatWebMcpStatusLine(diagnostics)}
    </p>
  );
}
