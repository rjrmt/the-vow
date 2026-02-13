"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/context/ThemeContext";
import { DateProvider } from "@/context/DateProvider";
import { SessionProvider } from "@/context/SessionContext";
import { ModuleProvider } from "@/context/ModuleContext";
import { VowThreadProvider } from "@/context/VowThreadContext";
import { SessionGate } from "@/components/SessionGate";
import { RibbonNav } from "@/components/RibbonNav";
import { useModuleController } from "@/context/ModuleContext";
import { ModuleSwitcher } from "@/components/ModuleSwitcher";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
  }),
};

function AppContent() {
  const { current } = useModuleController();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <main
        className="flex-1 overflow-auto pt-[var(--sat)] px-4 pb-24"
        style={{ paddingBottom: "calc(6rem + var(--sab))" }}
      >
        <AnimatePresence mode="wait">
          <ModuleSwitcher key={current} />
        </AnimatePresence>
      </main>
      <RibbonNav />
    </div>
  );
}

export function AppShell() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <DateProvider>
        <SessionProvider>
          <VowThreadProvider>
            <ModuleProvider>
              <SessionGate>
                <AppContent />
              </SessionGate>
            </ModuleProvider>
          </VowThreadProvider>
        </SessionProvider>
        </DateProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
