/**
 * The one place a course's certificate identity is configured - adding
 * certificates to a future course is one new entry here, never a schema
 * change or new code path. Keyed by Offering.slug since that's the stable,
 * human-chosen identifier every course already has.
 */
export interface CourseCertificateConfig {
  /** Short code used in the public certificate number, e.g. "STV-GAI-2026-000001". */
  prefix: string;
  /** The course name snapshotted onto every certificate issued for this course - independent of the Offering's own title, so a later course rename never rewrites history. */
  courseName: string;
  /** The formal, certificate-register description printed under the course name - distinct from the marketing shortDescription used elsewhere, since a certificate reads differently than an ad. */
  description: string;
  /** Exactly 5 short labels for the certificate's skill-badge row (template-01.tsx's SKILL_ICONS, paired by index - fixed icon order, course-specific text only). */
  skills: readonly string[];
  /** The gold seal's subtitle, e.g. "FRONTEND DEVELOPMENT" - keep it short, it's set in small caps on a fixed-width seal. */
  sealSub: string;
}

export const COURSE_CERTIFICATE_CONFIG: Record<string, CourseCertificateConfig> = {
  "generative-ai-prompt-engineering": {
    prefix: "GAI",
    courseName: "Generative AI & Prompt Engineering Certification Course",
    description:
      "Awarded in recognition of demonstrated proficiency in Generative AI and prompt engineering - earned through a structured, assessment-based curriculum spanning core AI concepts, practical prompt design, and real-world application, with every module verified by a graded assessment.",
    skills: [
      "AI Fundamentals\n& Tools",
      "Prompt\nEngineering",
      "Practical Projects\n& Workflows",
      "Real-world\nUse Cases",
      "Career Guidance\n& Opportunities",
    ],
    sealSub: "GENERATIVE AI & PROMPT ENGINEERING",
  },
  "frontend-development": {
    prefix: "FED",
    courseName: "Frontend Development Training Program",
    description:
      "Awarded in recognition of demonstrated proficiency in frontend web development - earned through a structured, assessment-based curriculum spanning HTML, CSS, JavaScript and React, with every module verified by a graded assessment.",
    skills: [
      "HTML, CSS\n& JavaScript",
      "React\nComponents",
      "Practical Projects\n& Workflows",
      "Git & GitHub\nWorkflow",
      "Career Guidance\n& Opportunities",
    ],
    sealSub: "FRONTEND DEVELOPMENT",
  },
};

/** Null means this course doesn't issue certificates (yet) - callers must treat that as "not eligible," never fall back to a guessed prefix. */
export function getCourseCertificateConfig(offeringSlug: string): CourseCertificateConfig | null {
  return COURSE_CERTIFICATE_CONFIG[offeringSlug] ?? null;
}
