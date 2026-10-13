"use server";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  leadSchema,
  contactEnquirySchema,
  startProjectLeadSchema,
  START_PROJECT_TIMELINE_LABEL,
  type LeadInput,
} from "@/lib/validations/lead";
import { verifyTurnstile } from "@/lib/turnstile";
import { notifyAllAdmins } from "@/features/notifications/server/creation";
import { notifyNewLeadCreated } from "@/features/leads/server/notify";
import { RECENT_LEAD_EMAIL_COOKIE } from "@/lib/auth-constants";

export type ActionResult = { success: true } | { success: false; error: string };

/**
 * Single server action behind Contact, Program Interest, and Careers forms.
 * The `source` field is what differentiates them - one code path, one table,
 * per the Phase A decision to avoid four near-identical Lead-like models.
 */
export async function submitLead(input: LeadInput): Promise<ActionResult> {
  const parsed = leadSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const lead = await prisma.lead.create({ data: parsed.data as Prisma.LeadUncheckedCreateInput });

    try {
      await notifyNewLeadCreated(lead);
    } catch (error) {
      console.error("notifyNewLeadCreated failed:", error);
    }

    // Carries the email forward to /register (prefill, never lock - see
    // AD-017) if this same browser comes back later to create an account.
    // 30 days: long enough to cover "inquired, thought about it, signed up
    // a few weeks later," short enough that a shared/public device doesn't
    // keep suggesting a stale email indefinitely.
    if (lead.email) {
      const store = await cookies();
      store.set(RECENT_LEAD_EMAIL_COOKIE, lead.email, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "lax",
      });
    }

    return { success: true };
  } catch (error) {
    // The same business submitting /start-project again (email is now required,
    // so repeats are easy to spot) is a repeat enquiry, not an error: keep the
    // one lead, refresh it with the latest answers and tell the team.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      parsed.data.source === "START_PROJECT" &&
      parsed.data.email
    ) {
      return recordRepeatStartProjectEnquiry(parsed.data);
    }
    console.error("submitLead failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

async function recordRepeatStartProjectEnquiry(input: LeadInput): Promise<ActionResult> {
  try {
    const existing = await prisma.lead.findFirst({
      where: { email: input.email, leadType: input.leadType ?? "STUDENT" },
    });
    if (!existing) return { success: false, error: "Something went wrong. Please try again." };

    const previous = existing.metadata && typeof existing.metadata === "object" ? (existing.metadata as Record<string, unknown>) : {};
    await prisma.lead.update({
      where: { id: existing.id },
      data: {
        lastEnquiryAt: new Date(),
        phone: input.phone,
        metadata: { ...previous, ...(input.metadata ?? {}) } as Prisma.InputJsonValue,
        ...(input.message ? { message: input.message } : {}),
      },
    });
    await prisma.leadHistory.create({
      data: {
        leadId: existing.id,
        eventType: "RE_ENQUIRY",
        description: "Submitted the start-project form again with the same email.",
      },
    });
    await notifyAllAdmins({
      type: "LEAD_NEW_INBOUND",
      title: "Repeat enquiry",
      body: `${existing.name} filled in the start-project form again.`,
      link: `/admin/leads/${existing.id}`,
    }).catch((error) => console.error("repeat enquiry notification failed:", error));
    return { success: true };
  } catch (error) {
    console.error("recordRepeatStartProjectEnquiry failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export type ContactFormState = ActionResult | null;

/**
 * Adapter for the Contact page's two-mode form, built for React 19's
 * useActionState (hence the (prevState, formData) signature). Validates the
 * richer Student/Business shape (src/lib/validations/lead.ts), then composes
 * it down into the flat LeadInput shape `submitLead` already accepts and
 * calls that function directly - no duplicated create/error-handling logic.
 *
 * `leadType`/`companyName` are passed straight through to the real Lead
 * columns of the same name (fixed from an earlier version of this function
 * that only folded them into the message text, which left every enquiry -
 * student or business - defaulting to leadType STUDENT and never showing
 * up under /admin/businesses). `programInterest` still has nowhere real to
 * land (no free-text column, and matching it to a real Program without a
 * live dropdown is out of scope), so that one stays folded into the message.
 */
export async function submitContactEnquiry(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const raw = {
    enquiryType: formData.get("enquiryType"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    message: formData.get("message"),
    programInterest: formData.get("programInterest") || undefined,
    companyName: formData.get("companyName") || undefined,
  };

  const parsed = contactEnquirySchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check your details and try again.",
    };
  }

  const data = parsed.data;

  // programId stays unset: there's no reliable way to match free-text
  // "program interest" to a real Program row without reintroducing a
  // dropdown backed by a live query, which is out of scope here.
  const message =
    data.enquiryType === "STUDENT" && data.programInterest
      ? `Program of interest: ${data.programInterest}\n\n${data.message}`
      : data.message;

  return submitLead({
    name: data.name,
    email: data.email,
    phone: data.phone,
    message,
    source: "CONTACT_FORM",
    leadType: data.enquiryType,
    companyName: data.enquiryType === "BUSINESS" ? data.companyName : undefined,
  });
}

export type StartProjectFormState = ActionResult | null;

/** Representative rupee value (paise) per budget bracket - a pipeline-value
 * estimate for reporting, not a quote. Matches the ₹*100 convention every
 * other estimatedValue in this codebase uses. */
const BUDGET_ESTIMATED_VALUE: Record<string, number> = {
  UNDER_10K: 5_000 * 100,
  "10K_25K": 17_500 * 100,
  "25K_50K": 37_500 * 100,
  "50K_1L": 75_000 * 100,
  "1L_PLUS": 150_000 * 100,
};

/**
 * Adapter for the /start-project Google Ads landing page. Validates the
 * trimmed ad-landing shape (src/lib/validations/lead.ts - name, phone,
 * service, budget required; email optional), folds service/budget into
 * Lead.metadata Json (there's no dedicated column for either - mirrors how
 * OfferingRequest.details Json already holds page-specific wizard data),
 * and calls submitLead.
 */
export async function submitStartProjectLead(
  _prevState: StartProjectFormState,
  formData: FormData
): Promise<StartProjectFormState> {
  const raw = {
    fullName: formData.get("fullName"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone"),
    callbackPreference: formData.get("callbackPreference") || undefined,
    service: formData.get("service") || undefined,
    budget: formData.get("budget") || undefined,
    businessName: formData.get("businessName"),
    businessType: formData.get("businessType"),
    timeline: formData.get("timeline") || undefined,
    details: formData.get("details") || undefined,
  };

  // Honeypot: a hidden field real visitors never see or fill. Bots that fill
  // every input trip it - answer "success" so they don't retry, store nothing.
  if (
    typeof formData.get("companyWebsite") === "string" &&
    String(formData.get("companyWebsite")).trim() !== ""
  ) {
    return { success: true };
  }

  const parsed = startProjectLeadSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check your details and try again.",
    };
  }

  // Bot check (Cloudflare Turnstile), after the cheap field validation so a
  // visitor fixing a typo isn't made to wait for a new token unnecessarily.
  // Skipped (with a warning) until the keys are configured - see lib/turnstile.ts.
  const humanToken = formData.get("cf-turnstile-response");
  if (!(await verifyTurnstile(typeof humanToken === "string" ? humanToken : null))) {
    return {
      success: false,
      error:
        "We couldn't confirm you're human. Please wait a moment and try again, or message us on WhatsApp.",
    };
  }

  const data = parsed.data;

  return submitLead({
    name: data.fullName,
    email: data.email,
    phone: data.phone,
    source: "START_PROJECT",
    leadType: "BUSINESS",
    companyName: data.businessName,
    message: data.details,
    metadata: {
      service: data.service,
      budget: data.budget,
      callbackPreference: data.callbackPreference,
      businessType: data.businessType,
      ...(data.timeline ? { timeline: START_PROJECT_TIMELINE_LABEL[data.timeline] } : {}),
    },
    estimatedValue: BUDGET_ESTIMATED_VALUE[data.budget],
    acquisitionChannel: "GOOGLE_ADS",
  });
}
