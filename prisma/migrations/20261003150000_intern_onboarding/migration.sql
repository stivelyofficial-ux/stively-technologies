-- AlterTable
ALTER TABLE "InternshipTask" ADD COLUMN     "dueDay" INTEGER;

-- AlterTable
ALTER TABLE "InternshipTrack" ADD COLUMN     "durationMonths" INTEGER,
ADD COLUMN     "endsAt" TIMESTAMP(3),
ADD COLUMN     "onboardedAt" TIMESTAMP(3),
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "termsVersion" TEXT;

