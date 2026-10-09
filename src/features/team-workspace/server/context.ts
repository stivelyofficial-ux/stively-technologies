import "server-only";

import { prisma } from "@/lib/prisma";

/** The TeamMember profile behind a TEAM_MEMBER login - attribution for every message sent and search run. Null until the founder links one. */
export async function getTeamMemberProfile(userId: string) {
  return prisma.teamMember.findUnique({
    where: { userId },
    select: { id: true, name: true, role: true },
  });
}
