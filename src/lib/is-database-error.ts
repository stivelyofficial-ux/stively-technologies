/**
 * Distinguishes "the database is unreachable" (a Neon compute-hour/quota
 * outage, a connection-pool exhaustion, etc.) from an ordinary app bug -
 * so error.tsx/global-error.tsx can show a real "we're back on X" message
 * instead of the generic "something went wrong" for exactly this case.
 * Prisma's own error *classes* (PrismaClientInitializationError etc.) don't
 * survive serialization across the Server Component -> error boundary
 * boundary in every Next.js version, so this also matches on message text
 * for the specific failure this app has actually hit in production.
 */
export function isDatabaseConnectivityError(error: Error): boolean {
  const name = error.name ?? "";
  if (name === "PrismaClientInitializationError" || name === "PrismaClientRustPanicError") return true;

  const haystack = `${name} ${error.message ?? ""}`.toLowerCase();
  return [
    "can't reach database server",
    "exceeded the quota",
    "too many connections",
    "connection pool",
    "econnrefused",
    "prismaclientinitializationerror",
  ].some((needle) => haystack.includes(needle));
}
