-- CreateTable
CREATE TABLE "ProjectView" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "viewDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectView_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectView" ADD CONSTRAINT "ProjectView_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
