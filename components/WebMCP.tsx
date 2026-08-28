"use client";

import { useEffect, useState } from "react";

type WebMCPStatus = "registering" | "registered" | "unsupported" | "error";

export default function WebMCP() {
  const [status, setStatus] = useState<WebMCPStatus>("registering");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const modelContext =
      document.modelContext ?? navigator.modelContext;

    if (typeof modelContext?.registerTool !== "function") {
      queueMicrotask(() => {
        setStatus("unsupported");
      });
      return;
    }

    const controller = new AbortController();

    void modelContext
      .registerTool(
        {
          name: "get_page_title",
          description: "Read the title of the current page.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: {
            readOnlyHint: true,
          },
          execute: () => ({ title: document.title }),
        },
        { signal: controller.signal },
      )
      .then(() => {
        setStatus("registered");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to register tool",
        );
      });

    return () => {
      controller.abort();
    };
  }, []);

  let statusText = "WebMCP: registering...";

  if (status === "registered") {
    statusText = "WebMCP: tool registered";
  } else if (status === "unsupported") {
    statusText = "WebMCP not supported";
  } else if (status === "error") {
    statusText = `WebMCP: registration failed${errorMessage ? ` (${errorMessage})` : ""}`;
  }

  return <p className="text-sm text-gray-600">{statusText}</p>;
}
