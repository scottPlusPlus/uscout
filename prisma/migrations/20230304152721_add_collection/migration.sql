/*
  Warnings:

  - The primary key for the `ItemModel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `collection` to the `ItemModel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `ItemModel` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Collecton" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ItemModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collection" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL
);
INSERT INTO "new_ItemModel" ("comment", "created", "priority", "tags", "updated", "url") SELECT "comment", "created", "priority", "tags", "updated", "url" FROM "ItemModel";
DROP TABLE "ItemModel";
ALTER TABLE "new_ItemModel" RENAME TO "ItemModel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
