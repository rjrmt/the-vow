"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { triggerHaptic } from "@/lib/haptics";
import { useVowThread } from "@/context/VowThreadContext";

async function fireConfetti() {
  const confetti = (await import("canvas-confetti")).default;
  confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
}

const CARDS = [
  "Take a 5-minute walk",
  "Drink a glass of water",
  "Text a friend",
  "Stretch for 2 minutes",
  "Write one thing you're grateful for",
  "Do 10 squats",
  "Listen to one song",
  "Tidy one surface",
];

type SwipeDirection = "left" | "right" | null;

export default function DopamineDeckModule() {
  const { contribute, completeModule } = useVowThread();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<SwipeDirection>(null);
  const [accepted, setAccepted] = useState<string[]>([]);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -50, 0, 50, 200], [0.5, 1, 1, 1, 0.5]);

  const handleAccept = useCallback(() => {
    const card = CARDS[index];
    setAccepted((prev) => {
      const next = [...prev, card];
      contribute("dopamine-deck", { challengesAccepted: next });
      return next;
    });
    setDirection("right");
    triggerHaptic("success");
    fireConfetti();
    setTimeout(() => {
      setIndex((i) => Math.min(i + 1, CARDS.length - 1));
      setDirection(null);
      x.set(0);
    }, 300);
  }, [x, index, contribute]);

  const handleSkip = useCallback(() => {
    setDirection("left");
    triggerHaptic("light");
    setTimeout(() => {
      setIndex((i) => Math.min(i + 1, CARDS.length - 1));
      setDirection(null);
      x.set(0);
    }, 300);
  }, [x]);

  const card = CARDS[index];
  const isDone = index >= CARDS.length - 1;

  useEffect(() => {
    if (isDone) completeModule("dopamine-deck");
  }, [isDone, completeModule]);

  return (
    <div className="py-4 space-y-6">
      <h1 className="text-xl font-bold">Dopamine Deck</h1>
      <p className="text-muted text-sm">Swipe right to accept, left to skip</p>

      <div className="relative h-64 flex items-center justify-center touch-none">
        <AnimatePresence mode="wait">
          {!isDone ? (
            <motion.div
              key={index}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={(_, info) => {
                if (info.offset.x > 80) handleAccept();
                else if (info.offset.x < -80) handleSkip();
              }}
              style={{ x, rotate, opacity }}
              className="absolute w-[85%] max-w-sm cursor-grab active:cursor-grabbing"
              whileTap={{ scale: 1.02 }}
            >
              <motion.div
                className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 shadow-lg"
                layout
              >
                <p className="text-lg font-medium text-center">{card}</p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <p className="text-muted">All done!</p>
              <button
                onClick={() => setIndex(0)}
                className="text-primary font-medium underline"
              >
                Start over
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isDone && (
        <div className="flex justify-center gap-8">
          <motion.button
            onClick={handleSkip}
            className="w-14 h-14 rounded-full bg-danger/20 text-danger flex items-center justify-center text-2xl"
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
          <motion.button
            onClick={handleAccept}
            className="w-14 h-14 rounded-full bg-success/20 text-success flex items-center justify-center text-2xl"
            whileTap={{ scale: 0.9 }}
          >
            ✓
          </motion.button>
        </div>
      )}
    </div>
  );
}
