"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/context/SessionContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function SessionGate({ children }: { children: React.ReactNode }) {
  const { session, status, error, createSession, joinSession } = useSession();
  const [joinCode, setJoinCode] = useState("");

  if (session) return <>{children}</>;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length >= 4) joinSession(code);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">The Vow</h1>
          <p className="text-muted mt-1">Create or join a session to begin</p>
        </div>

        <Card className="p-6 space-y-4">
          <Button
            onClick={createSession}
            disabled={status === "creating"}
            className="w-full"
          >
            {status === "creating" ? "Creating…" : "Create Session"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface px-2 text-muted">or</span>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 8))}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-2.5 rounded-[var(--radius)] border border-border bg-background
                text-center text-lg tracking-[0.3em] font-mono
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              maxLength={8}
              aria-label="Session code"
            />
            <Button
              type="submit"
              variant="secondary"
              disabled={status === "joining" || joinCode.length < 4}
              className="w-full"
            >
              {status === "joining" ? "Joining…" : "Join Session"}
            </Button>
          </form>
        </Card>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-danger text-sm text-center"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
