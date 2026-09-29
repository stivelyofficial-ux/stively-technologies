"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/actions/leads";
import { getLessonForStudent } from "../server/queries";

const saveLessonNoteSchema = z.object({
  enrollmentId: z.string().min(1),
  lessonId: z.string().min(1),
  content: z.string().max(20_000, "Note is too long."),
});

/**
 * Upserts a student's private note for one lesson - same
 * re-verify-everything-server-side discipline as sendAiTutorMessage: never
 * trusts that the notes panel only rendered because the lesson was really
 * this student's own. An empty string is a valid save (clearing a note),
 * not treated as "nothing to do".
 */
export async function saveLessonNote(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in." };

  const parsed = saveLessonNoteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { enrollmentId, lessonId, content } = parsed.data;

  const lessonView = await getLessonForStudent(lessonId, enrollmentId, session.user.id);
  if (!lessonView) return { success: false, error: "Lesson not found." };

  try {
    await prisma.lessonNote.upsert({
      where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
      create: { enrollmentId, lessonId, content },
      update: { content },
    });
    return { success: true };
  } catch (error) {
    console.error("saveLessonNote failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
