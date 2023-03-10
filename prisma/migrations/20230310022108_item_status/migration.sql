-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ItemModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collection" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT '',
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL
);
INSERT INTO "new_ItemModel" ("collection", "comment", "created", "id", "priority", "tags", "updated", "url") SELECT "collection", "comment", "created", "id", "priority", "tags", "updated", "url" FROM "ItemModel";
DROP TABLE "ItemModel";
ALTER TABLE "new_ItemModel" RENAME TO "ItemModel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
