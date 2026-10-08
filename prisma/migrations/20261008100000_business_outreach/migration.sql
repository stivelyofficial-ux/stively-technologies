-- CreateEnum
CREATE TYPE "BusinessOutreachStatus" AS ENUM ('NOT_CONTACTED', 'CONTACTED', 'REPLIED', 'NOT_INTERESTED', 'SKIPPED');

-- AlterEnum
ALTER TYPE "BusinessActivityType" ADD VALUE 'OUTREACH_SENT';
ALTER TYPE "BusinessActivityType" ADD VALUE 'OUTREACH_REPLIED';
ALTER TYPE "BusinessActivityType" ADD VALUE 'OUTREACH_NOT_INTERESTED';

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "outreachContactedAt" TIMESTAMP(3),
ADD COLUMN     "outreachStatus" "BusinessOutreachStatus" NOT NULL DEFAULT 'NOT_CONTACTED';

-- CreateIndex
CREATE INDEX "Business_outreachStatus_idx" ON "Business"("outreachStatus");
