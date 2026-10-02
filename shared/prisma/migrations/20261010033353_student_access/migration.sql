/*
  Warnings:

  - You are about to drop the column `approvalStatus` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `developers` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `heroArtUrl` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `iconUrl` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `links` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `Project` table. All the data in the column will be lost.
  - The primary key for the `ProjectCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ProjectCategory` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `ProjectCategory` table. All the data in the column will be lost.
  - You are about to drop the column `deviceType` on the `ProjectMedia` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `ProjectMedia` table. All the data in the column will be lost.
  - Added the required column `projectVersionId` to the `ProjectCategory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED', 'SUPERSEDED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'STUDENT';

-- DropForeignKey
ALTER TABLE "PasswordResetRequest" DROP CONSTRAINT "PasswordResetRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectCategory" DROP CONSTRAINT "ProjectCategory_projectId_fkey";

-- DropIndex
DROP INDEX "ProjectCategory_projectId_categoryId_key";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "approvalStatus",
DROP COLUMN "description",
DROP COLUMN "developers",
DROP COLUMN "heroArtUrl",
DROP COLUMN "iconUrl",
DROP COLUMN "links",
DROP COLUMN "name",
DROP COLUMN "rejectionReason",
DROP COLUMN "subtitle";

-- AlterTable
ALTER TABLE "ProjectCategory" DROP CONSTRAINT "ProjectCategory_pkey",
DROP COLUMN "id",
DROP COLUMN "projectId",
ADD COLUMN     "projectVersionId" UUID NOT NULL,
ADD CONSTRAINT "ProjectCategory_pkey" PRIMARY KEY ("projectVersionId", "categoryId");

-- AlterTable
ALTER TABLE "ProjectMedia" DROP COLUMN "deviceType",
DROP COLUMN "order";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "videoTranscodeCredits" INTEGER;

-- DropEnum
DROP TYPE "ApprovalStatus";

-- CreateTable
CREATE TABLE "ProjectVersion" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "developerNames" TEXT[],
    "submissionStatus" "SubmissionStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "rejectionReason" TEXT,
    "reviewerId" UUID,
    "reviewedAt" TIMESTAMP(3),
    "links" TEXT[],
    "heroArtUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectOwner" (
    "projectId" UUID NOT NULL,
    "ownerId" UUID NOT NULL,

    CONSTRAINT "ProjectOwner_pkey" PRIMARY KEY ("ownerId","projectId")
);

-- CreateTable
CREATE TABLE "ProjectVersionMedia" (
    "mediaId" UUID NOT NULL,
    "projectVersionId" UUID NOT NULL,
    "order" TEXT NOT NULL,
    "deviceType" "DeviceType" NOT NULL,

    CONSTRAINT "ProjectVersionMedia_pkey" PRIMARY KEY ("projectVersionId","mediaId")
);

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOwner" ADD CONSTRAINT "ProjectOwner_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOwner" ADD CONSTRAINT "ProjectOwner_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersionMedia" ADD CONSTRAINT "ProjectVersionMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "ProjectMedia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersionMedia" ADD CONSTRAINT "ProjectVersionMedia_projectVersionId_fkey" FOREIGN KEY ("projectVersionId") REFERENCES "ProjectVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCategory" ADD CONSTRAINT "ProjectCategory_projectVersionId_fkey" FOREIGN KEY ("projectVersionId") REFERENCES "ProjectVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetRequest" ADD CONSTRAINT "PasswordResetRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
