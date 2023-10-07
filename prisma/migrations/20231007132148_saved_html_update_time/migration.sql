-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SavedHtml" (
    "url" TEXT NOT NULL PRIMARY KEY,
    "html" TEXT NOT NULL,
    "updatedUts" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_SavedHtml" ("html", "url") SELECT "html", "url" FROM "SavedHtml";
DROP TABLE "SavedHtml";
ALTER TABLE "new_SavedHtml" RENAME TO "SavedHtml";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
