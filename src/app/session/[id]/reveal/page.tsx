"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import type { VowCard } from "@/types";

const MEMORY_LABELS: Record<string, string> = {
  "1": "Morning coffee",
  "2": "Check messages",
  "3": "Deep work",
  "4": "Lunch break",
  "5": "Afternoon meetings",
};

export default function SessionRevealPage() {
  const params = useParams();
  const id = params?.id as string;
  const [vowCard, setVowCard] = useState<VowCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/session/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Not found" : "Failed to load");
        return res.json();
      })
      .then((data) => {
        setVowCard(data.vowCard);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-12 h-12 rounded-full bg-primary/30"
        />
      </div>
    );
  }

  if (error || !vowCard) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background p-6">
        <p className="text-muted text-center">
          {error === "Not found" ? "Session not found." : error ?? "Could not load."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background p-6 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto space-y-6"
      >
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 shadow-lg space-y-6">
          <div className="text-center">
            <p className="text-muted text-sm">Session {vowCard.sessionCode}</p>
            <h1 className="text-2xl font-bold mt-1">The Vow</h1>
          </div>

          {vowCard.challengesAccepted.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted uppercase mb-2">
                Challenges Accepted
              </h2>
              <ul className="space-y-1">
                {vowCard.challengesAccepted.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </section>
          )}

          {vowCard.pulseSyncScore > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted uppercase mb-2">
                Pulse Sync
              </h2>
              <p className="text-lg font-medium">{vowCard.pulseSyncScore} syncs</p>
            </section>
          )}

          {vowCard.memoryTimeline.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted uppercase mb-2">
                Timeline
              </h2>
              <ol className="space-y-1">
                {vowCard.memoryTimeline
                  .sort((a, b) => a.order - b.order)
                  .map((item, i) => (
                    <li key={item.id}>
                      {i + 1}. {item.label ?? MEMORY_LABELS[item.id] ?? item.id}
                    </li>
                  ))}
              </ol>
            </section>
          )}

          {vowCard.affirmations.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted uppercase mb-2">
                Affirmations
              </h2>
              <ul className="space-y-1">
                {vowCard.affirmations.map((a, i) => (
                  <li key={i}>&ldquo;{a}&rdquo;</li>
                ))}
              </ul>
            </section>
          )}

          {vowCard.canvasImageURL && (
            <section>
              <h2 className="text-sm font-semibold text-muted uppercase mb-2">
                Canvas
              </h2>
              <img
                src={vowCard.canvasImageURL}
                alt="Co-op canvas"
                className="w-full rounded-[var(--radius)] border border-border"
              />
            </section>
          )}
        </div>

        <p className="text-center text-muted text-sm">
          Share this link to view the Vow Card
        </p>
      </motion.div>
    </div>
  );
}
