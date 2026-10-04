import { z } from "zod";

export const submitDailyReportSchema = z.object({
  trackId: z.string().min(1),
  content: z
    .string()
    .trim()
    .min(1, "Write something before submitting.")
    .max(5_000, "Report is too long."),
});

export const assignProjectSchema = z.object({
  trackId: z.string().min(1),
  title: z.string().trim().min(1, "Title is required").max(200),
  brief: z.string().trim().min(1, "Brief is required").max(10_000),
  instructions: z.string().trim().max(10_000).optional(),
  resourceUrl: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
});

export const createTaskSchema = z.object({
  trackId: z.string().min(1),
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5_000).optional(),
});

export const startInternshipSchema = z.object({
  durationMonths: z.number().int().min(1).max(3),
  acceptTerms: z.literal(true, { message: "Please accept the stipend terms to continue." }),
});

export const assignTemplateSchema = z.object({
  trackId: z.string().min(1),
  templateKey: z.string().min(1),
});

const githubRepoUrl = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .refine(
    (url) => /^https:\/\/(www\.)?github\.com\//i.test(url),
    "Enter a GitHub repository URL (https://github.com/...)"
  );

/** The one final project submission - same two links every brief requires (AD-036), now once per project. */
export const submitFinalProjectSchema = z.object({
  liveUrl: z.string().trim().url("Enter a valid URL, e.g. https://your-project.vercel.app"),
  repoUrl: githubRepoUrl,
  notes: z.string().trim().max(2_000, "Notes are too long.").optional(),
});

export const setTaskProgressSchema = z.object({
  taskId: z.string().min(1),
  progress: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
});

export const reviewFinalSchema = z.object({
  trackId: z.string().min(1),
  status: z.enum(["APPROVED", "CHANGES_REQUESTED", "NOT_ELIGIBLE"]),
  feedback: z.string().trim().max(5_000).optional(),
});

export const setDurationSchema = z.object({
  trackId: z.string().min(1),
  durationMonths: z.number().int().min(1).max(3),
});
