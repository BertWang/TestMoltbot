-- CreateTable
CREATE TABLE "MCPServiceRegistry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "logo" TEXT,
    "totalInstalls" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "requiredFields" TEXT,
    "optionalFields" TEXT,
    "documentation" TEXT,
    "homepage" TEXT,
    "repositoryUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MCPServiceRegistry_name_key" ON "MCPServiceRegistry"("name");

-- CreateIndex
CREATE INDEX "MCPServiceRegistry_category_idx" ON "MCPServiceRegistry"("category");

-- CreateIndex
CREATE INDEX "MCPServiceRegistry_type_idx" ON "MCPServiceRegistry"("type");

-- CreateIndex
CREATE INDEX "MCPServiceRegistry_name_idx" ON "MCPServiceRegistry"("name");

-- CreateIndex
CREATE INDEX "MCPServiceRegistry_isActive_idx" ON "MCPServiceRegistry"("isActive");
