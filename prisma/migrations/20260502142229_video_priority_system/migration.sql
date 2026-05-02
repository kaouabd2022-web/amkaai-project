-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VideoJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "prompt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "resultUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VideoJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VideoJob" ("createdAt", "id", "prompt", "resultUrl", "status", "updatedAt", "userId") SELECT "createdAt", "id", "prompt", "resultUrl", "status", "updatedAt", "userId" FROM "VideoJob";
DROP TABLE "VideoJob";
ALTER TABLE "new_VideoJob" RENAME TO "VideoJob";
CREATE INDEX "VideoJob_userId_idx" ON "VideoJob"("userId");
CREATE INDEX "VideoJob_status_idx" ON "VideoJob"("status");
CREATE INDEX "VideoJob_priority_idx" ON "VideoJob"("priority");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
