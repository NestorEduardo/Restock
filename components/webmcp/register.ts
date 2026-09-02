import {
  RESTOCK_WEBMCP_EVENT,
  type RestockWebmcpDiagnostics,
  type WebMcpRegistrationMode,
  type WebMcpSurface,
  type WebMcpToolResult,
} from "@/components/webmcp/diagnostics";
import {
  createRestockWebMcpTools,
  RESTOCK_WEBMCP_TOOL_COUNT,
} from "@/components/webmcp/tool-definitions";

const POLL_INTERVAL_MS = 500;
const DISCOVERY_TIMEOUT_MS = 60_000;
const PER_TOOL_TIMEOUT_MS = 10_000;
const PROVIDE_CONTEXT_TIMEOUT_MS = 15_000;

const METHOD_NAMES = [
  "registerTool",
  "provideContext",
  "unregisterTool",
  "getTools",
  "executeTool",
] as const;

function createInitialDiagnostics(): RestockWebmcpDiagnostics {
  return {
    surface: "none",
    methods: [],
    mode: "none",
    hydrated: false,
    status: "booting",
    registeredCount: 0,
    totalCount: RESTOCK_WEBMCP_TOOL_COUNT,
    toolResults: [],
    lastError: null,
    waitingMs: 0,
    updatedAt: Date.now(),
  };
}

let diagnostics: RestockWebmcpDiagnostics = createInitialDiagnostics();
let hydrated = false;
let started = false;
let startedAt: number | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let registrationInFlight = false;
let registrationComplete = false;
let lastRegistrationAttemptKey: string | null = null;
let registrationController: AbortController | null = null;

function publish(next: Partial<RestockWebmcpDiagnostics>) {
  diagnostics = {
    ...diagnostics,
    ...next,
    updatedAt: Date.now(),
  };
  window.__restockWebmcp = diagnostics;
  window.dispatchEvent(new Event(RESTOCK_WEBMCP_EVENT));
}

function getExposedMethods(modelContext: ModelContext): string[] {
  const methods: string[] = [];

  for (const name of METHOD_NAMES) {
    if (typeof modelContext[name] === "function") {
      methods.push(name);
    }
  }

  if (
    "ontoolchange" in modelContext ||
    ("addEventListener" in modelContext &&
      typeof modelContext.addEventListener === "function")
  ) {
    methods.push("ontoolchange");
  }

  return methods;
}

function resolveModelContext(): {
  surface: WebMcpSurface;
  ctx: ModelContext | null;
  methods: string[];
} {
  const candidates: Array<{ surface: WebMcpSurface; ctx: ModelContext | undefined }> =
    [
      { surface: "navigator", ctx: navigator.modelContext },
      { surface: "document", ctx: document.modelContext },
    ];

  for (const { surface, ctx } of candidates) {
    if (!ctx) {
      continue;
    }

    const methods = getExposedMethods(ctx);
    if (methods.length > 0) {
      return { surface, ctx, methods };
    }
  }

  return { surface: "none", ctx: null, methods: [] };
}

function chooseRegistrationMode(
  methods: string[],
): WebMcpRegistrationMode {
  if (methods.includes("registerTool")) {
    return "registerTool";
  }
  if (methods.includes("provideContext")) {
    return "provideContext";
  }
  return "none";
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error: unknown) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function registerOneTool(
  ctx: ModelContext,
  tool: WebMCPToolDefinition,
  signal: AbortSignal,
): Promise<void> {
  const register = ctx.registerTool!.bind(ctx);

  try {
    await withTimeout(
      register(tool, { signal }),
      PER_TOOL_TIMEOUT_MS,
      `registerTool(${tool.name})`,
    );
    return;
  } catch (firstError) {
    if (signal.aborted) {
      throw firstError;
    }
  }

  await withTimeout(
    register(tool),
    PER_TOOL_TIMEOUT_MS,
    `registerTool(${tool.name})`,
  );
}

async function registerViaRegisterTool(
  ctx: ModelContext,
  signal: AbortSignal,
): Promise<WebMcpToolResult[]> {
  const tools = createRestockWebMcpTools();

  return Promise.all(
    tools.map(async (tool): Promise<WebMcpToolResult> => {
      if (signal.aborted) {
        return {
          name: tool.name,
          status: "skipped",
          error: "aborted",
        };
      }

      try {
        await registerOneTool(ctx, tool, signal);
        return { name: tool.name, status: "success" };
      } catch (error) {
        const message = errorMessage(error);
        const status = message.includes("timed out") ? "timeout" : "error";
        return { name: tool.name, status, error: message };
      }
    }),
  );
}

