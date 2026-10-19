-- AlterTable
ALTER TABLE "ProjectView" ADD COLUMN     "ipAddress" TEXT NOT NULL DEFAULT '0.0.0.0';

-- AlterTable
ALTER TABLE "ShowcaseView" ADD COLUMN     "ipAddress" TEXT NOT NULL DEFAULT '0.0.0.0';
