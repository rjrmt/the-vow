/**
 * Core types for The Vow app
 */

export type SessionRole = "host" | "participant";

export interface Session {
  id: string;
  code: string;
  role: SessionRole;
  participants: string[];
  createdAt: number;
  expiresAt: number;
}

export interface VowThreadData {
  challengesAccepted: string[];
  pulseSyncScore: number;
  memoryTimeline: Array<{ id: string; order: number; label?: string; time?: string }>;
  affirmations: string[];
  canvasImageURL?: string;
}

export interface VowCard {
  sessionId: string;
  sessionCode: string;
  challengesAccepted: string[];
  pulseSyncScore: number;
  memoryTimeline: Array<{ id: string; order: number; label?: string; time?: string }>;
  affirmations: string[];
  canvasImageURL?: string;
  completedAt?: number;
}

export interface VowThread {
  id: string;
  sessionId: string;
  data: VowThreadData;
  modulesCompleted: string[];
  completedAt?: number;
}

export interface Challenge {
  id: string;
  type: string;
  payload: unknown;
  expiresAt: number;
}

export type RealtimeMessage =
  | { type: "sync"; payload: PulseSyncPayload }
  | { type: "stroke"; payload: StrokePayload }
  | { type: "orb_reveal"; payload: OrbRevealPayload }
  | { type: "canvas_clear"; payload: Record<string, never> }
  | { type: "participant_join"; payload: ParticipantPayload }
  | { type: "participant_leave"; payload: ParticipantPayload }
  | { type: "memory_reorder"; payload: MemoryReorderPayload }
  | { type: "heartbeat"; payload: { timestamp: number } }
  | { type: "snapshot_request"; payload: Record<string, never> }
  | { type: "snapshot"; payload: SnapshotPayload }
  | { type: "vow_contribution"; payload: VowContributionPayload }
  | { type: "module_complete"; payload: ModuleCompletePayload };

export interface PulseSyncPayload {
  phase: "hold" | "release";
  timestamp: number;
}

export interface StrokePayload {
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
  userId: string;
}

export interface OrbRevealPayload {
  orbId: string;
  text: string;
}

export interface ParticipantPayload {
  userId: string;
  displayName?: string;
}

export interface MemoryReorderPayload {
  itemIds: string[];
  items?: Array<{ id: string; label: string; time: string }>;
}

export interface SnapshotPayload {
  version: number;
  sessionId: string;
  vowThread: VowThreadData;
  strokes: Array<{ points: Array<{ x: number; y: number }>; color: string; width: number }>;
  memoryItems: Array<{ id: string; order: number; label?: string; time?: string }>;
}

export interface VowContributionPayload {
  module: string;
  data: Partial<VowThreadData>;
}

export interface ModuleCompletePayload {
  module: string;
  completedAt: number;
}
