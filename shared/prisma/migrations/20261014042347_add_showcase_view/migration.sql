-- CreateTable
CREATE TABLE "ShowcaseView" (
    "id" UUID NOT NULL,
    "showcaseId" UUID NOT NULL,
    "viewDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcaseView_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShowcaseView" ADD CONSTRAINT "ShowcaseView_showcaseId_fkey" FOREIGN KEY ("showcaseId") REFERENCES "Showcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
