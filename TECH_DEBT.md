# Tech Debt

Every shortcut, gap, or deferred decision goes here the moment it's identified — not after it's forgotten. Reviewed alongside ROADMAP.md when planning each priority tier.

---

## No rate limiting on auth flows

**Reason:** Login, forgot-password, and resend-verification actions have no throttle. Only the interview-link submission path has a rate limiter today.
**Priority:** P1
**Estimated effort:** ~2 hours (extend the existing `src/features/interviews/server/rate-limit.ts` pattern to `src/actions/auth.ts`)

## `AuditLog` is effectively unused outside one feature

**Reason:** The model exists and is well-designed, but only the lead-intelligence feature ever writes to it. Payment verification, role assignment, and document deletion — all sensitive actions — currently leave no trail.
**Priority:** P1 (payment actions specifically) / P2 (broader coverage)
**Estimated effort:** ~1-2 hours per action site to wire in; ~8-10 hours total for full coverage across sales-crm, client-workspace, and auth role changes.

## `admin/businesses` and `admin/leads` are the same component

**Reason:** `admin/businesses/page.tsx` is explicitly commented as "the same shared list page as Leads, forced to leadType BUSINESS" — two nav items for one feature.
**Priority:** P2
**Estimated effort:** ~2 hours to merge into one filterable/tabbed page and update nav.

## Interview candidate actions trust a bare `interviewId`, not a bound session token

**Reason:** Built for speed during the interview integrity feature — candidates never authenticate, so the actions rely on cuid unguessability rather than a cryptographically bound secret.
**Priority:** P2
**Estimated effort:** ~3-4 hours (issue a per-session token at `InterviewLink` creation, require it on every candidate-facing action).

## Upload validation is size-only, no MIME/extension check

**Reason:** `uploadFile`/`uploadImage` in `src/lib/cloudinary.ts` never validate content-type — callers only enforce file size caps. Not currently exploitable for RCE (Cloudinary hosts off-origin), but nothing stops an arbitrary file type being uploaded and distributed under the Stively domain's document links.
**Priority:** P2
**Estimated effort:** ~2 hours (add an allowlist check before upload across the 3 call sites: documents, attachments, interview recordings).

## Five near-identical activity/audit-log tables

**Reason:** `ActivityLog`, `SalesLeadActivity`, `BusinessActivity`, `InterviewActivityLog`, and `AuditLog` all share the same shape (`type` enum + `description` + `metadata Json?` + `performedBy`) reimplemented per-domain instead of one polymorphic timeline table. Each is individually well-justified in its own doc comments, but the pattern itself is duplicated five times.
**Priority:** P3
**Estimated effort:** ~12-16 hours for a full consolidation (schema migration + rewriting every read/write call site across 5 domains) — real churn for a cosmetic/maintainability win, not urgent.

## Dead notification enum values

**Reason:** `SESSION_REMINDER`, `ASSIGNMENT_DEADLINE`, and `CLIENT_ACCOUNT_INVITED` exist in the `NotificationType` enum but no code path ever fires them. `PROJECT_PAYMENT_DUE` also exists unused but is already scheduled to be wired up (see ROADMAP.md P2).
**Priority:** P3
**Estimated effort:** ~1-2 hours to decide per-type (implement `SESSION_REMINDER` if mentor live sessions justify it, delete the rest) + cleanup.

## Legacy `Enrollment`/`Program` models coexist with `OfferingEnrollment`/`Offering`

**Reason:** Schema's own comments flag these as parallel systems from different eras of the codebase. Not yet confirmed whether the legacy pair can be safely retired or is still load-bearing somewhere.
**Priority:** P2/P3 (investigation first, migration decision after)
**Estimated effort:** ~2-3 hours to fully trace remaining usage before any migration is scoped.

## `DiscoveryForm.salesProjectId` has no real Prisma relation

**Reason:** Added as a plain optional string FK (not a declared `@relation` to `SalesProject`) to avoid a second migration late in the qualified-client-system build. `resendDiscoveryForm` works around it with a manual `salesProject.findUnique` lookup instead of an `include`. Every other FK in this schema has a matching relation - this is the one exception.
**Priority:** P3
**Estimated effort:** ~15 minutes (add `salesProject SalesProject? @relation(...)` + the opposite `SalesProject.discoveryForms DiscoveryForm[]`, one migration, simplify `resendDiscoveryForm` back to a plain `include`).

