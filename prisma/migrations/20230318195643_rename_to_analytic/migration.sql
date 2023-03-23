/*
  Warnings:

  - You are about to drop the `TrackEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TrackEvent";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "AnalyticEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ts" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "data" TEXT NOT NULL
);
