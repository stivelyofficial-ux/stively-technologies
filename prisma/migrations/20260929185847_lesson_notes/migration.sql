-- CreateTable
CREATE TABLE "LessonNote" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonNote_enrollmentId_idx" ON "LessonNote"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonNote_enrollmentId_lessonId_key" ON "LessonNote"("enrollmentId", "lessonId");

-- AddForeignKey
ALTER TABLE "LessonNote" ADD CONSTRAINT "LessonNote_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "OfferingEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonNote" ADD CONSTRAINT "LessonNote_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
