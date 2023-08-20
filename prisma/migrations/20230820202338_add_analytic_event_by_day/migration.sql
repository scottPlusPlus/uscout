/*
  Warnings:

  - You are about to alter the column `ts` on the `AnalyticEvent` table. The data in that column could be lost. The data in that column will be cast from `DateTime` to `Int`.

*/
-- CreateTable
CREATE TABLE "AnalyticEventByDay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "day" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "count" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AnalyticEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ts" INTEGER NOT NULL,
    "ip" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "data" TEXT NOT NULL
);
INSERT INTO "new_AnalyticEvent" ("data", "event", "id", "ip", "ts") SELECT "data", "event", "id", "ip", "ts" FROM "AnalyticEvent";
DROP TABLE "AnalyticEvent";
ALTER TABLE "new_AnalyticEvent" RENAME TO "AnalyticEvent";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
