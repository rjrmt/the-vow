"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/AppShell";

const SESSION_REVEAL_PATTERN = /^\/session\/[^/]+\/reveal$/;

export function RootContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname && SESSION_REVEAL_PATTERN.test(pathname)) {
    return <>{children}</>;
  }

  return <AppShell />;
}
