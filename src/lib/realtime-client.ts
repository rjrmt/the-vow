/**
 * WebSocket realtime client with reconnect, snapshot recovery, and heartbeat
 */

import type { RealtimeMessage, SnapshotPayload } from "@/types";

type MessageHandler = (msg: RealtimeMessage) => void;

const DEFAULT_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const HEARTBEAT_INTERVAL_MS = 10000;

export class RealtimeClient {
  private ws: WebSocket | null = null;
  private url: string;
  private sessionId: string;
  private code: string;
  private handlers = new Set<MessageHandler>();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  private closed = false;
  private hasConnectedOnce = false;

  constructor(url: string, sessionId: string, code: string) {
    this.url = url;
    this.sessionId = sessionId;
    this.code = code;
  }

  connect(): void {
    if (this.closed) return;
    try {
      this.ws = new WebSocket(this.url);
    } catch (e) {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      if (this.hasConnectedOnce) {
        this.send({ type: "snapshot_request", payload: {} });
      }
      this.hasConnectedOnce = true;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        if (data && typeof data === "object" && "type" in data) {
          if (data.type === "snapshot") {
            this.handlers.forEach((h) =>
              h({ type: "snapshot", payload: data.payload as SnapshotPayload })
            );
          } else {
            this.handlers.forEach((h) => h(data as RealtimeMessage));
          }
        }
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      this.ws = null;
      if (!this.closed) this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      // Reconnect handled by onclose
    };
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: "heartbeat", payload: { timestamp: Date.now() } });
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    const delay = Math.min(
      DEFAULT_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts),
      MAX_RECONNECT_DELAY
    );
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  send(msg: RealtimeMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect(): void {
    this.closed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
