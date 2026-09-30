/*
  Warnings:

  - A unique constraint covering the columns `[projectId,categoryId]` on the table `ProjectCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProjectCategory_projectId_categoryId_key" ON "ProjectCategory"("projectId", "categoryId");
