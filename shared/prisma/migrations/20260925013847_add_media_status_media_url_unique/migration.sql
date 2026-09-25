/*
  Warnings:

  - A unique constraint covering the columns `[mediaUrl]` on the table `ProjectMedia` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `status` to the `ProjectMedia` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('AVAILABLE', 'PENDING', 'FAILED');

-- AlterTable
ALTER TABLE "ProjectMedia" ADD COLUMN     "status" "MediaStatus" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMedia_mediaUrl_key" ON "ProjectMedia"("mediaUrl");
