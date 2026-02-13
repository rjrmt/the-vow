"use client";

import React, { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { useModuleController } from "@/context/ModuleContext";
import type { ModuleId } from "@/reducers/moduleController";

const HomeModule = lazy(() => import("@/modules/Home"));
const DopamineDeckModule = lazy(() => import("@/modules/DopamineDeck"));
const PulseSyncModule = lazy(() => import("@/modules/PulseSync"));
const MemoryLoomModule = lazy(() => import("@/modules/MemoryLoom"));
const AffirmationOrbitModule = lazy(() => import("@/modules/AffirmationOrbit"));
const CoOpCanvasModule = lazy(() => import("@/modules/CoOpCanvas"));
const RevealModule = lazy(() => import("@/modules/Reveal"));

const MODULE_MAP: Record<ModuleId, React.LazyExoticComponent<React.ComponentType>> = {
  home: HomeModule,
  "dopamine-deck": DopamineDeckModule,
  "pulse-sync": PulseSyncModule,
  "memory-loom": MemoryLoomModule,
  "affirmation-orbit": AffirmationOrbitModule,
  "coop-canvas": CoOpCanvasModule,
  reveal: RevealModule,
};

function ModuleFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-8 h-8 rounded-full bg-primary/30"
      />
    </div>
  );
}

export function ModuleSwitcher() {
  const { current } = useModuleController();
  const Module = MODULE_MAP[current];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <Suspense fallback={<ModuleFallback />}>
        {Module ? <Module /> : null}
      </Suspense>
    </motion.div>
  );
}
