-- CreateTable
CREATE TABLE "ProjectSlug" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "projectId" UUID NOT NULL,
    "assignedDate" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ProjectSlug_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSlug_slug_key" ON "ProjectSlug"("slug");

-- AddForeignKey
ALTER TABLE "ProjectSlug" ADD CONSTRAINT "ProjectSlug_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
