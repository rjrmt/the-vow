"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/context/SessionContext";
import { useVowThread } from "@/context/VowThreadContext";
import type { PulseSyncPayload, RealtimeMessage } from "@/types";

const HOLD_DURATION_MS = 3000;
const SYNC_RATE = 8; // 5-10Hz as requested

export default function PulseSyncModule() {
  const { realtime } = useSession();
  const { contribute, completeModule, data } = useVowThread();
  const [phase, setPhase] = useState<"idle" | "hold" | "release">("idle");
  const [score, setScore] = useState(data.pulseSyncScore);
  const [remotePhase, setRemotePhase] = useState<"hold" | "release" | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setScore(data.pulseSyncScore);
  }, [data.pulseSyncScore]);

  useEffect(() => {
    if (!realtime) return;
    const unsub = realtime.subscribe((msg: RealtimeMessage) => {
      if (msg.type === "sync") {
        setRemotePhase(msg.payload.phase);
      }
    });
    return unsub;
  }, [realtime]);

  const sendSync = useCallback(
    (p: PulseSyncPayload) => {
      realtime?.send({ type: "sync", payload: p });
    },
    [realtime]
  );

  const startHold = useCallback(() => {
    setPhase("hold");
    setProgress(0);
    sendSync({ phase: "hold", timestamp: Date.now() });
  }, [sendSync]);

  useEffect(() => {
    if (phase === "hold") {
      const start = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - start;
        setProgress(Math.min((elapsed / HOLD_DURATION_MS) * 100, 100));
      }, 1000 / SYNC_RATE);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setPhase("release");
        sendSync({ phase: "release", timestamp: Date.now() });
        setScore((s) => {
          const next = s + 1;
          contribute("pulse-sync", { pulseSyncScore: next });
          return next;
        });
      }, HOLD_DURATION_MS);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
    if (phase === "release") {
      const t = setTimeout(() => setPhase("idle"), 800);
      return () => clearTimeout(t);
    }
  }, [phase, sendSync]);

  return (
    <div className="py-4 space-y-6">
      <h1 className="text-xl font-bold">Pulse Sync</h1>
      <p className="text-muted text-sm">
        Hold together. Synced at {SYNC_RATE}Hz.
      </p>

      <div className="flex flex-col items-center gap-8">
        <motion.div
          className="w-48 h-48 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer select-none"
          animate={{
            scale: phase === "hold" ? [1, 1.05, 1] : 1,
            opacity: phase === "hold" ? 0.9 : 1,
          }}
          transition={{ duration: 0.5, repeat: phase === "hold" ? Infinity : 0 }}
          onClick={phase === "idle" ? startHold : undefined}
        >
          {phase === "idle" && (
            <span className="text-lg font-medium">Tap to hold</span>
          )}
          {phase === "hold" && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30"
              initial={{ scale: 0 }}
              animate={{ scale: progress / 100 }}
              style={{ transformOrigin: "center" }}
            />
          )}
          {phase === "release" && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl"
            >
              ✓
            </motion.span>
          )}
        </motion.div>

        {remotePhase && (
          <p className="text-sm text-muted">Partner: {remotePhase}</p>
        )}
        {score > 0 && (
          <p className="text-sm font-medium">Syncs: {score}</p>
        )}
      </div>
      <button
        onClick={() => completeModule("pulse-sync")}
        className="text-sm text-primary underline mt-4"
      >
        Done with Pulse
      </button>
    </div>
  );
}
