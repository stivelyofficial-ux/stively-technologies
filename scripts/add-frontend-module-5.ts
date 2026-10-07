/**
 * Adds Module 5 ("Bonus Module: Git, GitHub & Vercel") to the live Frontend
 * Development course: 6 lessons, each with the lecture video, reading
 * material, a short quiz and the AI tutor block - the same block layout the
 * course's other lessons use.
 *
 * Idempotent: if the course already has a module with this title, or a module
 * in position 5 or later, it does nothing. Needs scripts/frontend-module-5-video-urls.json
 * (written by scripts/upload-frontend-module-5-videos.ts) to hold all six URLs.
 *
 * Run:  set -a; . ./.env; set +a; npx tsx scripts/add-frontend-module-5.ts
 */
import { existsSync, readFileSync } from "fs";
import { prisma } from "../src/lib/prisma";
import {
  MODULE_5_DESCRIPTION,
  MODULE_5_LESSONS,
  MODULE_5_TITLE,
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
    include: { learningExperience: { include: { modules: { orderBy: { order: "asc" } } } } },
  });
  const experience = offering?.learningExperience;
  if (!offering || !experience)
    throw new Error("frontend-development course (with a learning experience) not found.");

  const existing = experience.modules;
  const already =
    existing.find((m) => m.title === MODULE_5_TITLE) ?? existing.find((m) => m.order >= 5);
  if (already) {
    console.log(
      `Module "${already.title}" (order ${already.order}) already exists - nothing to do.`
    );
    return;
  }
  const order = (existing.at(-1)?.order ?? 0) + 1;
  console.log(
    `Existing modules: ${existing.map((m) => `${m.order}. ${m.title}`).join(" | ") || "none"}`
  );

  await prisma.$transaction(
    async (tx) => {
      const createdModule = await tx.module.create({
        data: {
          learningExperienceId: experience.id,
          title: MODULE_5_TITLE,
          description: MODULE_5_DESCRIPTION,
          order,
        },
      });

      let lessonOrder = 0;
      for (const lesson of MODULE_5_LESSONS) {
        lessonOrder += 1;
        const created = await tx.lesson.create({
          data: {
            moduleId: createdModule.id,
            title: lesson.title,
            slug: lesson.slug,
            order: lessonOrder,
            summary: lesson.summary,
            estimatedMinutes: lesson.estimatedMinutes,
            requiresPreviousCompletion: true,
          },
        });

        await tx.lessonBlock.create({
          data: {
            lessonId: created.id,
            type: "VIDEO",
            order: 1,
            title: "Watch",
            content: {
              url: urls[lesson.videoKey],
              provider: "file",
              ...(lesson.durationSeconds ? { durationSeconds: lesson.durationSeconds } : {}),
            },
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

        const assessment = await tx.assessment.create({
          data: {
            title: lesson.quiz.title,
            type: "QUIZ",
            instructions: "Select the best answer for each question.",
            passingScore: 70,
            config: { questions: lesson.quiz.questions },
          },
        });
        await tx.lessonBlock.create({
          data: { lessonId: created.id, type: "QUIZ", order: 3, assessmentId: assessment.id },
        });

        await tx.lessonBlock.create({
          data: {
            lessonId: created.id,
            type: "AI_CONVERSATION",
            order: 4,
            title: "Ask the AI Tutor",
          },
        });
      }
    },
    { timeout: 60_000 }
  );

  console.log(
    `Added module ${order}: "${MODULE_5_TITLE}" with ${MODULE_5_LESSONS.length} lessons.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
