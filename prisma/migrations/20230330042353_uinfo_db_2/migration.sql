/*
  Warnings:

  - You are about to drop the column `scrapeHistoryJson` on the `UInfoDb` table. All the data in the column will be lost.
  - Made the column `dataJson` on table `UInfoDb` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UInfoDb" (
    "url" TEXT NOT NULL PRIMARY KEY,
    "dataJson" TEXT NOT NULL
);
INSERT INTO "new_UInfoDb" ("dataJson", "url") SELECT "dataJson", "url" FROM "UInfoDb";
DROP TABLE "UInfoDb";
ALTER TABLE "new_UInfoDb" RENAME TO "UInfoDb";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
