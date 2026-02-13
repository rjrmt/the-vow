import type {
  RealtimeMessage,
  StrokePayload,
  PulseSyncPayload,
  MemoryReorderPayload,
  OrbRevealPayload,
  VowContributionPayload,
  ModuleCompletePayload,
} from "@/types";

const MAX_POINTS_PER_STROKE = 500;
const MAX_STROKE_WIDTH = 20;
const COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

function isValidStroke(p: unknown): p is StrokePayload {
  if (!p || typeof p !== "object") return false;
  const payload = p as Record<string, unknown>;
  if (!Array.isArray(payload.points)) return false;
  if (payload.points.length > MAX_POINTS_PER_STROKE) return false;
  for (const pt of payload.points) {
    if (
      typeof pt !== "object" ||
      pt === null ||
      typeof (pt as { x?: unknown }).x !== "number" ||
      typeof (pt as { y?: unknown }).y !== "number"
    )
      return false;
  }
  if (typeof payload.color !== "string" || !COLOR_REGEX.test(payload.color))
    return false;
  if (typeof payload.width !== "number" || payload.width < 1 || payload.width > MAX_STROKE_WIDTH)
    return false;
  if (typeof payload.userId !== "string") return false;
  return true;
}

function isValidPulseSync(p: unknown): p is PulseSyncPayload {
  if (!p || typeof p !== "object") return false;
  const payload = p as Record<string, unknown>;
  return (
    (payload.phase === "hold" || payload.phase === "release") &&
    typeof payload.timestamp === "number"
  );
}

function isValidMemoryReorder(p: unknown): p is MemoryReorderPayload {
  if (!p || typeof p !== "object") return false;
  const payload = p as Record<string, unknown>;
  return Array.isArray(payload.itemIds) && payload.itemIds.every((id) => typeof id === "string");
}

function isValidOrbReveal(p: unknown): p is OrbRevealPayload {
  if (!p || typeof p !== "object") return false;
  const payload = p as Record<string, unknown>;
  return (
    typeof payload.orbId === "string" &&
    typeof payload.text === "string" &&
    payload.text.length <= 200
  );
}

function isValidHeartbeat(p: unknown): boolean {
  if (!p || typeof p !== "object") return false;
  return typeof (p as Record<string, unknown>).timestamp === "number";
}

const ALLOWED_MODULES = new Set([
  "dopamine-deck",
  "pulse-sync",
  "memory-loom",
  "affirmation-orbit",
  "coop-canvas",
]);

function isValidVowContribution(p: unknown): p is VowContributionPayload {
  if (!p || typeof p !== "object") return false;
  const payload = p as Record<string, unknown>;
  if (typeof payload.module !== "string" || !ALLOWED_MODULES.has(payload.module))
    return false;
  if (!payload.data || typeof payload.data !== "object") return false;
  const d = payload.data as Record<string, unknown>;
  if (d.challengesAccepted !== undefined && !Array.isArray(d.challengesAccepted)) return false;
  if (d.pulseSyncScore !== undefined && typeof d.pulseSyncScore !== "number") return false;
  if (d.memoryTimeline !== undefined && !Array.isArray(d.memoryTimeline)) return false;
  if (d.affirmations !== undefined && !Array.isArray(d.affirmations)) return false;
  if (d.canvasImageURL !== undefined && typeof d.canvasImageURL !== "string") return false;
  return true;
}

function isValidModuleComplete(p: unknown): p is ModuleCompletePayload {
  if (!p || typeof p !== "object") return false;
  const payload = p as Record<string, unknown>;
  return (
    typeof payload.module === "string" &&
    ALLOWED_MODULES.has(payload.module) &&
    typeof payload.completedAt === "number"
  );
}

export function validateRealtimeMessage(raw: unknown): RealtimeMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const msg = raw as Record<string, unknown>;
  const type = msg.type;
  if (typeof type !== "string") return null;

  switch (type) {
    case "sync":
      const syncPayload = msg.payload;
      if (!isValidPulseSync(syncPayload)) return null;
      return { type: "sync", payload: syncPayload };
    case "stroke":
      const strokePayload = msg.payload;
      if (!isValidStroke(strokePayload)) return null;
      return { type: "stroke", payload: strokePayload };
    case "orb_reveal":
      const orbPayload = msg.payload;
      if (!isValidOrbReveal(orbPayload)) return null;
      return { type: "orb_reveal", payload: orbPayload };
    case "canvas_clear":
      return { type: "canvas_clear", payload: {} };
    case "memory_reorder":
      const memPayload = msg.payload;
      if (!isValidMemoryReorder(memPayload)) return null;
      return { type: "memory_reorder", payload: memPayload };
    case "heartbeat":
      const hbPayload = msg.payload;
      if (!isValidHeartbeat(hbPayload)) return null;
      return { type: "heartbeat", payload: hbPayload as { timestamp: number } };
    case "snapshot_request":
      return { type: "snapshot_request", payload: {} };
    case "vow_contribution":
      const vcPayload = msg.payload;
      if (!isValidVowContribution(vcPayload)) return null;
      return { type: "vow_contribution", payload: vcPayload };
    case "module_complete":
      const mcPayload = msg.payload;
      if (!isValidModuleComplete(mcPayload)) return null;
      return { type: "module_complete", payload: mcPayload };
    default:
      return null;
  }
}
