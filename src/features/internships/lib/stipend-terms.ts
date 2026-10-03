/**
 * Stipend eligibility terms - gates the ₹3,000/project internship payout
 * specifically, never the course itself. Everyone who completes the course
 * gets their certificate, offer letter, and internship track regardless -
 * these terms only decide who gets PAID for a delivered project, which is
 * the one part of this program real money rides on and the one part real
 * fraud risk (AI-generated submissions, copy-pasted projects) actually
 * threatens.
 */
export const STIPEND_TERMS_VERSION = "2026-10-03";

export const STIPEND_TERMS_TEXT = `Stively Technologies — Internship Stipend Terms & Conditions
Last updated: October 3, 2026

These terms apply only to the paid internship stipend (₹3,000 per approved project) offered after completing Stively's Frontend Development training. They do not apply to, and never affect, your access to the course itself, your Training Certificate, your Internship Offer Letter, your Internship Completion Certificate, your Letter of Recommendation, or your Experience Letter — every enrolled student who completes the course receives all of these regardless of whether they ever submit a project for the stipend.

1. Who this applies to
These terms apply to any student enrolled in Stively's Frontend Development training who chooses to work on a real client-style project through their Internship Dashboard in order to earn the ₹3,000 per-project stipend.

2. Original work only - zero AI use
1. The project you submit for the stipend must be 100% your own original work, written and built by you, with no AI assistance of any kind. Our standard is zero percent AI-generated or AI-assisted work, not "mostly yourself".
2. You MAY use what any developer uses to look things up: your code editor with its normal non-AI features, official documentation, MDN, Stack Overflow, the lessons and materials of the Stively course itself, and Git/GitHub for version control.
3. You may NOT use any AI tool on the project, for any part of it. This includes, without limitation: chat assistants (ChatGPT, Claude, Gemini, Grok, DeepSeek, Perplexity, and similar); AI coding assistants and AI-enabled editors or extensions (GitHub Copilot, Cursor, Windsurf, Codeium, Tabnine, Amazon Q, Replit AI, v0, Bolt, Lovable, and similar); and AI autocomplete or "tab-complete" features. It covers generating, completing, rewriting, refactoring, debugging, reviewing or explaining your project's code, layout, logic, styling or tests; and also generating your README, copy, comments, commit messages, images, icons or design. Pasting your project code into an AI tool to ask what is wrong with it counts as use.
4. The AI Tutor inside your Stively lessons exists to help you learn the course material. It must not be used on your stipend project.
5. You may NOT copy another student's project, a public template, a tutorial's finished code or any third-party codebase and submit it as your own. Using a standard library or framework (for example React) as intended is fine; copying a finished application is not.
6. Your repository must show real, progressive work: meaningful commits over the days you worked, on feature branches, as described in your project brief. A repository whose code arrives in one or a few large commits, or whose history does not match the work submitted, is treated as evidence for review under Section 4.
7. Stively may, at any point before or after a stipend payout, ask you to explain your code, walk through it live with a mentor, or make a small change to it on the spot. Being unable to reasonably explain, reproduce or modify your own submitted code is treated as a violation of this section.
8. If Stively finds, or reasonably concludes on the evidence, that any part of the project was produced with AI assistance or copied, you are not eligible for the stipend for that project. See Section 6.

3. One final submission per project
1. Each assigned project may be submitted for stipend review exactly once as a final submission.
2. Before your final submission, you may revise and improve your work as many times as you like.
3. Once you mark a project as your final submission (with its live URL and GitHub repository URL, as required by the Internship Dashboard), that submission is what gets reviewed - you cannot submit a second, different final version of the same project to try again after a rejection, except where a mentor explicitly requests changes and invites a resubmission (see Section 4).
4. Submit only when you're genuinely done - take your time before marking anything final.

4. Mentor review
1. Every final submission is reviewed by a Stively mentor before any stipend is approved or paid.
2. Review includes, at minimum: confirming the project meets the stated requirements for that project brief, checking that pagination, navigation, and core user flows actually work as specified, testing responsiveness and basic functionality, and a check for AI-assisted or copied work per Section 2 - including a review of your commit history, comparison against known public code, and, where the mentor considers it necessary, a live walkthrough of your code. No automated detector is perfectly reliable, so a mentor's decision is based on all of this evidence together, not on one tool's score.
3. A mentor may approve the submission, or request specific changes before it can be approved. If changes are requested, you'll receive clear feedback on what to fix and may resubmit once those specific changes are made.
4. A mentor's decision on whether a submission meets these terms is final.

5. Project must match the requirements
Your submission must implement the features and pages described in the project brief given to you (for example: the required pages, product listing/filtering/sorting, cart and checkout flow, responsive design across mobile/tablet/desktop, form validation, and the other requirements listed in your assigned brief). A submission that is substantially incomplete, broken, or that doesn't match the brief will not be approved for stipend, regardless of code quality.

6. When the stipend is actually paid
1. The ₹3,000 stipend becomes payable only after a mentor has approved your final submission under Sections 2-5 above.
2. Stively pays approved stipends manually (bank transfer/UPI) - this is not an automated, instant payout. You'll be notified once your payout is sent.
3. Any violation of Section 2 - any AI-assisted work, copied work, or inability to explain your own code - makes you ineligible for the stipend for that project. No stipend is paid for it, and if it was already paid, Stively may reverse the approval and require the amount to be returned. A repeated or deliberate violation (for example, submitting AI-generated work after a warning, or using multiple accounts) makes you ineligible for all future stipends under this program.
4. A finding of ineligibility affects the stipend only. It does not change your access to the course, your Training Certificate, or any other document described in Section 8.

7. No guarantee of project availability or payout amount
1. Project assignment, pacing, and the number of projects available to any individual intern are at Stively's discretion and are not guaranteed.
2. The ₹3,000 figure applies per approved project under the Frontend Development track as published at the time of your enrollment; Stively may change this rate for future cohorts, which will never retroactively affect a project you already had approved.

8. Everything else about your training stays unaffected
To be unambiguous: your course access, lessons, quizzes, Training Certificate, Internship Offer Letter, Internship Completion Certificate, Letter of Recommendation, and Experience Letter are governed entirely by completing the training itself, not by anything in this document. Whether or not you ever attempt a stipend project, or whether a submission is approved or rejected, has no effect on any of those.

9. Changes to these terms
Stively may update these terms from time to time as the internship program evolves. The version you accept when you start your internship is the version that governs any project you submit under that internship, unless a later update is required by law or clearly communicated to you in advance. Whichever version applies, these terms always require 100% original work with no AI assistance.

10. Contact
Questions about these terms, or about a specific review decision, can be sent to team@stively.com.

Stively Technologies — UDYAM-RJ-17-0578717 — www.stively.com`;
