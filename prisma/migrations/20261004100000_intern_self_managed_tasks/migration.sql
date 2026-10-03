-- CreateEnum
CREATE TYPE "InternshipTaskProgress" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- AlterTable
ALTER TABLE "InternshipProject" ADD COLUMN     "details" JSONB,
ADD COLUMN     "finalNotes" TEXT;

-- AlterTable
ALTER TABLE "InternshipTask" DROP COLUMN "dueDay",
ADD COLUMN     "isAddon" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "progress" "InternshipTaskProgress" NOT NULL DEFAULT 'TODO';

