/*
  Warnings:

  - Changed the type of `semester` on the `Showcase` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Showcase" DROP COLUMN "semester",
ADD COLUMN     "semester" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Showcase_name_year_semester_key" ON "Showcase"("name", "year", "semester");
