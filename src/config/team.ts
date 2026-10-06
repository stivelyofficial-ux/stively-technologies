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