## Lead qualification auto-links on email/phone match instead of asking

**Reason:** The brief asked for "detect the existing client and offer to link the lead rather than creating a duplicate" - `qualifyBusinessLeadTx` simplifies "offer" to "automatically link," since building a confirmation-dialog UI for a low-volume, pre-first-client flow wasn't worth the scope right now. Safe (an exact email/phone match is unambiguous), just not literally what was asked.
**Priority:** P2
**Estimated effort:** ~2-3 hours (return a "possible duplicate found" result instead of linking silently, add an admin confirm-or-create-new dialog).

## Public `/discovery/[token]` submission has no rate limiting

**Reason:** Unlike the public `/proposal/[token]` actions (which reuse a DB-backed fixed-window limiter), the discovery-form token submission has none - a one-time form fill is a much lower abuse surface than repeated comment/accept actions, so this was judged disproportionate to build now.
**Priority:** P3
**Estimated effort:** ~30 minutes (add the same `rateLimitWindowStart`/`rateLimitCount` fields + reuse `checkProposalRateLimit`'s pattern) if real abuse is ever observed.

## Public `/onboarding/[token]` submission has no rate limiting

**Reason:** Same judgment call as `/discovery/[token]` above - a one-time form fill is a low abuse surface, and this codebase's rate-limit pattern already exists to reuse if it's ever actually needed.
**Priority:** P3
**Estimated effort:** ~30 minutes.

## `OnboardingFormUpload` files have no lifecycle tracking

**Reason:** Unlike `ClientDocument` (archival/versioning, lifecycle status), an onboarding-form upload is just a Cloudinary URL with no expiry/archival concept - fine for one-time kickoff assets (logo, brand guidelines, etc.), but if these ever need to be superseded/re-uploaded with history kept, they don't currently support that.
**Priority:** P3
**Estimated effort:** ~1-2 hours if ever needed (add the same lifecycle fields `ClientDocument` already has).

## Near-duplicate priority enums

**Reason:** `RequestPriority` and `OperationPriority` are structurally identical (both LOW/MEDIUM/HIGH/URGENT) and could have been one shared enum.
**Priority:** P4
**Estimated effort:** ~1 hour.

## WhatsApp Cloud API integration is code-complete but inert (no Meta credentials)

**Reason:** AD-021's `src/lib/whatsapp-cloud-api.ts` and `src/features/whatsapp/**` are fully built, typechecked, and tested against real Groq calls, but no `WHATSAPP_*` environment variable exists in any environment yet - `isWhatsAppSendConfigured()` correctly returns false, so nothing sends or receives until the founder completes the Meta Business/WABA setup and two message templates are submitted and approved. Not a code gap - a manual, external-party setup step.
**Priority:** P1 (blocks the actual revenue feature from doing anything)
**Estimated effort:** Not engineering time - Meta Business Manager setup (~1-2 hours of manual configuration) plus template review turnaround (Meta-controlled, typically under 24h once submitted). See the founder's implementation report for the exact checklist.

## Agency-lead routing is keyword-based, not AI-classified

**Reason:** `classifyAgencyIntent` (`src/features/whatsapp/lib/routing.ts`) is a deliberate, auditable regex match against known agency-intent phrases - chosen over an AI classification call for reliability on a decision this consequential (autonomous AI reply vs. mandatory human handoff). Will miss phrasings that don't match the pattern (e.g. unusual phrasing that never mentions "website"/"app"/"software" by name); the AI reply engine's own `shouldEscalate` field is the second, AI-driven safety net for exactly this gap, but a message that neither matches the keyword pattern nor triggers the AI's own escalation judgment could still get an AI-generated product reply instead of a human handoff.
**Priority:** P2 - revisit once Phase 2 (inbound) has real conversation volume to see how often this gap actually fires.
**Estimated effort:** ~2-3 hours to expand the keyword list from real missed cases, or fold in an AI-classification pass if keyword coverage proves insufficient.

## Retired per-task review columns still on InternshipTask

**Reason:** The intern portal moved to self-managed task progress plus one final submission (AD-039 amendment). `InternshipTask.status`, `liveUrl`, `repoUrl`, `feedback`, `submittedAt`, `reviewedAt`, `reviewedById` and the `InternshipTaskStatus` enum are no longer written by anything (the enum is still reused for `InternshipProject.finalStatus`). Left in place to avoid a destructive migration in the same change.
**Priority:** P3
**Estimated effort:** ~1 hour (drop the unused task columns in one migration; keep the enum).

## Referral payout details are stored in plain text

**Reason:** `ReferralPayoutDetails` holds UPI IDs and bank account numbers unencrypted - the admin needs the real values to send money, and field-level encryption (key management, rotation) was out of scope for Phase 2. Mitigations in place: only the owner sees their own row (account number shown masked after saving), only ADMIN/SUPER_ADMIN can read others' via the admin page and CSV export, payouts store a text snapshot of the destination.
**Priority:** P2 - before payout volume or the number of referrers grows meaningfully.
**Estimated effort:** ~half a day (encrypt `accountNumber`/`upiId` with an app-level key via a small helper; decrypt only in the admin page and CSV route).

## Referral payout is fully manual (no automated disbursement)

**Reason:** AD-035's Referral Program marks a converted referral PAID only after an admin has actually sent the ₹200/₹100 outside the platform (bank transfer/UPI) and confirms it in `/admin/referrals` - no payment-gateway payout integration exists in this codebase (Razorpay here is inbound-only). Fine at low volume; becomes real ongoing admin overhead once referral volume grows.
**Priority:** P2 - revisit once monthly payout count makes manual reconciliation genuinely painful.
**Estimated effort:** ~1-2 days (RazorpayX payout API integration, or equivalent - plus whatever KYC/compliance step a payout API requires that a pure inbound-payment integration never needed).

## Referral Program has minimal fraud detection

**Reason:** (Phase 3 since added flag-only review - shared signup IP, look-alike emails, conversion bursts - plus an admin Pause; see AD-035. Remaining gaps: no device fingerprinting, IPs are shared on mobile/college networks, nothing auto-blocks.) AD-035 blocks the one fraud case that's free to block (self-referral - the referrer and referred-user id are compared and silently dropped at attribution time) and guarantees a person is only ever credited to one referrer (`Referral.referredUserId` is `@unique`). It does not detect a referrer farming the reward via multiple fake email accounts referring themselves under different identities - no device/IP-fingerprint correlation, no velocity limits on signups from one referral code.
**Priority:** P2 - revisit if/when real payout volume shows a suspicious pattern (e.g. one referrer with many low-quality conversions in a short window).
**Estimated effort:** ~4-6 hours for a first pass (flag, don't auto-block - correlate `ReferralClick.ipAddress`/`userAgent` across a referrer's converted referrals, surface a warning badge in `/admin/referrals` for a human to review before paying).

---

*To add an item: one line of what it is, why it exists (usually "no time" or "smaller scope than the ideal solution"), and an honest priority + effort estimate — not an aspirational one.*



Subject: Request to change your internship duration

Hi Vennapusa Siva Lahya,

Thank you for getting in touch, and no problem at all. Choosing the wrong duration by mistake is easy to do, and we can correct it for you.

Because today is a non-working day, your request will be processed on Monday. Please don't worry. It will be resolved by then, and nothing about your internship, project or progress is affected in the meantime. You can carry on working as usual.

Once the update is done, we'll send you a short email to confirm your new 3 months duration and your new end date. Your portal and your Intern ID card will show the updated dates too.

If you have any questions in the meantime, just reply to this email.

Warm regards,
Stively Technologies
team@stively.com | www.stively.com



On Oct 4 2026, at 8:57 am, Vennapusa Siva Lahya <lahyavennapusa0104@gmail.com> wrote:
Good morning,today I am qualified for internship portal and there asked for duration of internship it is by default 1 month and I read terms and conditions so immediately click continue I forget to change internship duration for 3 months.please change my internship duration to 3 months