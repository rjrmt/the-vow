/**
 * WebSocket handler with Prisma, validation, snapshot, and heartbeat
 */
const { prisma } = require("./db");
const { validateRealtimeMessage } = require("./validation");
const { logger } = require("./logger");
const { mergeVowContributions } = require("./vow-merge");

const HEARTBEAT_INTERVAL_MS = 15000;
const HEARTBEAT_TIMEOUT_MS = 20000;
const THROTTLE_STROKE_MS = 100;
const SESSION_EXPIRY_HOURS = 24;

const sessions = new Map(); // sessionId -> Set<ws>
const lastStrokeTime = new Map(); // wsId -> timestamp

function isExpired(expiresAt) {
  return new Date() > new Date(expiresAt);
}

async function getOrCreateRealtimeState(sessionId) {
  let state = await prisma.realtimeState.findUnique({
    where: { sessionId },
  });
  if (!state) {
    state = await prisma.realtimeState.create({
      data: {
        sessionId,
        version: 0,
        payload: JSON.stringify({
          challengesAccepted: [],
          pulseSyncScore: 0,
          memoryTimeline: [],
          affirmations: [],
          canvasImageURL: null,
        }),
        strokes: "[]",
        memoryItems: "[]",
      },
    });
  }
  return state;
}

async function broadcastToSession(sessionId, message, excludeWs = null) {
  const clients = sessions.get(sessionId);
  if (!clients) return;
  const data = JSON.stringify(message);
  for (const ws of clients) {
    if (ws !== excludeWs && ws.readyState === 1) {
      ws.send(data);
    }
  }
}

async function handleSnapshotRequest(ws, sessionId, code) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { vowThread: true, realtimeState: true },
    });
    if (!session || isExpired(session.expiresAt)) {
      ws.send(JSON.stringify({ type: "error", payload: { code: "SESSION_EXPIRED" } }));
      return;
    }

    let state = session.realtimeState;
    if (!state) {
      state = await getOrCreateRealtimeState(sessionId);
    }

    const vowData = JSON.parse(state.payload || "{}");
    const strokes = JSON.parse(state.strokes || "[]");
    const memoryItems = JSON.parse(state.memoryItems || "[]");

    const vowThread = session.vowThread
      ? {
          challengesAccepted: JSON.parse(session.vowThread.challengesAccepted || "[]"),
          pulseSyncScore: session.vowThread.pulseSyncScore || 0,
          memoryTimeline: JSON.parse(session.vowThread.memoryTimeline || "[]"),
          affirmations: JSON.parse(session.vowThread.affirmations || "[]"),
          canvasImageURL: session.vowThread.canvasImageURL,
        }
      : vowData;

    ws.send(
      JSON.stringify({
        type: "snapshot",
        payload: {
          version: state.version,
          sessionId,
          vowThread,
          strokes,
          memoryItems,
        },
      })
    );
    logger.info("Snapshot sent", { sessionId, version: state.version });
  } catch (err) {
    logger.error("Snapshot error", { sessionId, error: err.message });
    ws.send(JSON.stringify({ type: "error", payload: { code: "SNAPSHOT_FAILED" } }));
  }
}

async function handleVowContribution(sessionId, payload) {
  const { module: mod, data } = payload;
  const state = await getOrCreateRealtimeState(sessionId);
  const current = JSON.parse(state.payload || "{}");
  const merged = mergeVowContributions(current, data);
  await prisma.realtimeState.update({
    where: { sessionId },
    data: {
      payload: JSON.stringify(merged),
      version: state.version + 1,
    },
  });
  const vt = await prisma.vowThread.findUnique({ where: { sessionId } });
  const existing = vt
    ? {
        challengesAccepted: JSON.parse(vt.challengesAccepted || "[]"),
        pulseSyncScore: vt.pulseSyncScore || 0,
        memoryTimeline: JSON.parse(vt.memoryTimeline || "[]"),
        affirmations: JSON.parse(vt.affirmations || "[]"),
        canvasImageURL: vt.canvasImageURL,
      }
    : {};
  const mergedForVt = mergeVowContributions(existing, data);
  await prisma.vowThread.upsert({
    where: { sessionId },
    create: {
      sessionId,
      challengesAccepted: JSON.stringify(mergedForVt.challengesAccepted || []),
      pulseSyncScore: mergedForVt.pulseSyncScore || 0,
      memoryTimeline: JSON.stringify(mergedForVt.memoryTimeline || []),
      affirmations: JSON.stringify(mergedForVt.affirmations || []),
      canvasImageURL: mergedForVt.canvasImageURL,
      modulesCompleted: JSON.stringify([]),
    },
    update: {
      challengesAccepted: JSON.stringify(mergedForVt.challengesAccepted || []),
      pulseSyncScore: mergedForVt.pulseSyncScore || 0,
      memoryTimeline: JSON.stringify(mergedForVt.memoryTimeline || []),
      affirmations: JSON.stringify(mergedForVt.affirmations || []),
      canvasImageURL: mergedForVt.canvasImageURL,
    },
  });
  logger.info("Vow contribution", { sessionId, module: mod });
}