async function registerViaProvideContext(
  ctx: ModelContext,
): Promise<WebMcpToolResult[]> {
  const tools = createRestockWebMcpTools();

  try {
    await withTimeout(
      ctx.provideContext!({ tools }),
      PROVIDE_CONTEXT_TIMEOUT_MS,
      "provideContext",
    );
    return tools.map((tool) => ({ name: tool.name, status: "success" as const }));
  } catch (error) {
    const message = errorMessage(error);
    const status = message.includes("timed out") ? "timeout" : "error";
    return tools.map((tool) => ({
      name: tool.name,
      status,
      error: message,
    }));
  }
}

function summarizeResults(
  toolResults: WebMcpToolResult[],
): Pick<
  RestockWebmcpDiagnostics,
  "registeredCount" | "status" | "lastError"
> {
  const registeredCount = toolResults.filter(
    (result) => result.status === "success",
  ).length;

  if (registeredCount === RESTOCK_WEBMCP_TOOL_COUNT) {
    return {
      registeredCount,
      status: "complete",
      lastError: null,
    };
  }

  if (registeredCount === 0) {
    const firstFailure = toolResults.find(
      (result) => result.status !== "success",
    );
    return {
      registeredCount,
      status: "error",
      lastError: firstFailure?.error ?? "No tools registered",
    };
  }

  return {
    registeredCount,
    status: "partial",
    lastError: null,
  };
}

async function attemptRegistration(
  ctx: ModelContext,
  mode: WebMcpRegistrationMode,
  surface: WebMcpSurface,
  methods: string[],
  signal: AbortSignal,
) {
  registrationInFlight = true;

  publish({
    surface,
    methods,
    mode,
    status: "registering",
    registeredCount: 0,
    toolResults: [],
    lastError: null,
  });

  const toolResults =
    mode === "provideContext"
      ? await registerViaProvideContext(ctx)
      : await registerViaRegisterTool(ctx, signal);

  if (signal.aborted) {
    registrationInFlight = false;
    return;
  }

  const summary = summarizeResults(toolResults);
  publish({
    toolResults,
    ...summary,
  });

  registrationInFlight = false;
  registrationComplete = summary.status === "complete";
  lastRegistrationAttemptKey = `${surface}:${mode}`;
}

async function pollOnce() {
  startedAt = startedAt ?? Date.now();
  const waitingMs = Date.now() - startedAt;
  const { surface, ctx, methods } = resolveModelContext();
  const mode = chooseRegistrationMode(methods);

  if (!hydrated) {
    publish({
      surface,
      methods,
      mode,
      status: "booting",
      waitingMs,
    });
    return;
  }

  if (registrationComplete) {
    publish({ surface, methods, mode, waitingMs });
    return;
  }

  const attemptKey = `${surface}:${mode}`;
  const alreadyAttempted =
    attemptKey === lastRegistrationAttemptKey &&
    (diagnostics.status === "complete" ||
      diagnostics.status === "partial" ||
      diagnostics.status === "error");

  if (alreadyAttempted) {
    publish({ surface, methods, mode, waitingMs });
    return;
  }

  if (registrationInFlight) {
    publish({ surface, methods, mode, waitingMs, status: "registering" });
    return;
  }

  if (!ctx || mode === "none") {
    lastRegistrationAttemptKey = null;
    publish({
      surface: "none",
      methods: [],
      mode: "none",
      waitingMs,
      status:
        waitingMs >= DISCOVERY_TIMEOUT_MS ? "unsupported" : "waiting-for-api",
      lastError:
        waitingMs >= DISCOVERY_TIMEOUT_MS
          ? `modelContext not found after ${DISCOVERY_TIMEOUT_MS}ms`
          : null,
    });
    return;
  }

  registrationController?.abort();
  registrationController = new AbortController();
  await attemptRegistration(
    ctx,
    mode,
    surface,
    methods,
    registrationController.signal,
  );
}

function stopPolling() {
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export function getRestockWebmcpDiagnostics(): RestockWebmcpDiagnostics {
  return diagnostics;
}

export function subscribeRestockWebmcp(listener: () => void): () => void {
  window.addEventListener(RESTOCK_WEBMCP_EVENT, listener);
  return () => window.removeEventListener(RESTOCK_WEBMCP_EVENT, listener);
}

export function setWebMcpHydrated() {
  hydrated = true;
  publish({ hydrated: true });
}

export function startWebMcpRegistration() {
  if (started || typeof window === "undefined") {
    return;
  }
  started = true;
  startedAt = Date.now();

  window.__restockWebmcp = diagnostics;

  stopPolling();
  void pollOnce();
  pollTimer = setInterval(() => {
    void pollOnce();
  }, POLL_INTERVAL_MS);
}

if (typeof window !== "undefined") {
  startWebMcpRegistration();
}
