/*
  Warnings:

  - Added the required column `updated` to the `UInfoDb` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UInfoDb" (
    "url" TEXT NOT NULL PRIMARY KEY,
    "dataJson" TEXT NOT NULL,
    "updated" DATETIME NOT NULL
);
INSERT INTO "new_UInfoDb" ("dataJson", "url") SELECT "dataJson", "url" FROM "UInfoDb";
DROP TABLE "UInfoDb";
ALTER TABLE "new_UInfoDb" RENAME TO "UInfoDb";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
