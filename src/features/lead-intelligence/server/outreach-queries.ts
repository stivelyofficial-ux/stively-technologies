import "server-only";

import { prisma } from "@/lib/prisma";

import {
  buildOutreachMessage,
  hasOwnWebsite,
  pickSegment,
  toWhatsAppNumber,
  type OutreachSegment,
} from "../lib/outreach";

/** How many queue cards are loaded at once - a day's worth of sending, refreshed as the list is worked down. */
const QUEUE_BATCH_SIZE = 100;
/** Candidates scanned per load. Wider than the batch because landlines and strong sites are filtered out in code. */
const CANDIDATE_SCAN_SIZE = 600;

export interface OutreachCard {
  id: string;
  businessName: string;
  industry: string | null;
  city: string | null;
  website: string | null;
  segment: OutreachSegment;
  waNumber: string;
  /** Display-friendly number, e.g. "98765 43210". */
  displayNumber: string;
  message: string;
  /** Short plain-language reason this business is in the queue, shown on the card. */
  reason: string;
}

export interface OutreachStats {
  contactedToday: number;
  repliedTotal: number;
  /** Eligible businesses still waiting (before the batch limit). */
  queued: number;
  noWebsite: number;
  weakWebsite: number;
  /** Businesses with a website that has not been analyzed yet - they can't be classified until analyzed. */
  needsAnalysis: number;
}

export function startOfTodayIst(): Date {
  const offsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(Date.now() + offsetMs);
  istNow.setUTCHours(0, 0, 0, 0);
  return new Date(istNow.getTime() - offsetMs);
}

function formatDisplayNumber(waNumber: string): string {
  const local = waNumber.slice(2);
  return `${local.slice(0, 5)} ${local.slice(5)}`;
}

export async function getOutreachQueue(): Promise<{ cards: OutreachCard[]; stats: OutreachStats }> {
  const [candidates, contactedToday, repliedTotal, needsAnalysis] = await Promise.all([
    prisma.business.findMany({
      where: {
        outreachStatus: "NOT_CONTACTED",
        status: { in: ["NEW", "ANALYZED"] },
        OR: [{ whatsapp: { not: null } }, { phone: { not: null } }],
      },
      include: {
        websiteAnalyses: {
          where: { status: "COMPLETE" },
          orderBy: { completedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: CANDIDATE_SCAN_SIZE,
    }),
    prisma.business.count({ where: { outreachContactedAt: { gte: startOfTodayIst() } } }),
    prisma.business.count({ where: { outreachStatus: "REPLIED" } }),
    prisma.business.count({
      where: {
        outreachStatus: "NOT_CONTACTED",
        status: { in: ["NEW", "ANALYZED"] },
        website: { not: null },
        websiteAnalyses: { none: { status: "COMPLETE" } },
      },
    }),
  ]);

  const eligible: OutreachCard[] = [];
  for (const business of candidates) {
    const waNumber = toWhatsAppNumber(business.whatsapp) ?? toWhatsAppNumber(business.phone);
    if (!waNumber) continue;

    const analysis = business.websiteAnalyses[0] ?? null;
    const segment = pickSegment(business, analysis);
    if (!segment) continue;

    const message = buildOutreachMessage({
      id: business.id,
      businessName: business.businessName,
      city: business.city,
      website: hasOwnWebsite(business.website) ? business.website : null,
      segment,
      checks: analysis?.checks ?? null,
    });

    eligible.push({
      id: business.id,
      businessName: business.businessName,
      industry: business.industry,
      city: business.city,
      website: hasOwnWebsite(business.website) ? business.website : null,
      segment,
      waNumber,
      displayNumber: formatDisplayNumber(waNumber),
      message,
      reason:
        segment === "NO_WEBSITE"
          ? "No website on file"
          : `Website score ${analysis?.overallScore ?? "?"}/100, speed ${analysis?.performanceScore ?? "?"}/100`,
    });
  }

  const noWebsite = eligible.filter((card) => card.segment === "NO_WEBSITE").length;

  return {
    cards: eligible.slice(0, QUEUE_BATCH_SIZE),
    stats: {
      contactedToday,
      repliedTotal,
      queued: eligible.length,
      noWebsite,
      weakWebsite: eligible.length - noWebsite,
      needsAnalysis,
    },
  };
}

export interface SentOutreachRow {
  id: string;
  businessName: string;
  city: string | null;
  contactedAt: Date;
  promoted: boolean;
}

/** The 30 most recently messaged businesses still awaiting an outcome - where replies get turned into Sales CRM leads. */
export async function getAwaitingReply(sentByTeamMemberId?: string): Promise<SentOutreachRow[]> {
  const rows = await prisma.business.findMany({
    where: {
      outreachStatus: "CONTACTED",
      ...(sentByTeamMemberId
        ? {
            activities: {
              some: { type: "OUTREACH_SENT" as const, performedById: sentByTeamMemberId },
            },
          }
        : {}),
    },
    orderBy: { outreachContactedAt: "desc" },
    take: 30,
    select: {
      id: true,
      businessName: true,
      city: true,
      outreachContactedAt: true,
      promotedSalesLeadId: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    businessName: row.businessName,
    city: row.city,
    contactedAt: row.outreachContactedAt ?? new Date(),
    promoted: row.promotedSalesLeadId !== null,
  }));
}

export interface MyOutreachStats {
  sentToday: number;
  sentLast7Days: number;
  repliesLast7Days: number;
  foundToday: number;
}

/** One team member's own activity - what the Team dashboard shows. */
export async function getMyOutreachStats(teamMemberId: string): Promise<MyOutreachStats> {
  const today = startOfTodayIst();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [sentToday, sentLast7Days, repliesLast7Days, runsToday] = await Promise.all([
    prisma.businessActivity.count({
      where: { type: "OUTREACH_SENT", performedById: teamMemberId, createdAt: { gte: today } },
    }),
    prisma.businessActivity.count({
      where: { type: "OUTREACH_SENT", performedById: teamMemberId, createdAt: { gte: weekAgo } },
    }),
    prisma.businessActivity.count({
      where: { type: "OUTREACH_REPLIED", performedById: teamMemberId, createdAt: { gte: weekAgo } },
    }),
    prisma.leadIntelligenceSearchRun.aggregate({
      where: {
        triggeredById: teamMemberId,
        connectorType: "GOOGLE_PLACES",
        startedAt: { gte: today },
      },
      _sum: { createdCount: true },
    }),
  ]);

  return {
    sentToday,
    sentLast7Days,
    repliesLast7Days,
    foundToday: runsToday._sum.createdCount ?? 0,
  };
}
