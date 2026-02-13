"use client";

import React, { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { useSession } from "@/context/SessionContext";
import { useVowThread } from "@/context/VowThreadContext";
import { Button } from "@/components/ui/Button";

const MEMORY_LABELS: Record<string, string> = {
  "1": "Morning coffee",
  "2": "Check messages",
  "3": "Deep work",
  "4": "Lunch break",
  "5": "Afternoon meetings",
};

export default function RevealModule() {
  const { session } = useSession();
  const { vowCard } = useVowThread();
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const url = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "var(--background)",
      });
      const link = document.createElement("a");
      link.download = `the-vow-${session?.code ?? "vow"}.png`;
      link.href = url;
      link.click();
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setDownloading(false);
    }
  }, [session?.code]);

  const shareUrl =
    typeof window !== "undefined" && session
      ? `${window.location.origin}/session/${session.id}/reveal`
      : "";

  if (!vowCard) {
    return (
      <div className="py-8 text-center text-muted">
        Complete modules to see your Vow Card.
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      <h1 className="text-xl font-bold">Your Vow Card</h1>

      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 shadow-lg space-y-6"
      >
        <div className="text-center">
          <p className="text-muted text-sm">Session {vowCard.sessionCode}</p>
          <h2 className="text-2xl font-bold mt-1">The Vow</h2>
        </div>

        {vowCard.challengesAccepted.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-muted uppercase mb-2">
              Challenges Accepted
            </h3>
            <ul className="space-y-1">
              {vowCard.challengesAccepted.map((c, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  • {c}
                </motion.li>
              ))}
            </ul>
          </section>
        )}

        {vowCard.pulseSyncScore > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-muted uppercase mb-2">
              Pulse Sync
            </h3>
            <p className="text-lg font-medium">{vowCard.pulseSyncScore} syncs</p>
          </section>
        )}

        {vowCard.memoryTimeline.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-muted uppercase mb-2">
              Timeline
            </h3>
            <ol className="space-y-1">
              {vowCard.memoryTimeline
                .sort((a, b) => a.order - b.order)
                .map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {i + 1}. {item.label ?? MEMORY_LABELS[item.id] ?? item.id}
                  </motion.li>
                ))}
            </ol>
          </section>
        )}

        {vowCard.affirmations.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-muted uppercase mb-2">
              Affirmations
            </h3>
            <ul className="space-y-1">
              {vowCard.affirmations.map((a, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  &ldquo;{a}&rdquo;
                </motion.li>
              ))}
            </ul>
          </section>
        )}

        {vowCard.canvasImageURL && (
          <section>
            <h3 className="text-sm font-semibold text-muted uppercase mb-2">
              Canvas
            </h3>
            <img
              src={vowCard.canvasImageURL}
              alt="Co-op canvas"
              className="w-full rounded-[var(--radius)] border border-border"
            />
          </section>
        )}
      </motion.div>

      <div className="flex flex-col gap-2">
        <Button onClick={handleDownload} disabled={downloading}>
          {downloading ? "Downloading…" : "Download PNG"}
        </Button>
        {shareUrl && (
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 text-sm rounded-[var(--radius)] border border-border bg-background"
            />
            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard?.writeText(shareUrl);
              }}
            >
              Copy Link
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
