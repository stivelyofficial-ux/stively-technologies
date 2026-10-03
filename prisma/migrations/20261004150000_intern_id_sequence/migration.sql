-- AlterTable
ALTER TABLE "InternshipTrack" ADD COLUMN     "sequence" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InternshipTrack_sequence_key" ON "InternshipTrack"("sequence");

