"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useSession } from "@/context/SessionContext";
import { selectVowCard } from "@/lib/vow-selector";
import type { VowThreadData, VowCard } from "@/types";

interface VowThreadContextValue {
  data: VowThreadData;
  vowCard: VowCard | null;
  contribute: (module: string, data: Partial<VowThreadData>) => void;
  completeModule: (module: string) => void;
  modulesCompleted: string[];
}

const INITIAL: VowThreadData = {
  challengesAccepted: [],
  pulseSyncScore: 0,
  memoryTimeline: [],
  affirmations: [],
};

const VowThreadContext = createContext<VowThreadContextValue | null>(null);

export function VowThreadProvider({ children }: { children: React.ReactNode }) {
  const { session, realtime } = useSession();
  const [data, setData] = useState<VowThreadData>(INITIAL);
  const [modulesCompleted, setModulesCompleted] = useState<string[]>([]);

  useEffect(() => {
    if (!realtime) return;
    const unsub = realtime.subscribe((msg) => {
      if (msg.type === "snapshot") {
        setData(msg.payload.vowThread ?? INITIAL);
      }
      if (msg.type === "vow_contribution") {
        setData((prev) => ({
          challengesAccepted: msg.payload.data.challengesAccepted ?? prev.challengesAccepted,
          pulseSyncScore: msg.payload.data.pulseSyncScore ?? prev.pulseSyncScore,
          memoryTimeline: msg.payload.data.memoryTimeline ?? prev.memoryTimeline,
          affirmations: msg.payload.data.affirmations ?? prev.affirmations,
          canvasImageURL: msg.payload.data.canvasImageURL ?? prev.canvasImageURL,
        }));
      }
      if (msg.type === "module_complete") {
        setModulesCompleted((prev) =>
          prev.includes(msg.payload.module) ? prev : [...prev, msg.payload.module]
        );
      }
    });
    return unsub;
  }, [realtime]);

  const contribute = useCallback(
    (module: string, contribution: Partial<VowThreadData>) => {
      realtime?.send({ type: "vow_contribution", payload: { module, data: contribution } });
      setData((prev) => ({
        challengesAccepted: contribution.challengesAccepted ?? prev.challengesAccepted,
        pulseSyncScore: contribution.pulseSyncScore ?? prev.pulseSyncScore,
        memoryTimeline: contribution.memoryTimeline ?? prev.memoryTimeline,
        affirmations: contribution.affirmations ?? prev.affirmations,
        canvasImageURL: contribution.canvasImageURL ?? prev.canvasImageURL,
      }));
    },
    [realtime]
  );

  const completeModule = useCallback(
    (module: string) => {
      realtime?.send({
        type: "module_complete",
        payload: { module, completedAt: Date.now() },
      });
      setModulesCompleted((prev) =>
        prev.includes(module) ? prev : [...prev, module]
      );
    },
    [realtime]
  );

  const vowCard = useMemo(() => {
    if (!session) return null;
    return selectVowCard(session.id, session.code, data);
  }, [session, data]);

  const value = useMemo(
    () => ({
      data,
      vowCard,
      contribute,
      completeModule,
      modulesCompleted,
    }),
    [data, vowCard, contribute, completeModule, modulesCompleted]
  );

  return (
    <VowThreadContext.Provider value={value}>
      {children}
    </VowThreadContext.Provider>
  );
}

export function useVowThread() {
  const ctx = useContext(VowThreadContext);
  if (!ctx) throw new Error("useVowThread must be used within VowThreadProvider");
  return ctx;
}
