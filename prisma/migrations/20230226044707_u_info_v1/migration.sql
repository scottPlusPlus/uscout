-- CreateTable
CREATE TABLE "UInfo" (
    "url" TEXT NOT NULL PRIMARY KEY,
    "hash" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL,
    "checked" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
