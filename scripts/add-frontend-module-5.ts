/**
 * Fills Module 5 ("Bonus: Git, GitHub & Deployment") of the live Frontend
 * Development course with its six lessons plus the final Module 5 Quiz,
 * using the SAME layout as Modules 1-3: each lesson is
 *   VIDEO ("Watch") -> MARKDOWN ("Reading material") -> QUIZ,
 * and the module ends with a quiz-only "Module N Quiz" lesson.
 *
 * Idempotent and non-destructive: it uses the existing (empty) Module 5 row
 * the course already has, and does nothing if that module already contains
 * lessons. Needs scripts/frontend-module-5-video-urls.json (written by
 * scripts/upload-frontend-module-5-videos.ts) to hold all six video URLs.
 *
 * Run:  npx tsx scripts/add-frontend-module-5.ts
 */
import { existsSync, readFileSync } from "fs";
import { prisma } from "../src/lib/prisma";
import {
  MODULE_5_LESSONS,
  MODULE_5_QUIZ,
  MODULE_5_QUIZ_SLUG,
  MODULE_5_QUIZ_TITLE,
} from "./frontend-module-5-content";

const URLS_PATH = "scripts/frontend-module-5-video-urls.json";

async function main() {
  if (!existsSync(URLS_PATH))
    throw new Error(`${URLS_PATH} not found - run the video upload script first.`);
  const urls: Record<string, string> = JSON.parse(readFileSync(URLS_PATH, "utf-8"));
  const missing = MODULE_5_LESSONS.filter((l) => !urls[l.videoKey]).map((l) => l.videoKey);
  if (missing.length > 0) throw new Error(`Missing uploaded video URL(s): ${missing.join(", ")}`);

  const offering = await prisma.offering.findUnique({
    where: { slug: "frontend-development" },
    include: {
      learningExperience: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: { _count: { select: { lessons: true } } },
          },
        },
      },
    },
  });
  const experience = offering?.learningExperience;
  if (!offering || !experience)
    throw new Error("frontend-development course (with a learning experience) not found.");

  const target = experience.modules.find((m) => m.order === 5);
  if (!target)
    throw new Error("The course has no Module 5 row yet - create it in the admin first.");
  if (target._count.lessons > 0) {
    console.log(
      `Module 5 "${target.title}" already has ${target._count.lessons} lessons - nothing to do.`
    );
    return;
  }
  console.log(`Filling Module 5: "${target.title}"`);

  await prisma.$transaction(
    async (tx) => {
      let order = 0;
      for (const lesson of MODULE_5_LESSONS) {
        order += 1;
        const created = await tx.lesson.create({
          data: {
            moduleId: target.id,
            title: lesson.title,
            slug: lesson.slug,
            order,
            summary: lesson.summary,
            requiresPreviousCompletion: true,
          },
        });

        await tx.lessonBlock.create({
          data: {
            lessonId: created.id,
            type: "VIDEO",
            order: 1,
            title: "Watch",
            content: { url: urls[lesson.videoKey], provider: "file" },
          },
        });

        await tx.lessonBlock.create({
          data: {
            lessonId: created.id,
            type: "MARKDOWN",
            order: 2,
            title: "Reading material",
            content: { text: lesson.reading },
          },
        });

        const quiz = await tx.assessment.create({
          data: {
            title: `${lesson.title} - Quiz`,
            type: "QUIZ",
            passingScore: 70,
            config: { questions: lesson.quiz.questions },
          },
        });
        await tx.lessonBlock.create({
          data: { lessonId: created.id, type: "QUIZ", order: 3, assessmentId: quiz.id },
        });
      }

      // Final quiz-only lesson, like "Module 4 Quiz: React".
      const finalLesson = await tx.lesson.create({
        data: {
          moduleId: target.id,
          title: MODULE_5_QUIZ_TITLE,
          slug: MODULE_5_QUIZ_SLUG,
          order: order + 1,
          requiresPreviousCompletion: true,
        },
      });
      const finalQuiz = await tx.assessment.create({
        data: {
          title: MODULE_5_QUIZ_TITLE,
          type: "QUIZ",
          passingScore: 50,
          config: { questions: MODULE_5_QUIZ.questions },
        },
      });
      await tx.lessonBlock.create({
        data: { lessonId: finalLesson.id, type: "QUIZ", order: 1, assessmentId: finalQuiz.id },
      });
    },
    { timeout: 60_000 }
  );

  console.log(
    `Done: ${MODULE_5_LESSONS.length} lessons + "${MODULE_5_QUIZ_TITLE}" added to Module 5.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
