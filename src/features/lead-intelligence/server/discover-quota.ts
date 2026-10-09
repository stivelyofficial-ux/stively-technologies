import "server-only";

import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/** How many Google Places searches a TEAM_MEMBER may run per (IST) day. Admins and sales are not capped. */
export const TEAM_MEMBER_DAILY_DISCOVER_LIMIT = 2;

function startOfTodayIst(): Date {
  const offsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(Date.now() + offsetMs);
  istNow.setUTCHours(0, 0, 0, 0);
  return new Date(istNow.getTime() - offsetMs);
}

export interface DiscoverQuota {
  limit: number | null;
  used: number;
  /** null = unlimited. */
  remaining: number | null;
}

/**
 * Searches already run today by this user. A run that FAILED (e.g. the API key
 * is missing) does not burn the allowance.
 */
export async function getDiscoverQuota(userId: string, role: Role): Promise<DiscoverQuota> {
  if (role !== "TEAM_MEMBER") return { limit: null, used: 0, remaining: null };

  const teamMember = await prisma.teamMember.findUnique({
    where: { userId },
    select: { id: true },
  });
  // No linked TeamMember profile means searches could not be attributed or counted - block rather than allow unlimited.
  if (!teamMember)
    return {
      limit: TEAM_MEMBER_DAILY_DISCOVER_LIMIT,
      used: TEAM_MEMBER_DAILY_DISCOVER_LIMIT,
      remaining: 0,
    };
  const used = teamMember
    ? await prisma.leadIntelligenceSearchRun.count({
        where: {
          triggeredById: teamMember.id,
          connectorType: "GOOGLE_PLACES",
          status: { not: "FAILED" },
          startedAt: { gte: startOfTodayIst() },
        },
      })
    : 0;

  return {
    limit: TEAM_MEMBER_DAILY_DISCOVER_LIMIT,
    used,
    remaining: Math.max(TEAM_MEMBER_DAILY_DISCOVER_LIMIT - used, 0),
  };
}
