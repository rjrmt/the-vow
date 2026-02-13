import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSessionExpired } from "@/lib/db";
import { selectVowCard } from "@/lib/vow-selector";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { id },
    include: { vowThread: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (isSessionExpired(session.expiresAt)) {
    return NextResponse.json({ error: "Session expired" }, { status: 410 });
  }

  const vt = session.vowThread;
  const data = vt
    ? {
        challengesAccepted: JSON.parse(vt.challengesAccepted || "[]") as string[],
        pulseSyncScore: vt.pulseSyncScore ?? 0,
        memoryTimeline: JSON.parse(vt.memoryTimeline || "[]") as Array<{ id: string; order: number }>,
        affirmations: JSON.parse(vt.affirmations || "[]") as string[],
        canvasImageURL: vt.canvasImageURL ?? undefined,
      }
    : {
        challengesAccepted: [] as string[],
        pulseSyncScore: 0,
        memoryTimeline: [] as Array<{ id: string; order: number }>,
        affirmations: [] as string[],
        canvasImageURL: undefined as string | undefined,
      };

  const vowCard = selectVowCard(
    session.id,
    session.code,
    data,
    vt?.completedAt?.getTime()
  );

  return NextResponse.json({ session, vowCard });
}
