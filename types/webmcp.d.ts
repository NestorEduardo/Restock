interface WebMCPToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: {
    readOnlyHint?: boolean;
  };
  execute: (args: Record<string, unknown>) => unknown | Promise<unknown>;
}

interface ModelContextToolChangeEvent extends Event {
  type: "toolchange";
}

interface ModelContext extends EventTarget {
  registerTool?(
    tool: WebMCPToolDefinition,
    options?: { signal?: AbortSignal },
  ): Promise<void>;
  provideContext?(options: {
    tools: WebMCPToolDefinition[];
  }): Promise<void>;
  unregisterTool?(name: string): Promise<void>;
  getTools?(): Promise<WebMCPToolDefinition[]>;
  executeTool?(
    name: string,
    input: Record<string, unknown>,
  ): Promise<unknown>;
  ontoolchange?: ((event: ModelContextToolChangeEvent) => void) | null;
}

interface Navigator {
  modelContext?: ModelContext;
}

interface Document {
  modelContext?: ModelContext;
}

interface Window {
  __restockWebmcp?: import("@/components/webmcp/diagnostics").RestockWebmcpDiagnostics;
}
