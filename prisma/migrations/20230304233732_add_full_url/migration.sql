-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UInfo" (
    "url" TEXT NOT NULL PRIMARY KEY,
    "fullUrl" TEXT NOT NULL DEFAULT '',
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
INSERT INTO "new_UInfo" ("authorLink", "authorName", "checked", "contentType", "created", "duration", "hash", "image", "likes", "summary", "title", "updated", "url") SELECT "authorLink", "authorName", "checked", "contentType", "created", "duration", "hash", "image", "likes", "summary", "title", "updated", "url" FROM "UInfo";
DROP TABLE "UInfo";
ALTER TABLE "new_UInfo" RENAME TO "UInfo";
CREATE TABLE "new_ItemModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collection" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL
);
INSERT INTO "new_ItemModel" ("collection", "comment", "created", "id", "priority", "tags", "updated", "url") SELECT "collection", "comment", "created", "id", "priority", "tags", "updated", "url" FROM "ItemModel";
DROP TABLE "ItemModel";
ALTER TABLE "new_ItemModel" RENAME TO "ItemModel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
