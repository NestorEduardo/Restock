import type { RestockWebmcpDiagnostics } from "@/components/webmcp/diagnostics";

export function formatWebMcpStatusLine(
  diagnostics: RestockWebmcpDiagnostics,
): string {
  const {
    surface,
    methods,
    mode,
    hydrated,
    status,
    registeredCount,
    totalCount,
    toolResults,
    lastError,
    waitingMs,
  } = diagnostics;

  const methodsLabel =
    methods.length > 0 ? methods.join(",") : "none";
  const base = `WebMCP: surface=${surface} methods=${methodsLabel} mode=${mode} hydrated=${hydrated ? "yes" : "no"}`;

  if (!hydrated) {
    return `${base} | booting (React not hydrated yet)`;
  }

  if (status === "waiting-for-api") {
    const seconds = Math.round(waitingMs / 1000);
    return `${base} | waiting for modelContext (${seconds}s)`;
  }

  if (status === "registering") {
    return `${base} | registering ${registeredCount}/${totalCount}`;
  }

  if (status === "complete") {
    return `${base} | ${registeredCount}/${totalCount} registered`;
  }

  if (status === "partial") {
    const failures = toolResults
      .filter((result) => result.status !== "success")
      .map((result) => `${result.name}: ${result.error ?? result.status}`)
      .join("; ");
    return `${base} | ${registeredCount}/${totalCount} partial (${failures})`;
  }

  if (status === "unsupported") {
    return `${base} | unsupported${lastError ? ` (${lastError})` : ""}`;
  }

  if (status === "error") {
    return `${base} | error${lastError ? ` (${lastError})` : ""}`;
  }

  return `${base} | ${status}`;
}
