const MAX_POINTS_PER_STROKE = 500;
const MAX_STROKE_WIDTH = 20;
const COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const ALLOWED_MODULES = new Set([
  "dopamine-deck",
  "pulse-sync",
  "memory-loom",
  "affirmation-orbit",
  "coop-canvas",
]);

function isValidStroke(p) {
  if (!p || typeof p !== "object") return false;
  if (!Array.isArray(p.points) || p.points.length > MAX_POINTS_PER_STROKE) return false;
  for (const pt of p.points) {
    if (typeof pt !== "object" || pt === null || typeof pt.x !== "number" || typeof pt.y !== "number")
      return false;
  }
  if (typeof p.color !== "string" || !COLOR_REGEX.test(p.color)) return false;
  if (typeof p.width !== "number" || p.width < 1 || p.width > MAX_STROKE_WIDTH) return false;
  if (typeof p.userId !== "string") return false;
  return true;
}

function isValidPulseSync(p) {
  if (!p || typeof p !== "object") return false;
  return (p.phase === "hold" || p.phase === "release") && typeof p.timestamp === "number";
}

function isValidMemoryReorder(p) {
  if (!p || typeof p !== "object") return false;
  return Array.isArray(p.itemIds) && p.itemIds.every((id) => typeof id === "string");
}

function isValidOrbReveal(p) {
  if (!p || typeof p !== "object") return false;
  return typeof p.orbId === "string" && typeof p.text === "string" && p.text.length <= 200;
}

function isValidHeartbeat(p) {
  if (!p || typeof p !== "object") return false;
  return typeof p.timestamp === "number";
}

function isValidVowContribution(p) {
  if (!p || typeof p !== "object") return false;
  if (typeof p.module !== "string" || !ALLOWED_MODULES.has(p.module)) return false;
  if (!p.data || typeof p.data !== "object") return false;
  const d = p.data;
  if (d.challengesAccepted !== undefined && !Array.isArray(d.challengesAccepted)) return false;
  if (d.pulseSyncScore !== undefined && typeof d.pulseSyncScore !== "number") return false;
  if (d.memoryTimeline !== undefined && !Array.isArray(d.memoryTimeline)) return false;
  if (d.affirmations !== undefined && !Array.isArray(d.affirmations)) return false;
  if (d.canvasImageURL !== undefined && typeof d.canvasImageURL !== "string") return false;
  return true;
}

function isValidModuleComplete(p) {
  if (!p || typeof p !== "object") return false;
  return (
    typeof p.module === "string" &&
    ALLOWED_MODULES.has(p.module) &&
    typeof p.completedAt === "number"
  );
}

function validateRealtimeMessage(raw) {
  if (!raw || typeof raw !== "object") return null;
  const msg = raw;
  const type = msg.type;
  if (typeof type !== "string") return null;

  switch (type) {
    case "sync":
      if (!isValidPulseSync(msg.payload)) return null;
      return { type: "sync", payload: msg.payload };
    case "stroke":
      if (!isValidStroke(msg.payload)) return null;
      return { type: "stroke", payload: msg.payload };
    case "orb_reveal":
      if (!isValidOrbReveal(msg.payload)) return null;
      return { type: "orb_reveal", payload: msg.payload };
    case "canvas_clear":
      return { type: "canvas_clear", payload: {} };
    case "memory_reorder":
      if (!isValidMemoryReorder(msg.payload)) return null;
      return { type: "memory_reorder", payload: msg.payload };
    case "heartbeat":
      if (!isValidHeartbeat(msg.payload)) return null;
      return { type: "heartbeat", payload: msg.payload };
    case "snapshot_request":
      return { type: "snapshot_request", payload: {} };
    case "vow_contribution":
      if (!isValidVowContribution(msg.payload)) return null;
      return { type: "vow_contribution", payload: msg.payload };
    case "module_complete":
      if (!isValidModuleComplete(msg.payload)) return null;
      return { type: "module_complete", payload: msg.payload };
    default:
      return null;
  }
}

module.exports = { validateRealtimeMessage };
