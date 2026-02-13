-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'host',
    "participants" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VowThread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "challengesAccepted" TEXT NOT NULL DEFAULT '[]',
    "pulseSyncScore" INTEGER NOT NULL DEFAULT 0,
    "memoryTimeline" TEXT NOT NULL DEFAULT '[]',
    "affirmations" TEXT NOT NULL DEFAULT '[]',
    "canvasImageURL" TEXT,
    "modulesCompleted" TEXT NOT NULL DEFAULT '[]',
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VowThread_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RealtimeState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "payload" TEXT NOT NULL,
    "strokes" TEXT NOT NULL DEFAULT '[]',
    "memoryItems" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RealtimeState_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_code_key" ON "Session"("code");

-- CreateIndex
CREATE UNIQUE INDEX "VowThread_sessionId_key" ON "VowThread"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "RealtimeState_sessionId_key" ON "RealtimeState"("sessionId");
