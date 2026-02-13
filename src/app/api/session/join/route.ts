import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSessionExpired } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = (body?.code as string)?.toUpperCase()?.trim();
    if (!code || code.length < 4) {
      return NextResponse.json(
        { error: "Invalid session code" },
        { status: 400 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { code },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (isSessionExpired(session.expiresAt)) {
      return NextResponse.json(
        { error: "Session expired" },
        { status: 410 }
      );
    }

    const participants = JSON.parse(session.participants) as string[];

    return NextResponse.json({
      session: {
        id: session.id,
        code: session.code,
        role: "participant" as const,
        participants,
        createdAt: session.createdAt.getTime(),
        expiresAt: session.expiresAt.getTime(),
      },
    });
  } catch (e) {
    console.error("Join session error:", e);
    return NextResponse.json(
      { error: "Failed to join session" },
      { status: 500 }
    );
  }
}
