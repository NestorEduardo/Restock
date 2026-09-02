export type WebMcpSurface = "document" | "navigator" | "none";

export type WebMcpRegistrationMode =
  | "registerTool"
  | "provideContext"
  | "none";

export type WebMcpToolResultStatus = "success" | "timeout" | "error" | "skipped";

export type WebMcpOverallStatus =
  | "booting"
  | "waiting-for-api"
  | "registering"
  | "complete"
  | "partial"
  | "unsupported"
  | "error";

export type WebMcpToolResult = {
  name: string;
  status: WebMcpToolResultStatus;
  error?: string;
};

export type RestockWebmcpDiagnostics = {
  surface: WebMcpSurface;
  methods: string[];
  mode: WebMcpRegistrationMode;
  hydrated: boolean;
  status: WebMcpOverallStatus;
  registeredCount: number;
  totalCount: number;
  toolResults: WebMcpToolResult[];
  lastError: string | null;
  waitingMs: number;
  updatedAt: number;
};

export const RESTOCK_WEBMCP_EVENT = "restock-webmcp-update";
