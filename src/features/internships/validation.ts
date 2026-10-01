import { z } from "zod";

export const submitDailyReportSchema = z.object({
  trackId: z.string().min(1),
  content: z.string().trim().min(1, "Write something before submitting.").max(5_000, "Report is too long."),
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

export const reviewTaskSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(["APPROVED", "CHANGES_REQUESTED"]),
  feedback: z.string().trim().max(5_000).optional(),
});

/** Both links required - matches every real project brief this program sends (see AD-036): "Live website URL + GitHub repository URL" are the two non-negotiable final deliverables. */
export const submitTaskSchema = z.object({
  taskId: z.string().min(1),
  liveUrl: z.string().trim().url("Enter a valid URL, e.g. https://your-project.vercel.app"),
  repoUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .refine((url) => /^https:\/\/(www\.)?github\.com\//i.test(url), "Enter a GitHub repository URL (https://github.com/...)"),
});
