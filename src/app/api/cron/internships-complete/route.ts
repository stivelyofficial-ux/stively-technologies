import { isValidCronRequest } from "@/features/lead-intelligence/server/cron-auth";
import { completeExpiredInternships } from "@/features/internships/server/auto-complete";

/**
 * Daily: completes every internship whose fixed period has ended and issues
 * its certificate and letters. Vercel Cron pattern shared with the other
 * /api/cron routes; safe to re-run (each internship is claimed atomically).
 */
export async function GET(request: Request) {
  if (!isValidCronRequest(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const result = await completeExpiredInternships();
  return Response.json({ ok: true, ...result });
}
