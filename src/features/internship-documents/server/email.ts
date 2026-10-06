import "server-only";

import { resend, EMAIL_FROM } from "@/lib/resend";
import { siteConfig } from "@/config/site";
import { prisma } from "@/lib/prisma";
import { internshipDocumentCaption, linkedinShareUrl } from "@/features/sharing/lib/share-links";
import { documentVerificationUrl, firstName, longDate } from "../lib/documents";
import { renderInternshipDocumentPdf } from "./render";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Emails an intern their offer letter (PDF attached) and nudges them to share
 * it on LinkedIn, mentioning Stively Technologies. Returns whether it was sent.
 */
export async function sendOfferLetterEmail(documentNumber: string): Promise<boolean> {
  const doc = await prisma.internshipDocument.findUnique({
    where: { documentNumber },
    include: { track: { select: { student: { select: { email: true } } } } },
  });
  if (!doc || doc.kind !== "OFFER_LETTER" || doc.status !== "ISSUED") return false;
  const to = doc.track.student.email;
  if (!to) return false;

  const pdf = await renderInternshipDocumentPdf(doc);
  const verifyUrl = documentVerificationUrl(doc.documentNumber);
  const caption = internshipDocumentCaption({
    kind: "OFFER_LETTER",
    program: doc.program,
    verifyUrl,
  }).replace("Stively Technologies.", "@Stively Technologies.");
  const documentsUrl = `${siteConfig.productionUrl}/intern/documents`;
  const name = escapeHtml(firstName(doc.recipientName));

  const html = `<div style="font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.6;color:#0F172A;max-width:560px">
<p>Hi ${name},</p>
<p>Welcome aboard! Your official <strong>Offer Letter</strong> for the <strong>${escapeHtml(doc.program)}</strong> at Stively Technologies is attached to this email (reference <strong>${escapeHtml(doc.documentNumber)}</strong>, dated ${longDate(doc.issuedAt)}).</p>
<p>You can always view, download and verify it from your <a href="${documentsUrl}">Documents</a> page in the Intern Portal. Your completion certificate, letter of recommendation and experience letter will appear there once your final project has been reviewed.</p>
<p style="margin-top:20px"><strong>One small ask - share it on LinkedIn 🚀</strong><br>
Recruiters check LinkedIn first, and a verified offer letter shows you are building real work. Post it and mention <strong>Stively Technologies</strong> so we can cheer you on:</p>
<ol style="padding-left:20px">
<li>Open <a href="${documentsUrl}">Documents</a> and tap <em>Share as a LinkedIn post</em> (the caption is copied for you), or use the button below.</li>
<li>Attach the PDF or a screenshot of your offer letter.</li>
<li>Tag <strong>Stively Technologies</strong> in the post.</li>
</ol>
<p style="background:#F1F5F9;border-radius:12px;padding:12px 16px;font-size:14px;white-space:pre-line">${escapeHtml(caption)}</p>
<p><a href="${linkedinShareUrl(verifyUrl)}" style="display:inline-block;background:#0A66C2;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-weight:600">Share on LinkedIn</a>
&nbsp; <a href="${documentsUrl}" style="display:inline-block;background:#2B59E6;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-weight:600">Open my documents</a></p>
<p>If anything looks wrong, just reply to this email.</p>
<p>Warm regards,<br>Stively Technologies<br><a href="mailto:team@stively.com">team@stively.com</a> | <a href="https://www.stively.com">www.stively.com</a></p>
</div>`;

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: "Your Stively internship offer letter",
      html,
      attachments: [{ filename: `${doc.documentNumber}.pdf`, content: pdf }],
    });
    if (result.error) {
      console.error("sendOfferLetterEmail: Resend rejected the email:", result.error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("sendOfferLetterEmail failed:", error);
    return false;
  }
}
