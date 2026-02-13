-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'host',
    "participants" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VowThread" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "challengesAccepted" TEXT NOT NULL DEFAULT '[]',
    "pulseSyncScore" INTEGER NOT NULL DEFAULT 0,
    "memoryTimeline" TEXT NOT NULL DEFAULT '[]',
    "affirmations" TEXT NOT NULL DEFAULT '[]',
    "canvasImageURL" TEXT,
    "modulesCompleted" TEXT NOT NULL DEFAULT '[]',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VowThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealtimeState" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "payload" TEXT NOT NULL,
    "strokes" TEXT NOT NULL DEFAULT '[]',
    "memoryItems" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealtimeState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_code_key" ON "Session"("code");

-- CreateIndex
CREATE UNIQUE INDEX "VowThread_sessionId_key" ON "VowThread"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "RealtimeState_sessionId_key" ON "RealtimeState"("sessionId");

-- AddForeignKey
ALTER TABLE "VowThread" ADD CONSTRAINT "VowThread_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealtimeState" ADD CONSTRAINT "RealtimeState_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
