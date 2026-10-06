import { Prisma } from "@prisma/client";

/**
 * Logs a failed read from a "catch and degrade" query. When the database is
 * simply unreachable (an outage, or a laptop with no route to Neon) that is
 * an environment problem, not a code bug, so it is a one-line warning rather
 * than a console.error - Next's dev overlay turns every console.error into a
 * red full-screen error. Anything else is still a real error.
 */
export function logQueryFailure(label: string, error: unknown): void {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.warn(`${label}: database unreachable - rendering the fallback.`);
    return;
  }
  console.error(`${label} failed:`, error);
}
