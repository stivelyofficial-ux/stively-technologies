-- CreateEnum
CREATE TYPE "InternshipDocumentKind" AS ENUM ('OFFER_LETTER', 'INTERNSHIP_CERTIFICATE', 'LETTER_OF_RECOMMENDATION', 'EXPERIENCE_LETTER');

-- CreateTable
CREATE TABLE "InternshipDocument" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "kind" "InternshipDocumentKind" NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "durationLabel" TEXT NOT NULL,
    "status" "CertificateStatus" NOT NULL DEFAULT 'ISSUED',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternshipDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InternshipDocument_documentNumber_key" ON "InternshipDocument"("documentNumber");

-- CreateIndex
CREATE INDEX "InternshipDocument_trackId_idx" ON "InternshipDocument"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "InternshipDocument_trackId_kind_key" ON "InternshipDocument"("trackId", "kind");

-- AddForeignKey
ALTER TABLE "InternshipDocument" ADD CONSTRAINT "InternshipDocument_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "InternshipTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