async function handleModuleComplete(sessionId, payload) {
  const { module: mod, completedAt } = payload;
  const vt = await prisma.vowThread.findUnique({ where: { sessionId } });
  const completed = vt ? JSON.parse(vt.modulesCompleted || "[]") : [];
  if (!completed.includes(mod)) {
    completed.push(mod);
    await prisma.vowThread.upsert({
      where: { sessionId },
      create: {
        sessionId,
        modulesCompleted: JSON.stringify(completed),
        completedAt: new Date(completedAt),
      },
      update: {
        modulesCompleted: JSON.stringify(completed),
        completedAt: completed.length >= 5 ? new Date(completedAt) : undefined,
      },
    });
    logger.info("Module complete", { sessionId, module: mod });
  }
}

async function handleStroke(sessionId, payload) {
  const state = await getOrCreateRealtimeState(sessionId);
  const strokes = JSON.parse(state.strokes || "[]");
  strokes.push({
    points: payload.points,
    color: payload.color,
    width: payload.width,
  });
  if (strokes.length > 500) strokes.shift();
  await prisma.realtimeState.update({
    where: { sessionId },
    data: { strokes: JSON.stringify(strokes), version: state.version + 1 },
  });
}

async function handleCanvasClear(sessionId) {
  await prisma.realtimeState.update({
    where: { sessionId },
    data: { strokes: "[]" },
  });
}

async function handleMemoryReorder(sessionId, payload) {
  const items = payload.items || payload.itemIds?.map((id, i) => ({ id, order: i })) || [];
  const state = await getOrCreateRealtimeState(sessionId);
  await prisma.realtimeState.update({
    where: { sessionId },
    data: {
      memoryItems: JSON.stringify(items),
      version: state.version + 1,
    },
  });
}

async function handleMessage(ws, sessionId, code, raw) {
  let msg;
  try {
    msg = validateRealtimeMessage(JSON.parse(raw.toString()));
  } catch {
    logger.warn("Invalid JSON message", { sessionId });
    return;
  }
  if (!msg) {
    logger.warn("Validation failed", { sessionId });
    return;
  }

  if (msg.type === "snapshot_request") {
    await handleSnapshotRequest(ws, sessionId, code);
    return;
  }

  if (msg.type === "vow_contribution") {
    await handleVowContribution(sessionId, msg.payload);
    broadcastToSession(sessionId, msg, null);
    return;
  }

  if (msg.type === "module_complete") {
    await handleModuleComplete(sessionId, msg.payload);
    broadcastToSession(sessionId, msg, null);
    return;
  }

  if (msg.type === "stroke") {
    const key = ws.id || ws;
    const now = Date.now();
    const last = lastStrokeTime.get(key) || 0;
    if (now - last < THROTTLE_STROKE_MS) return;
    lastStrokeTime.set(key, now);
    await handleStroke(sessionId, msg.payload);
  }

  if (msg.type === "canvas_clear") {
    await handleCanvasClear(sessionId);
  }

  if (msg.type === "memory_reorder") {
    await handleMemoryReorder(sessionId, msg.payload);
  }

  broadcastToSession(sessionId, msg, null);
}

function setupHeartbeat(ws, sessionId) {
  ws.lastPong = Date.now();
  ws.on("pong", () => {
    ws.lastPong = Date.now();
  });
  const interval = setInterval(() => {
    if (ws.readyState !== 1) {
      clearInterval(interval);
      return;
    }
    if (Date.now() - ws.lastPong > HEARTBEAT_TIMEOUT_MS) {
      logger.warn("Heartbeat timeout", { sessionId });
      ws.terminate();
      clearInterval(interval);
      return;
    }
    ws.ping();
  }, HEARTBEAT_INTERVAL_MS);
  ws.on("close", () => clearInterval(interval));
}

module.exports = {
  async handleUpgrade(wss, request, socket, head) {
    const url = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
    const pathname = url.pathname;
    const searchParams = url.searchParams;
    if (pathname !== "/api/realtime") {
      socket.destroy();
      return;
    }
    const sessionId = searchParams.get("session");
    const code = searchParams.get("code");
    if (!sessionId || !code) {
      socket.destroy();
      return;
    }

    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      });
      if (!session || session.code !== code.toUpperCase()) {
        logger.warn("Invalid session connect", { sessionId });
        socket.destroy();
        return;
      }
      if (isExpired(session.expiresAt)) {
        logger.warn("Expired session connect", { sessionId });
        socket.destroy();
        return;
      }
    } catch (err) {
      logger.error("DB error on connect", { sessionId, error: err.message });
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      ws.id = `${sessionId}-${Date.now()}`;
      if (!sessions.has(sessionId)) sessions.set(sessionId, new Set());
      sessions.get(sessionId).add(ws);
      setupHeartbeat(ws, sessionId);

      ws.on("message", (raw) => {
        handleMessage(ws, sessionId, code, raw).catch((err) => {
          logger.error("Message handler error", { sessionId, error: err.message });
        });
      });

      ws.on("close", () => {
        const clients = sessions.get(sessionId);
        if (clients) {
          clients.delete(ws);
          lastStrokeTime.delete(ws.id);
          if (clients.size === 0) sessions.delete(sessionId);
        }
      });

      ws.on("error", () => {});

      logger.info("Client connected", { sessionId });
    });
  },
};
