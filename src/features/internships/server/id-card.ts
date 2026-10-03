import "server-only";

import QRCode from "qrcode";

import { siteConfig } from "@/config/site";
import { formatInternId } from "../lib/id-card";
import { readProjectDetails } from "../lib/stats";
import type { InternshipTrackDetail } from "./queries";
import type { InternIdCardData } from "../components/intern/id-card";

export function verifyUrlFor(internId: string): string {
  // Always the live site: the QR is printed/shared, so it must never encode a localhost or preview URL.
  return `${siteConfig.productionUrl}/verify/intern/${internId}`;
}

/** Everything the ID card shows, derived from the intern's track. Only valid for an onboarded track (it needs the end date). */
export async function buildInternIdCardData(
  user: { name?: string | null; email?: string | null },
  track: InternshipTrackDetail
): Promise<InternIdCardData> {
  const internId = formatInternId(track.sequence, track.title);
  const qrDataUrl = await QRCode.toDataURL(verifyUrlFor(internId), { margin: 1, scale: 6 });
  const details = readProjectDetails(track.project?.details);
  return {
    name: user.name?.trim() || "Intern",
    email: user.email ?? "",
    internId,
    program: track.title,
    validTill: track.endsAt ?? track.startedAt,
    startDate: track.startedAt,
    projectTitle: track.project?.title ?? null,
    stack: details.stack ?? [],
    status: track.status,
    qrDataUrl,
  };
}
