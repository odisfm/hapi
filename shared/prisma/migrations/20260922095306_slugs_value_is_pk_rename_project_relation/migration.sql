/*
  Warnings:

  - The primary key for the `ProjectSlug` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ProjectSlug` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ProjectSlug_slug_key";

-- AlterTable
ALTER TABLE "ProjectSlug" DROP CONSTRAINT "ProjectSlug_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "ProjectSlug_pkey" PRIMARY KEY ("slug");
