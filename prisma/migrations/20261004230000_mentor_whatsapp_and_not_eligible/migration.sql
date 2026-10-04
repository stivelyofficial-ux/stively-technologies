-- AlterEnum
ALTER TYPE "InternshipTaskStatus" ADD VALUE 'NOT_ELIGIBLE';

-- AlterTable
ALTER TABLE "InternshipDocument" ADD COLUMN     "reportingTo" TEXT;

-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "whatsappNumber" TEXT;

