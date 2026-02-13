"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/lib/haptics";
import { useVowThread } from "@/context/VowThreadContext";

const ORBS = [
  { id: "1", text: "You are enough." },
  { id: "2", text: "Today is a fresh start." },
  { id: "3", text: "Progress over perfection." },
  { id: "4", text: "Breathe. You've got this." },
  { id: "5", text: "One step at a time." },
];

function useDeviceOrientation() {
  const [enabled, setEnabled] = useState(false);
  const [beta, setBeta] = useState(0);
  const [gamma, setGamma] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta != null) setBeta(e.beta);
      if (e.gamma != null) setGamma(e.gamma);
    };
    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      if (
        typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function"
      ) {
        const result = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission();
        setEnabled(result === "granted");
        return result === "granted";
      }
      setEnabled(true);
      return true;
    } catch {
      setEnabled(false);
      return false;
    }
  }, []);

  return { enabled, beta, gamma, requestPermission };
}

export default function AffirmationOrbitModule() {
  const { contribute, completeModule } = useVowThread();
  const [revealed, setRevealed] = useState<string | null>(null);
  const [affirmations, setAffirmations] = useState<string[]>([]);
  const [useGyro, setUseGyro] = useState(false);
  const { enabled, beta, gamma, requestPermission } = useDeviceOrientation();
  const dragRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setUseGyro(enabled);
  }, [enabled]);

  const handleTap = useCallback(
    (id: string) => {
      triggerHaptic("light");
      const orb = ORBS.find((o) => o.id === id);
      if (!orb) return;
      setRevealed((prev) => (prev === id ? null : id));
      setAffirmations((prev) => {
        const next = prev.includes(orb.text) ? prev : [...prev, orb.text];
        contribute("affirmation-orbit", { affirmations: next });
        return next;
      });
    },
    [contribute]
  );

  const offsetX = useGyro ? gamma * 2 : dragRef.current.x;
  const offsetY = useGyro ? beta * 2 : dragRef.current.y;

  return (
    <div className="py-4 space-y-6">
      <h1 className="text-xl font-bold">Affirmation Orbit</h1>
      <p className="text-muted text-sm">Tap orbs to reveal. Tilt or drag to move.</p>

      <div className="flex gap-2">
        {!enabled && (
          <button
            onClick={async () => {
              const ok = await requestPermission();
              if (!ok) {
                // Fallback: enable drag mode
                setUseGyro(false);
              }
            }}
            className="px-3 py-1.5 text-sm rounded-[var(--radius-sm)] bg-primary/20 text-primary"
          >
            Enable Tilt
          </button>
        )}
        <button
          onClick={() => setUseGyro(!useGyro)}
          className="px-3 py-1.5 text-sm rounded-[var(--radius-sm)] bg-surface-elevated border border-border"
        >
          {useGyro ? "Tilt mode" : "Drag mode"}
        </button>
      </div>

      <div
        className="relative h-72 flex items-center justify-center overflow-hidden"
        style={{
          transform: `perspective(500px) rotateX(${offsetY}deg) rotateY(${offsetX}deg)`,
        }}
      >
        {ORBS.map((orb, i) => {
          const angle = (i / ORBS.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 80;
          const x = Math.cos(angle) * radius + 50;
          const y = Math.sin(angle) * radius + 50;
          const isRevealed = revealed === orb.id;

          return (
            <motion.div
              key={orb.id}
              className="absolute w-14 h-14 rounded-full bg-primary/30 border-2 border-primary/50
                flex items-center justify-center cursor-pointer touch-manipulation
                select-none"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                y: [0, -4, 0],
              }}
              transition={{
                scale: { delay: i * 0.1 },
                y: { duration: 2, repeat: Infinity, delay: i * 0.2 },
              }}
              onClick={() => handleTap(orb.id)}
            >
              <AnimatePresence mode="wait">
                {isRevealed ? (
                  <motion.span
                    key="text"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-medium text-center px-1 leading-tight"
                  >
                    {orb.text}
                  </motion.span>
                ) : (
                  <motion.span
                    key="dot"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    •
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
      <button
        onClick={() => completeModule("affirmation-orbit")}
        className="text-sm text-primary underline mt-4"
      >
        Done with affirmations
      </button>
    </div>
  );
}
