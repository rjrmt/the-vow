import type { VowThreadData, VowCard } from "@/types";

const MEMORY_LABELS: Record<string, string> = {
  "1": "Morning coffee",
  "2": "Check messages",
  "3": "Deep work",
  "4": "Lunch break",
  "5": "Afternoon meetings",
};

export function selectVowCard(
  sessionId: string,
  sessionCode: string,
  data: VowThreadData,
  completedAt?: number
): VowCard {
  return {
    sessionId,
    sessionCode,
    challengesAccepted: data.challengesAccepted ?? [],
    pulseSyncScore: data.pulseSyncScore ?? 0,
    memoryTimeline: (data.memoryTimeline ?? []).map((item) => ({
      id: item.id,
      order: item.order,
      label: (item as { label?: string }).label ?? MEMORY_LABELS[item.id],
      time: (item as { time?: string }).time,
    })),
    affirmations: data.affirmations ?? [],
    canvasImageURL: data.canvasImageURL,
    completedAt,
  };
}

export function mergeVowContributions(
  current: VowThreadData,
  contribution: Partial<VowThreadData>
): VowThreadData {
  return {
    challengesAccepted: contribution.challengesAccepted ?? current.challengesAccepted,
    pulseSyncScore: contribution.pulseSyncScore ?? current.pulseSyncScore,
    memoryTimeline: contribution.memoryTimeline ?? current.memoryTimeline,
    affirmations: contribution.affirmations ?? current.affirmations,
    canvasImageURL: contribution.canvasImageURL ?? current.canvasImageURL,
  };
}
