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
