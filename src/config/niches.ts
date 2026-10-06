/**
 * "Who we build for" - data-driven so the first target niche can change
 * without touching components. Each entry points at a real concept demo (a
 * /work page) where one exists, otherwise at /services.
 */
export interface Niche {
  title: string;
  outcome: string;
  href: string;
  /** lucide icon name, resolved in the component. */
  icon: "stethoscope" | "dumbbell" | "armchair" | "rocket";
}

export const NICHES: Niche[] = [
  {
    title: "Clinics & healthcare",
    outcome: "Websites that turn Google searches into booked appointments.",
    href: "/work/lumina-dental-care",
    icon: "stethoscope",
  },
  {
    title: "Gyms & fitness",
    outcome: "Membership and class-booking sites that fill your schedule.",
    href: "/work/iron-forge-fitness",
    icon: "dumbbell",
  },
  {
    title: "Interior & design studios",
    outcome: "Portfolio sites that win enquiries from the right clients.",
    href: "/work/novanest-interiors",
    icon: "armchair",
  },
  {
    title: "Startups & MVPs",
    outcome: "A working first version, launched fast, built to grow after.",
    href: "/services",
    icon: "rocket",
  },
];
