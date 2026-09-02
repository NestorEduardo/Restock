"use client";

import { setWebMcpHydrated, startWebMcpRegistration } from "@/components/webmcp/register";
import { useEffect } from "react";

startWebMcpRegistration();

export default function WebMcpBootstrap() {
  useEffect(() => {
    setWebMcpHydrated();
  }, []);

  return null;
}
