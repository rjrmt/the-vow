// WebSocket upgrade handled by custom server or edge - Next.js App Router
// doesn't support WebSocket in route handlers. For MVP we use a workaround:
// Client connects to a separate WebSocket endpoint. We'll create a simple
// API route that returns connection info, and the client uses a mock/fallback
// when WebSocket server isn't available.

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const session = searchParams.get("session");
  const code = searchParams.get("code");

  if (!session || !code) {
    return NextResponse.json(
      { error: "Missing session or code" },
      { status: 400 }
    );
  }

  // Return WebSocket URL - in production this would point to your WS server
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000";
  const wsProtocol = protocol === "https" ? "wss" : "ws";

  return NextResponse.json({
    wsUrl: `${wsProtocol}://${host}/api/realtime/ws?session=${session}&code=${code}`,
  });
}
