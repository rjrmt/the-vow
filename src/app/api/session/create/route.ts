import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SESSION_EXPIRY_HOURS = 24;

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = (body?.id as string) ?? crypto.randomUUID();
    const code = (body?.code as string)?.toUpperCase()?.trim() ?? generateCode();
    if (!code || code.length < 4) {
      return NextResponse.json(
        { error: "Invalid session code" },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

    const session = await prisma.session.create({
      data: {
        id,
        code,
        role: "host",
        participants: JSON.stringify([id]),
        expiresAt,
      },
    });

    await prisma.vowThread.create({
      data: {
        sessionId: id,
        challengesAccepted: "[]",
        pulseSyncScore: 0,
        memoryTimeline: "[]",
        affirmations: "[]",
        modulesCompleted: "[]",
      },
    });

    return NextResponse.json({
      session: {
        id: session.id,
        code: session.code,
        role: "host" as const,
        participants: JSON.parse(session.participants) as string[],
        createdAt: session.createdAt.getTime(),
        expiresAt: session.expiresAt.getTime(),
      },
    });
  } catch (e) {
    console.error("Create session error:", e);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
