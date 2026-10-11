"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarClock,
  ChevronDown,
  Lock,
  Mail,
  MessageCircle,
  MessageSquareText,
  Phone,
  User,
} from "lucide-react";

import { submitStartProjectLead, type StartProjectFormState } from "@/actions/leads";
import {
  START_PROJECT_SERVICES,
  START_PROJECT_SERVICE_LABEL,
  START_PROJECT_BUDGETS,
  START_PROJECT_BUDGET_LABEL,
  START_PROJECT_TIMELINES,
  START_PROJECT_TIMELINE_LABEL,
} from "@/lib/validations/lead";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { markStartProjectConversionPending } from "@/lib/conversion-tracking";
import { Button } from "@/components/ui/button";
import { TurnstileBox, TURNSTILE_ENABLED } from "@/components/forms/turnstile-box";

/** Every field uses the same high-contrast box: a visible 1.5px border and a leading icon, so the form reads clearly on the light card. */
const FIELD_BOX =
  "border-foreground/25 bg-background focus-within:border-primary focus-within:ring-primary/20 flex items-center gap-2.5 rounded-xl border-[1.5px] px-3.5 transition-colors focus-within:ring-4";
const FIELD_CONTROL =
  "placeholder:text-muted-foreground/80 text-foreground min-h-11 w-full min-w-0 bg-transparent text-[15px] outline-none";

