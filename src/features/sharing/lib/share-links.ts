/**
 * Share-intent URLs for the platforms a learner is likely to post an
 * achievement on. Pure functions (no server-only imports) so both the server
 * (building captions/links) and the client component can use them.
 *
 * Nothing here can verify that someone actually posted - these are plain
 * links the platform opens. That is exactly why sharing is NOT tied to any
 * reward: a point or discount for "I clicked share" would be trivially gamed.
 */
const enc = encodeURIComponent;

/** LinkedIn's share dialog. LinkedIn ignores any prefilled text (their rule), so the caption is copied to the clipboard for pasting. */
export function linkedinShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;
}

/**
 * LinkedIn's official "Add to profile" form for Licenses & Certifications,
 * prefilled. This is the high-value one for the learner: it puts the
 * certificate on their actual profile (where recruiters look), with the
 * credential ID and a verification link recruiters can click.
 */
export function linkedinCertificateUrl(params: {
  name: string;
  organizationName: string;
  issuedAt: Date;
  certUrl: string;
  certId: string;
}): string {
  const q = [
    "startTask=CERTIFICATION_NAME",
    `name=${enc(params.name)}`,
    `organizationName=${enc(params.organizationName)}`,
    `issueYear=${params.issuedAt.getFullYear()}`,
    `issueMonth=${params.issuedAt.getMonth() + 1}`,
    `certUrl=${enc(params.certUrl)}`,
    `certId=${enc(params.certId)}`,
  ].join("&");
  return `https://www.linkedin.com/profile/add?${q}`;
}

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${enc(text)}`;
}

export function twitterShareUrl(text: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`;
}

export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
}

/** Caption for a certificate post. The verify link lets anyone (a recruiter) confirm it is genuine; the course link is the sharer's own referral link, so friends who enrol credit them. */
export function certificateCaption(params: {
  courseName: string;
  verifyUrl: string;
  courseUrl?: string;
}): string {
  const lines = [
    `I just completed the ${params.courseName} at Stively Technologies and earned a verified certificate. 🎓`,
    "",
    `Verify it here: ${params.verifyUrl}`,
  ];
  if (params.courseUrl) lines.push("", `Want to learn it too? ${params.courseUrl}`);
  lines.push("", "#Stively #LearnToCode #CareerGrowth");
  return lines.join("\n");
}

/** Caption for sharing an internship document (offer letter, completion certificate, recommendation, experience letter). */
export function internshipDocumentCaption(params: {
  kind: "OFFER_LETTER" | "INTERNSHIP_CERTIFICATE" | "LETTER_OF_RECOMMENDATION" | "EXPERIENCE_LETTER";
  program: string;
  verifyUrl: string;
  courseUrl?: string;
}): string {
  const lead = {
    OFFER_LETTER: `I've received my offer letter for the ${params.program} at Stively Technologies. 🚀`,
    INTERNSHIP_CERTIFICATE: `I've completed the ${params.program} at Stively Technologies and earned my internship completion certificate. 🎓`,
    LETTER_OF_RECOMMENDATION: `I've received a letter of recommendation from Stively Technologies for my ${params.program}. 🌟`,
    EXPERIENCE_LETTER: `I've received my experience letter from Stively Technologies for my ${params.program}. 💼`,
  }[params.kind];
  const lines = [lead, "", `Verify it here: ${params.verifyUrl}`];
  if (params.courseUrl) lines.push("", `Want to do it too? ${params.courseUrl}`);
  lines.push("", "#Stively #Internship #Frontend #LearnToCode");
  return lines.join("\n");
}

export function internshipCaption(params: {
  program: string;
  verifyUrl: string;
  courseUrl?: string;
}): string {
  const lines = [
    `I've started my ${params.program} at Stively Technologies - building a real client-style project and earning a stipend as I learn. 🚀`,
    "",
    `Verified Stively intern: ${params.verifyUrl}`,
  ];
  if (params.courseUrl) lines.push("", `Want to do it too? ${params.courseUrl}`);
  lines.push("", "#Stively #Internship #Frontend #LearnToCode");
  return lines.join("\n");
}
