-- AlterTable
ALTER TABLE "Referral" ADD COLUMN     "signupIp" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referralBlockedAt" TIMESTAMP(3),
ADD COLUMN     "referralBlockedReason" TEXT;

