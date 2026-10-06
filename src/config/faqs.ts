/**
 * Homepage FAQ. Answers follow the published Terms of Service and Refund
 * Policy and are deliberately conservative. Anything a founder still has to
 * decide is flagged in `needsConfirmation` (not shown to visitors).
 */
export interface FaqItem {
  question: string;
  answer: string;
  /** Internal: a founder should confirm this answer. */
  needsConfirmation?: boolean;
}

export const HOME_FAQS: FaqItem[] = [
  {
    question: "How long does a website take?",
    answer:
      "It depends on scope. A focused business website is typically a matter of weeks, and a custom web application takes longer. You get a written timeline in your proposal before any work starts, and progress is visible at each stage.",
    needsConfirmation: true,
  },
  {
    question: "How does payment work?",
    answer:
      "You receive a fixed written estimate first. Custom projects are paid in milestones - an advance to begin, then further payments tied to delivered phases. The exact structure is confirmed in writing before work starts.",
  },
  {
    question: "Who owns the code?",
    answer:
      "You own the final deliverables - the source code, design files and content created for you - once the project is paid in full. Content and brand assets you provide stay yours, and third-party tools keep their own licences.",
  },
  {
    question: "What happens after launch?",
    answer:
      "We stay involved. Each package includes a support period after launch, and ongoing maintenance can be agreed separately, because software needs upkeep rather than a one-time handoff.",
  },
  {
    question: "Do you work with small businesses?",
    answer:
      "Yes - most of the websites we build are for small and growing businesses. If a simpler or cheaper option would genuinely suit you better than custom work, we will say so on the first call.",
  },
  {
    question: "What is not included in the price?",
    answer:
      "Hosting and domain costs, third-party licences and subscriptions, written content unless the package says otherwise, and work beyond the agreed scope or support period. Any change to scope is quoted before the work starts.",
  },
];
