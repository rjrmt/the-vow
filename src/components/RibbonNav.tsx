"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModuleController } from "@/context/ModuleContext";
import type { ModuleId } from "@/reducers/moduleController";
import { triggerHaptic } from "@/lib/haptics";

const MODULE_LABELS: Record<ModuleId, string> = {
  home: "Home",
  "dopamine-deck": "Deck",
  "pulse-sync": "Pulse",
  "memory-loom": "Loom",
  "affirmation-orbit": "Orbit",
  "coop-canvas": "Canvas",
  reveal: "Reveal",
};

const MODULE_ORDER: ModuleId[] = [
  "home",
  "dopamine-deck",
  "pulse-sync",
  "memory-loom",
  "affirmation-orbit",
  "coop-canvas",
  "reveal",
];

export function RibbonNav() {
  const { current, navigate } = useModuleController();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40
        pb-[var(--sab)] pt-2 px-2
        bg-surface/95 backdrop-blur-md border-t border-border
        safe-area-bottom"
      role="navigation"
      aria-label="Module navigation"
    >
      <div className="flex items-center justify-around gap-1 max-w-lg mx-auto">
        {MODULE_ORDER.map((id) => {
          const isActive = current === id;
          return (
            <motion.button
              key={id}
              onClick={() => {
                triggerHaptic("light");
                navigate(id);
              }}
              className={`
                relative flex-1 py-2.5 px-2 rounded-[var(--radius-sm)]
                text-sm font-medium transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
                ${isActive ? "text-primary" : "text-muted hover:text-foreground"}
              `}
              whileTap={{ scale: 0.95 }}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Go to ${MODULE_LABELS[id]}`}
            >
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.span
                    layoutId="ribbon-active"
                    className="absolute inset-0 bg-primary/10 rounded-[var(--radius-sm)]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>
              <span className="relative z-10">{MODULE_LABELS[id]}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
