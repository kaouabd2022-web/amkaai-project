/*
  Warnings:

  - You are about to drop the column `stripeSessionId` on the `AbandonedCheckout` table. All the data in the column will be lost.
  - You are about to drop the column `stripeId` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `AbandonedCheckout` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AbandonedCheckout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "checkoutUrl" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "recovered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AbandonedCheckout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AbandonedCheckout" ("checkoutUrl", "createdAt", "email", "id", "recovered", "updatedAt", "userId") SELECT "checkoutUrl", "createdAt", "email", "id", "recovered", "updatedAt", "userId" FROM "AbandonedCheckout";
DROP TABLE "AbandonedCheckout";
ALTER TABLE "new_AbandonedCheckout" RENAME TO "AbandonedCheckout";
CREATE UNIQUE INDEX "AbandonedCheckout_transactionId_key" ON "AbandonedCheckout"("transactionId");
CREATE TABLE "new_ManualPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "screenshotUrl" TEXT,
    "rip" TEXT,
    "transactionId" TEXT,
    "imageHash" TEXT,
    "ipAddress" TEXT,
    "device" TEXT,
    "aiScore" REAL,
    "aiRawText" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "riskLevel" TEXT,
    "approvedBy" TEXT,
    "rejectedBy" TEXT,
    "rejectReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ManualPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ManualPayment" ("aiRawText", "aiScore", "amount", "approvedBy", "createdAt", "currency", "device", "id", "imageHash", "ipAddress", "method", "plan", "rejectReason", "rejectedBy", "rip", "riskLevel", "screenshotUrl", "status", "transactionId", "updatedAt", "userId", "verified") SELECT "aiRawText", "aiScore", "amount", "approvedBy", "createdAt", "currency", "device", "id", "imageHash", "ipAddress", "method", "plan", "rejectReason", "rejectedBy", "rip", "riskLevel", "screenshotUrl", "status", "transactionId", "updatedAt", "userId", "verified" FROM "ManualPayment";
DROP TABLE "ManualPayment";
ALTER TABLE "new_ManualPayment" RENAME TO "ManualPayment";
CREATE INDEX "ManualPayment_userId_idx" ON "ManualPayment"("userId");
CREATE INDEX "ManualPayment_status_idx" ON "ManualPayment"("status");
CREATE INDEX "ManualPayment_createdAt_idx" ON "ManualPayment"("createdAt");
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paddleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "currency", "id", "userId") SELECT "amount", "createdAt", "currency", "id", "userId" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_paddleId_key" ON "Payment"("paddleId");
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
