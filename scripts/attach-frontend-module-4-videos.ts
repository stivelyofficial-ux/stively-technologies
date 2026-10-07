/**
 * Attaches the six uploaded Module 4 (React) lecture videos to their lessons.
 *
 * Module 4's lessons were built with reading material and quizzes only; every
 * other module's lessons start with a VIDEO block ("Watch"). This inserts that
 * block as block 1 of each of the six lessons (lecture 4.N -> lesson N), moving
 * the existing blocks down one place. Lesson 7 is the module quiz and gets no video.
 *
 * Idempotent: a lesson that already has a VIDEO block is skipped. Lecture N is
 * checked against the lesson's expected slug first, so nothing is attached to
 * the wrong lesson if the course is reordered.
 *
 * Needs scripts/frontend-module-4-video-urls.json (from upload-frontend-module-4-videos.ts).
 * Run:  npx tsx scripts/attach-frontend-module-4-videos.ts
 */
import { existsSync, readFileSync } from "fs";
import { prisma } from "../src/lib/prisma";

const URLS_PATH = "scripts/frontend-module-4-video-urls.json";

/** Lecture 4.N belongs to the lesson at position N, and that lesson must have this slug. */
const EXPECTED_SLUGS = [
  "why-react-components-and-jsx",
  "props-and-state",
  "events-and-usestate",
  "useeffect-conditional-rendering-and-lists",
  "forms-and-api-calls",
  "react-router-and-connecting-to-an-api",
];

async function main() {
  if (!existsSync(URLS_PATH))
    throw new Error(`${URLS_PATH} not found - run the upload script first.`);
  const urls: Record<string, string> = JSON.parse(readFileSync(URLS_PATH, "utf-8"));
  const missing = EXPECTED_SLUGS.map((_, i) => `4-${i + 1}`).filter((k) => !urls[k]);
  if (missing.length > 0) throw new Error(`Missing uploaded video URL(s): ${missing.join(", ")}`);

  const module4 = await prisma.module.findFirst({
    where: { order: 4, learningExperience: { offering: { slug: "frontend-development" } } },
    include: {
      lessons: { orderBy: { order: "asc" }, include: { blocks: { orderBy: { order: "asc" } } } },
    },
  });
  if (!module4) throw new Error("Module 4 of frontend-development not found.");

  for (let i = 0; i < EXPECTED_SLUGS.length; i++) {
    const lesson = module4.lessons.find((l) => l.order === i + 1);
    if (!lesson || lesson.slug !== EXPECTED_SLUGS[i]) {
      throw new Error(
        `Lesson ${i + 1} is "${lesson?.slug ?? "missing"}", expected "${EXPECTED_SLUGS[i]}" - not attaching anything.`
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < EXPECTED_SLUGS.length; i++) {
      const lesson = module4.lessons.find((l) => l.order === i + 1)!;
      if (lesson.blocks.some((b) => b.type === "VIDEO")) {
        console.log(`Lesson ${i + 1} (${lesson.slug}) already has a video - skipped.`);
        continue;
      }
      // Highest order first so the shift never collides.
      for (const block of [...lesson.blocks].sort((a, b) => b.order - a.order)) {
        await tx.lessonBlock.update({ where: { id: block.id }, data: { order: block.order + 1 } });
      }
      await tx.lessonBlock.create({
        data: {
          lessonId: lesson.id,
          type: "VIDEO",
          order: 1,
          title: "Watch",
          content: { url: urls[`4-${i + 1}`], provider: "file" },
        },
      });
      console.log(`Lesson ${i + 1} (${lesson.slug}) <- lecture 4.${i + 1}`);
    }
  });
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
