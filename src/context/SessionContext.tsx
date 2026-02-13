"use client";

import React, { createContext, useContext, useCallback, useMemo, useState, useRef } from "react";
import type { Session } from "@/types";
import { RealtimeClient } from "@/lib/realtime-client";

type SessionStatus = "idle" | "creating" | "joining" | "active" | "error";

interface SessionContextValue {
  session: Session | null;
  status: SessionStatus;
  error: string | null;
  createSession: () => Promise<void>;
  joinSession: (code: string) => Promise<void>;
  leaveSession: () => void;
  realtime: RealtimeClient | null;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getWsBase(): string {
  if (typeof window === "undefined") return "ws://localhost:3000";
  return `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [status, setStatus] = React.useState<SessionStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [realtime, setRealtime] = useState<RealtimeClient | null>(null);
  const realtimeRef = useRef<RealtimeClient | null>(null);
  realtimeRef.current = realtime;

  const leaveSession = useCallback(() => {
    realtimeRef.current?.disconnect();
    realtimeRef.current = null;
    setRealtime(null);
    setSession(null);
    setStatus("idle");
    setError(null);
  }, []);

  const createSession = useCallback(async () => {
    setStatus("creating");
    setError(null);
    try {
      const id = crypto.randomUUID();
      const code = generateCode();
      const res = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, code }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Failed to create session");
      }
      const data = (await res.json()) as { session: Session };
      setSession(data.session);
      setStatus("active");

      const wsUrl = `${getWsBase()}/api/realtime?session=${id}&code=${code}`;
      const client = new RealtimeClient(wsUrl, id, code);
      client.connect();
      setRealtime(client);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create session");
      setStatus("error");
    }
  }, []);

  const joinSession = useCallback(async (code: string) => {
    setStatus("joining");
    setError(null);
    try {
      const res = await fetch("/api/session/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase().trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Invalid session code");
      }
      const data = (await res.json()) as { session: Session };
      setSession(data.session);
      setStatus("active");

      const wsUrl = `${getWsBase()}/api/realtime?session=${data.session.id}&code=${data.session.code}`;
      const client = new RealtimeClient(wsUrl, data.session.id, data.session.code);
      client.connect();
      setRealtime(client);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to join session");
      setStatus("error");
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      status,
      error,
      createSession,
      joinSession,
      leaveSession,
      realtime,
    }),
    [session, status, error, createSession, joinSession, leaveSession, realtime]
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
