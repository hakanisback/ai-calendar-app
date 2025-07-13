-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start" DATETIME NOT NULL,
    "end" DATETIME NOT NULL,
    "location" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "userId" TEXT NOT NULL,
    "googleEventId" TEXT,
    "syncStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_events" ("createdAt", "description", "end", "id", "location", "start", "timezone", "title", "updatedAt", "userId") SELECT "createdAt", "description", "end", "id", "location", "start", "timezone", "title", "updatedAt", "userId" FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
CREATE UNIQUE INDEX "events_googleEventId_key" ON "events"("googleEventId");
CREATE INDEX "events_userId_idx" ON "events"("userId");
CREATE INDEX "events_start_idx" ON "events"("start");
CREATE INDEX "events_end_idx" ON "events"("end");
CREATE INDEX "events_googleEventId_idx" ON "events"("googleEventId");
CREATE INDEX "events_syncStatus_idx" ON "events"("syncStatus");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
