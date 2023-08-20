-- CreateTable
CREATE TABLE "Feedback" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ts" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL
);
