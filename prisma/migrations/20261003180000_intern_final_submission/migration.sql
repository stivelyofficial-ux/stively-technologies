-- AlterTable
ALTER TABLE "InternshipProject" ADD COLUMN     "finalFeedback" TEXT,
ADD COLUMN     "finalLiveUrl" TEXT,
ADD COLUMN     "finalRepoUrl" TEXT,
ADD COLUMN     "finalReviewedAt" TIMESTAMP(3),
ADD COLUMN     "finalReviewedById" TEXT,
ADD COLUMN     "finalStatus" "InternshipTaskStatus",
ADD COLUMN     "finalSubmittedAt" TIMESTAMP(3);

