"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSession } from "@/context/SessionContext";
import { useModuleController } from "@/context/ModuleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HomeModule() {
  const { session } = useSession();
  const { navigate } = useModuleController();
  const { cycleTheme } = useTheme();

  const modules = [
    { id: "dopamine-deck" as const, label: "Dopamine Deck", desc: "Swipe to accept or skip" },
    { id: "pulse-sync" as const, label: "Pulse Sync", desc: "Synchronized hold together" },
    { id: "memory-loom" as const, label: "Memory Loom", desc: "Reorder your timeline" },
    { id: "affirmation-orbit" as const, label: "Affirmation Orbit", desc: "Floating orbs of wisdom" },
    { id: "coop-canvas" as const, label: "Co-Op Canvas", desc: "Draw together in realtime" },
  ];

  return (
    <div className="py-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">The Vow</h1>
          <p className="text-muted text-sm mt-0.5">
            Session {session?.code ?? "—"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={cycleTheme}>
          Theme
        </Button>
      </motion.div>

      <div className="grid gap-3">
        {modules.map((mod, i) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="p-4 cursor-pointer active:opacity-90"
              onClick={() => navigate(mod.id)}
            >
              <h2 className="font-semibold">{mod.label}</h2>
              <p className="text-muted text-sm mt-0.5">{mod.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
