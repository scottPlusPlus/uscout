-- CreateTable
CREATE TABLE "ItemModel" (
    "url" TEXT NOT NULL PRIMARY KEY,
    "comment" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL
);
