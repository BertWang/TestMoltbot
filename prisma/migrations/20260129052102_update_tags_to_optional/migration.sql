-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "fileKey" TEXT,
    "rawOcrText" TEXT,
    "ocrProvider" TEXT,
    "refinedContent" TEXT,
    "confidence" REAL,
    "summary" TEXT,
    "tags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "collectionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Note_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Note" ("collectionId", "confidence", "createdAt", "errorMessage", "fileKey", "id", "imageUrl", "ocrProvider", "rawOcrText", "refinedContent", "status", "summary", "tags", "updatedAt") SELECT "collectionId", "confidence", "createdAt", "errorMessage", "fileKey", "id", "imageUrl", "ocrProvider", "rawOcrText", "refinedContent", "status", "summary", "tags", "updatedAt" FROM "Note";
DROP TABLE "Note";
ALTER TABLE "new_Note" RENAME TO "Note";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
