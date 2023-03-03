/*
  Warnings:

  - You are about to drop the column `typeJson` on the `UInfo` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UInfo" (
    "url" TEXT NOT NULL PRIMARY KEY,
    "hash" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "contentType" TEXT,
    "duration" INTEGER,
    "likes" INTEGER,
    "authorName" TEXT,
    "authorLink" TEXT,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL,
    "checked" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_UInfo" ("checked", "contentType", "created", "hash", "image", "summary", "title", "updated", "url") SELECT "checked", "contentType", "created", "hash", "image", "summary", "title", "updated", "url" FROM "UInfo";
DROP TABLE "UInfo";
ALTER TABLE "new_UInfo" RENAME TO "UInfo";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
