import { siteConfig } from "@/config/site";
import { ShareAchievement } from "@/features/sharing/components/share-achievement";
import { internshipCaption } from "@/features/sharing/lib/share-links";
import { getOrCreateReferralCode } from "@/features/referrals/server/queries";
import { courseReferralLink, DEFAULT_REFERRAL_SLUG } from "@/features/referrals/lib/shareable";
import { formatInternId } from "../../lib/id-card";
import { verifyUrlFor } from "../../server/id-card";

/**
 * "Share that you're a Stively intern" - shown in the intern portal once the
 * internship has started. The link goes to the public, verifiable intern page
 * (name, program, validity - nothing private), with a preview card, so a
 * recruiter who clicks it sees a real, checkable credential. The caption also
 * carries the intern's own referral link for the course.
 */
async function InternShare({
  userId,
  track,
}: {
  userId: string;
  track: { sequence: number; title: string };
}) {
  const verifyUrl = verifyUrlFor(formatInternId(track.sequence, track.title));
  const code = await getOrCreateReferralCode(userId);
  const courseUrl = courseReferralLink(siteConfig.productionUrl, DEFAULT_REFERRAL_SLUG, code);

  return (
    <ShareAchievement
      title="Share that you're a Stively intern"
      benefit="Your link opens a verified Stively intern page - recruiters can confirm your internship is real. Add it to your LinkedIn experience too."
      url={verifyUrl}
      caption={internshipCaption({ program: track.title, verifyUrl, courseUrl })}
      shortText={`I've started my ${track.title} at Stively Technologies.`}
    />
  );
}

export { InternShare };