function Field({
  id,
  label,
  required = false,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-foreground text-sm font-semibold">
        {label}
        {required && (
          <span className="text-destructive ml-0.5" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="text-muted-foreground ml-1 font-normal">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

function PillGroup<T extends string>({
  name,
  options,
  labels,
  value,
  onChange,
  required = false,
}: {
  name: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T | "";
  onChange: (value: T) => void;
  /** Renders every radio in the group `required` - the HTML radio-group
   *  semantics mean the browser blocks submit with a native tooltip until
   *  one is checked, no server round-trip needed to catch it. */
  required?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((option) => (
        <label
          key={option}
          className={`has-focus-visible:ring-primary/40 cursor-pointer rounded-xl border-[1.5px] px-3.5 py-2 text-sm font-medium transition-colors duration-150 has-focus-visible:ring-4 ${
            value === option
              ? "border-primary bg-primary/10 text-primary"
              : "border-foreground/25 text-foreground/80 hover:border-foreground/50 hover:bg-accent hover:text-foreground"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            required={required}
            className="sr-only"
          />
          {labels[option]}
        </label>
      ))}
    </div>
  );
}

/**
 * The /start-project ad-landing page's lead form. Field order follows the
 * founder's 2026-10 redesign: contact basics, then the business details a rep
 * uses to tell a real prospect from a fake one (business name, what it does),
 * then the qualifying signals (service, budget - both required; timeline and
 * extra details optional). Service/budget render as clickable pill groups
 * rather than a native <select> so what the visitor wants and can spend is
 * visible at a glance. Submission is guarded by a hidden honeypot field (see
 * submitStartProjectLead) rather than a CAPTCHA/OTP, which would need an SMS
 * provider and reCAPTCHA keys this project does not have yet.
 */
export interface StartProjectFormProps {
  /** Prefilled (never locked - the visitor can still change it) when a logged-in CLIENT reaches this page directly, so their portal account's email is the one this Lead gets created with, instead of drifting into a second, unlinked identity. */
  defaultEmail?: string;
}

function StartProjectForm({ defaultEmail }: StartProjectFormProps = {}) {
  const router = useRouter();
  // Defaults to Website - the first Google Ads campaign targets web
  // development search terms specifically, so most visitors landing here
  // already want this; pre-selecting it removes a click for them while
  // still letting anyone pick a different service.
  const [service, setService] = React.useState<(typeof START_PROJECT_SERVICES)[number] | "">(
    "WEBSITE"
  );
  const [budget, setBudget] = React.useState<(typeof START_PROJECT_BUDGETS)[number] | "">("");
  const [state, formAction, isPending] = useActionState<StartProjectFormState, FormData>(
    submitStartProjectLead,
    null
  );
  // The bot check finishes in the background within a second or two; the submit button waits for it.
  const [humanToken, setHumanToken] = React.useState("");
  const waitingForHumanCheck = TURNSTILE_ENABLED && !humanToken;

  // Navigates to a dedicated URL (rather than swapping in an inline
  // confirmation) so Google Ads/GA4 can track "reached /thank-you" as a
  // real, reliable conversion event - the industry-standard approach for
  // lead-gen funnels. @next/third-parties' GoogleAnalytics component
  // already fires a pageview on App Router client-side navigation, so no
  // manual gtag call is needed for that. The Google Ads *conversion* event
  // itself is a separate, explicit fire on the /thank-you side (see
  // StartProjectConversion) - markStartProjectConversionPending() here is
  // only the handoff signal proving this navigation really followed a
  // successful submission, not a direct visit to /thank-you.
  React.useEffect(() => {
    if (state?.success) {
      markStartProjectConversionPending();
      router.push("/thank-you");
    }
  }, [state, router]);

  if (state?.success) {
    return (
      <div aria-live="polite" className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="border-primary/30 border-t-primary size-8 animate-spin rounded-full border-2" />
        <p className="text-muted-foreground text-sm">Redirecting…</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="fullName" label="Full Name" required>
          <div className={FIELD_BOX}>
            <User className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
            <input
              id="fullName"
              name="fullName"
              required
              autoComplete="name"
              placeholder="Your full name"
              className={FIELD_CONTROL}
            />
          </div>
        </Field>
        <Field id="phone" label="Phone Number" required>
          <div className={FIELD_BOX}>
            <Phone className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              required
              autoComplete="tel"
              placeholder="+91 98765 43210"
              className={FIELD_CONTROL}
            />
          </div>
        </Field>
      </div>

      <Field id="email" label="Email" optional>
        <div className={FIELD_BOX}>
          <Mail className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={defaultEmail}
            placeholder="you@example.com"
            className={FIELD_CONTROL}
          />
        </div>
      </Field>

      <Field id="businessName" label="Business Name" required>
        <div className={FIELD_BOX}>
          <Building2 className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
          <input
            id="businessName"
            name="businessName"
            required
            autoComplete="organization"
            placeholder="Your company or brand name"
            className={FIELD_CONTROL}
          />
        </div>
      </Field>

      <Field id="businessType" label="What does your business do?" required>
        <div className={FIELD_BOX}>
          <Briefcase className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
          <input
            id="businessType"
            name="businessType"
            required
            placeholder="e.g. Online clothing store, coaching institute, real estate"
            className={FIELD_CONTROL}
          />
        </div>
      </Field>

      <div className="flex flex-col gap-2">
        <span className="text-foreground text-sm font-semibold">
          Which service do you need?
          <span className="text-destructive ml-0.5" aria-hidden="true">
            *
          </span>
        </span>
        <PillGroup
          name="service"
          options={START_PROJECT_SERVICES}
          labels={START_PROJECT_SERVICE_LABEL}
          value={service}
          onChange={setService}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-foreground text-sm font-semibold">
          Estimated Budget
          <span className="text-destructive ml-0.5" aria-hidden="true">
            *
          </span>
        </span>
        <PillGroup
          name="budget"
          options={START_PROJECT_BUDGETS}
          labels={START_PROJECT_BUDGET_LABEL}
          value={budget}
          onChange={setBudget}
          required
        />
      </div>

      <Field id="timeline" label="Preferred Timeline" optional>
        <div className={`${FIELD_BOX} relative`}>
          <CalendarClock className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
          <select
            id="timeline"
            name="timeline"
            defaultValue=""
            className={`${FIELD_CONTROL} appearance-none pr-6`}
          >
            <option value="">e.g. Within 1 month</option>
            {START_PROJECT_TIMELINES.map((timeline) => (
              <option key={timeline} value={timeline}>
                {START_PROJECT_TIMELINE_LABEL[timeline]}
              </option>
            ))}
          </select>
          <ChevronDown
            className="text-muted-foreground pointer-events-none absolute right-3.5 size-4"
            aria-hidden="true"
          />
        </div>
      </Field>

      <Field id="details" label="Additional Details" optional>
        <div className={`${FIELD_BOX} items-start py-3`}>
          <MessageSquareText
            className="text-muted-foreground mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <textarea
            id="details"
            name="details"
            rows={3}
            maxLength={2000}
            placeholder="Tell us about your project, goals or any specific requirements..."
            className={`${FIELD_CONTROL} min-h-[72px] resize-none`}
          />
        </div>
      </Field>

      {/* Honeypot - hidden from people and assistive tech, bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company website
          <input type="text" name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <TurnstileBox
        failedSubmit={state?.success === false ? state : null}
        onToken={setHumanToken}
      />

      {state?.success === false && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        loading={isPending}
        disabled={waitingForHumanCheck}
        className="w-full"
      >
        {waitingForHumanCheck ? "Checking security…" : "Get a callback today"}
        {!waitingForHumanCheck && <ArrowRight aria-hidden="true" />}
      </Button>

      <div className="flex items-center gap-3">
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs tracking-wide uppercase">or</span>
        <div className="bg-border h-px flex-1" />
      </div>

      <a
        href={getWhatsAppUrl("/start-project")}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-[15px] font-semibold text-white transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
      >
        <MessageCircle className="size-[18px]" aria-hidden="true" />
        Message us on WhatsApp instead
      </a>

      <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-center text-xs">
        <Lock className="size-3 shrink-0" aria-hidden="true" />
        Your information is safe and will only be used to contact you about this project.
      </p>
    </form>
  );
}

export { StartProjectForm };
