interface WebMCPToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: {
    readOnlyHint?: boolean;
  };
  execute: (args: Record<string, unknown>) => unknown | Promise<unknown>;
}

interface ModelContext {
  registerTool(
    tool: WebMCPToolDefinition,
    options?: { signal?: AbortSignal },
  ): Promise<void>;
}

interface Navigator {
  modelContext?: ModelContext;
}

interface Document {
  modelContext?: ModelContext;
}
