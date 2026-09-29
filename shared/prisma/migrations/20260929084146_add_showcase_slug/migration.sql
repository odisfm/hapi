-- CreateTable
CREATE TABLE "ShowcaseSlug" (
    "slug" TEXT NOT NULL,
    "showcaseId" UUID NOT NULL,
    "assignedDate" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ShowcaseSlug_pkey" PRIMARY KEY ("slug")
);

-- AddForeignKey
ALTER TABLE "ShowcaseSlug" ADD CONSTRAINT "ShowcaseSlug_showcaseId_fkey" FOREIGN KEY ("showcaseId") REFERENCES "Showcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
