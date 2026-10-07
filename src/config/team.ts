/**
 * Founders and team shown on the About page and (compact) on the homepage.
 * EMPTY UNTIL REAL DETAILS EXIST - no invented names, bios or photos.
 * To publish, add entries like:
 *
 *   { name: "Abhijit Karande", role: "Founder & CEO", bio: "One real line.",
 *     photo: "/team/abhijit.jpg", linkedin: "https://www.linkedin.com/in/..." }
 *
 * While the array is empty both sections render nothing.
 */
export interface TeamMemberData {
  name: string;
  role: string;
  /** One line of real background. */
  bio: string;
  /** Public path, e.g. /team/name.jpg. Initials are shown when omitted. */
  photo?: string;
  linkedin?: string;
}

export const TEAM: TeamMemberData[] = [];

/** e.g. "Based in India. Working with clients across Rajasthan and Maharashtra." - leave empty until real. */
export const TEAM_LOCATION_LINE = "";

/**
 * The founder, shown on the About page. Name and role are confirmed. `photo`
 * and `linkedin` are optional slots: drop a photo in /public/founder (NOT /public/team - that URL prefix is the protected team portal) and set the
 * path (e.g. "/team/abhijit.jpg"), and add his personal LinkedIn URL, and
 * they appear on the About page automatically - until then the page shows
 * initials and no link (no placeholder image, no wrong link).
 */
export const FOUNDER: { name: string; role: string; photo?: string; linkedin?: string } = {
  name: "Abhijit Karande",
  role: "Founder & CEO, Stively",
  photo: "/founder/abhijit.webp",
  linkedin: undefined, // [FOUNDER TO SET] e.g. "https://www.linkedin.com/in/..."
};
