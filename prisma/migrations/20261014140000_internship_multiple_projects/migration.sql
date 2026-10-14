-- DropIndex
DROP INDEX "InternshipProject_trackId_key";

-- AlterTable
ALTER TABLE "InternshipProject" ADD COLUMN     "sequence" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "InternshipTask" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "InternshipTrack" ADD COLUMN     "currentProjectId" TEXT;

-- CreateIndex
CREATE INDEX "InternshipProject_trackId_idx" ON "InternshipProject"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "InternshipProject_trackId_sequence_key" ON "InternshipProject"("trackId", "sequence");

-- CreateIndex
CREATE INDEX "InternshipTask_projectId_idx" ON "InternshipTask"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "InternshipTrack_currentProjectId_key" ON "InternshipTrack"("currentProjectId");

-- Backfill: every existing project becomes its track's current project (sequence 1), and its tasks belong to it.
UPDATE "InternshipTrack" t SET "currentProjectId" = p."id" FROM "InternshipProject" p WHERE p."trackId" = t."id";
UPDATE "InternshipTask" k SET "projectId" = p."id" FROM "InternshipProject" p WHERE p."trackId" = k."trackId";

-- AddForeignKey
ALTER TABLE "InternshipTrack" ADD CONSTRAINT "InternshipTrack_currentProjectId_fkey" FOREIGN KEY ("currentProjectId") REFERENCES "InternshipProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipTask" ADD CONSTRAINT "InternshipTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "InternshipProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

