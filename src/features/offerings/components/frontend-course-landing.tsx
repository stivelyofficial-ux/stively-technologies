import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  GraduationCap,
  MailOpen,
  ShieldCheck,
  Infinity as InfinityIcon,
  Home,
  IndianRupee,
  BadgeCheck,
  Award,
  Handshake,
  Briefcase,
  PlayCircle,
  BookOpenText,
  ClipboardCheck,
  Check,
  X,
  UserPlus,
  Repeat,
  Laptop,
  Lock,
  MessageCircle,
} from "lucide-react";
import type { Offering } from "@prisma/client";

import { formatPrice } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { getOfferingPricing } from "../lib/pricing";
import { parseOfferingFaqs } from "../lib/faq";
import { parseOfferingCurriculumTopics } from "../lib/curriculum-topics";
import type { CurriculumOutline } from "../server/queries";
import { GuestCheckoutForm } from "@/features/orders/components/guest-checkout-form";
import { EnrollCta } from "@/features/orders/components/enroll-cta";
import { SaleCountdown } from "./sale-countdown";
import { ViewContentTracker } from "./view-content-tracker";
import { FrontendLandingFaq } from "./frontend-landing-faq";
import { FrontendStipendTerms } from "./frontend-stipend-terms";

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/** Per-project payout once an intern delivers a client project - page copy only; there's no InternshipTask price field yet (see InternshipTask in prisma/schema.prisma), so this is a stated policy, not a number read off a paid record. */
const STIPEND_DISPLAY = "₹3,000";

const HOW_IT_WORKS = [
  { icon: ShoppingCart, title: "Enroll" },
  { icon: GraduationCap, title: "Complete the training" },
  { icon: MailOpen, title: "Offer letter, automatically" },
  { icon: IndianRupee, title: `Earn ${STIPEND_DISPLAY} / project` },
] as const;

const HOW_IT_WORKS_BODY = [
  "One-time payment. Instant access to the full course.",
  "Video, reading notes and a quiz in every lesson, basic to advanced.",
  "Your intern portal unlocks the moment you finish, with your offer letter inside.",
  "Work on real client projects and get paid for each one you deliver.",
] as const;

/** Every document a finished student walks away with - see certificates/lib/course-config.ts and the internship track's real offer-letter issuance (features/internships/server/creation.ts). */
const DOCUMENTS = [
  { icon: BadgeCheck, label: "Training Certificate" },
  { icon: MailOpen, label: "Internship Offer Letter" },
  { icon: Award, label: "Internship Completion Certificate" },
  { icon: Handshake, label: "Letter of Recommendation" },
  { icon: Briefcase, label: "Experience Letter" },
] as const;

const TRAINING_PILLS = [
  { icon: PlayCircle, label: "Video lectures" },
  { icon: BookOpenText, label: "Reading material" },
  { icon: ClipboardCheck, label: "Daily quizzes" },
  { icon: Briefcase, label: "Paid internship" },
] as const;

/** Module row background accents, applied by index (cycles if there are ever more than 5 modules) - the same light-to-gold ramp as the reference design. */
const MODULE_ACCENTS = [
  { bg: "#CDEBDD", text: "#0B5C43" },
  { bg: "#A9DCC5", text: "#0B5C43" },
  { bg: "#5FC39C", text: "#061B15" },
  { bg: "#23C08A", text: "#061B15" },
  { bg: "#F3DEA4", text: "#061B15" },
] as const;

const COMPARISON = {
  typical: [
    "Hours of video to watch",
    "No notes, no quizzes",
    "Certificate just for watching",
    "You're on your own after",
  ],
  stively: [
    "Video + reading material",
    "Quiz gates every lesson",
    "Certificate you earn by passing",
    "Paid internship with auto offer letter",
  ],
} as const;

const AUDIENCE = [
  {
    icon: GraduationCap,
    bold: "College students",
    rest: "who want real experience on their resume before placements",
  },
  { icon: UserPlus, bold: "Freshers", rest: "tired of “experience required” on every job post" },
  {
    icon: Repeat,
    bold: "Career switchers",
    rest: "who tried YouTube tutorials and want structure",
  },
] as const;

const DEFAULT_FAQS = [
  {
    question: "Do I need any coding experience?",
    answer:
      "No. The course starts from absolute basics - HTML - and builds up to React step by step. It's designed for college students and freshers.",
  },
  {
    question: "How does the internship work?",
    answer:
      "Once you complete the training, your intern portal unlocks automatically and your offer letter is issued to you there. You then work on real client projects.",
  },
  {
    question: "How much can I earn?",
    answer: `You receive a stipend of ${STIPEND_DISPLAY} for every project you successfully deliver. More projects delivered means more earnings.`,
  },
  {
    question: "Which certificates and letters will I get?",
    answer:
      "Training Certificate, Internship Offer Letter, Internship Completion Certificate, Letter of Recommendation and Experience Letter.",
  },
  {
    question: "What do I need to start?",
    answer: "A laptop or desktop with a modern browser and an internet connection. That's it.",
  },
  {
    question: "Is payment secure?",
    answer:
      "Yes. Payments are processed through Razorpay. You get instant access after enrolling, with lifetime access to all lessons and future updates.",
  },
  {
    question: "Is this course generated with AI?",
    answer:
      "Yes. This course is generated with the help of AI tools. We tell you this openly so you know how the course was made before you enrol.",
  },
] as const;

const trustRow = [
  { icon: ShieldCheck, label: "Secure Razorpay checkout" },
  { icon: InfinityIcon, label: "Lifetime access" },
  { icon: Home, label: "100% online" },
] as const;

/**
 * The bespoke, conversion-first landing page for the Frontend Development
 * offering - a purpose-built page (not the generic, shared
 * CourseDetailView every other TRAINING offering uses) matching a specific
 * design brief. Kept as its own component rather than a slug-branch inside
 * CourseDetailView so that page's own doc comment ("no invented
 * testimonials... every claim structurally true or read off the record")
 * doesn't have to grow exceptions for this page's very different, far more
 * opinionated marketing voice.
 *
 * The email-capture "Enroll" flow is not reinvented here - EnrollCta +
 * GuestCheckoutForm (both already shared, already real Razorpay
 * end-to-end) are reused exactly as-is, just restyled to this page's dark
 * green/gold palette via className overrides (twMerge resolves the
 * conflicts - see cn() in src/lib/utils.ts). Every "Enroll" button on this
 * page scrolls to and focuses the single #enroll email field, or submits
 * it directly if already filled - see enroll-cta.tsx.
 */
function FrontendCourseLanding({
  offering,
  curriculum,
  nonce,
}: {
  offering: Offering;
  curriculum: CurriculumOutline | null;
  nonce?: string;
}) {
  const { payable, anchor, percentOff, saleEndsAt } = getOfferingPricing(offering);
  const hasDiscount = anchor != null && payable != null;
  const faqs = parseOfferingFaqs(offering.faqs);
  const courseFaqs = faqs.length > 0 ? faqs : DEFAULT_FAQS;
  const curriculumTopics = parseOfferingCurriculumTopics(offering.curriculum);
  const modules = curriculum?.modules ?? [];
  const enrollHref = offering.allowsGuestCheckout ? "#enroll" : `/checkout/${offering.slug}`;
  const enrollLabel =
    payable != null ? `Enroll Now for ${formatPrice(payable, offering.currency)}` : "Enroll Now";
  const hasGuestForm = offering.allowsGuestCheckout && payable != null;
  const whatsappHref = getWhatsAppUrl(`/offerings/${offering.slug}`);

  const enrollBtnClass =
    "inline-flex items-center justify-center gap-2 rounded-[14px] border-0 bg-[#23c08a] px-7 py-4 text-[19px] font-extrabold text-[#061b15] shadow-[0_12px_30px_rgba(35,192,138,0.35)] transition-colors hover:bg-[#3ad69e] hover:text-[#061b15]";

  return (
    <div className="font-sans" style={{ background: "#F4F7F4", color: "#0A1F1A" }}>
      <ViewContentTracker
        contentName={offering.title}
        value={payable != null ? payable / 100 : undefined}
        currency={offering.currency}
      />

      {/* ── HERO ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(900px 600px at 100% 100%, rgba(35,192,138,0.25), transparent 60%), #061B15",
          color: "#fff",
        }}
      >
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 pt-14 pb-16 md:grid-cols-2 md:pt-16 md:pb-20">
          <div className="flex flex-col items-start gap-5">
            <div
              className="flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-extrabold tracking-wide"
              style={{ background: "#C6A04A", color: "#061B15" }}
            >
              <span className="size-2 rounded-full" style={{ background: "#061B15" }} />
              NOW HIRING &middot; FRESHERS WELCOME
            </div>

            <h1
              className="font-sans font-extrabold text-balance"
              style={{
                fontSize: "clamp(2.625rem, 6.4vw, 4.75rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
              }}
            >
              Get Trained. Get Hired.
              <br />
              <span style={{ color: "#23C08A" }}>Get Paid {STIPEND_DISPLAY}</span> Per Project.
            </h1>

            <p
              className="max-w-xl text-[17px] leading-relaxed text-pretty sm:text-[20px]"
              style={{ color: "#D5E9E0" }}
            >
              Stively&apos;s Frontend Development training takes you from zero to React, with no
              experience needed. Finish the course and your intern portal unlocks with an{" "}
              <b style={{ color: "#fff" }}>offer letter sent automatically</b>.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <EnrollCta
                href={enrollHref}
                label={enrollLabel}
                hasGuestForm={hasGuestForm}
                className={enrollBtnClass}
              />
              {hasDiscount && (
                <div className="flex flex-col leading-tight">
                  <span
                    className="text-[15px] tabular-nums line-through"
                    style={{ color: "#9FB3AB" }}
                  >
                    {formatPrice(anchor, offering.currency)}
                  </span>
                  <span
                    className="text-[15px] font-bold whitespace-nowrap"
                    style={{ color: "#F3DEA4" }}
                  >
                    {percentOff != null ? `${percentOff}% off · ` : ""}founding price
                  </span>
                </div>
              )}
            </div>

            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[15px]" style={{ color: "#D5E9E0" }}>
              {trustRow.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 whitespace-nowrap">
                  <Icon className="size-5" style={{ color: "#23C08A" }} aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-h-[360px] md:min-h-[420px]">
            <div className="absolute top-8 left-0 w-[78%] -rotate-[4deg] overflow-hidden rounded-lg shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
              <Image
                src="/certificates/frontend/internship-certificate.png"
                alt="Sample Stively internship certificate"
                width={960}
                height={678}
                className="h-auto w-full"
                priority
              />
            </div>
            <div className="absolute top-0 right-0 w-[44%] rotate-[6deg] overflow-hidden rounded-lg shadow-[0_30px_60px_rgba(0,0,0,0.55)]">
              <Image
                src="/certificates/frontend/offer-letter.png"
                alt="Sample Stively internship offer letter"
                width={960}
                height={1358}
                className="h-auto w-full"
              />
            </div>
            <div
              className="absolute bottom-2 left-[6%] flex items-center gap-3.5 rounded-2xl px-5 py-4 shadow-[0_20px_44px_rgba(0,0,0,0.4)]"
              style={{ background: "#fff", color: "#061B15" }}
            >
              <span
                className="flex size-[46px] shrink-0 items-center justify-center rounded-full"
                style={{ background: "#CDEBDD" }}
              >
                <IndianRupee className="size-6" style={{ color: "#0B5C43" }} aria-hidden="true" />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-extrabold tracking-wide" style={{ color: "#0E7C5A" }}>
                  STIPEND
                </span>
                <span className="text-2xl font-extrabold">{STIPEND_DISPLAY} / project</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <div className="mx-auto max-w-[1180px] px-5 pt-16 pb-8 md:pt-20">
        <div className="text-sm font-extrabold tracking-[0.16em]" style={{ color: "#0E7C5A" }}>
          HOW IT WORKS
        </div>
        <h2
          className="mt-3 max-w-3xl font-sans font-extrabold"
          style={{
            fontSize: "clamp(2rem, 4.4vw, 3.25rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            color: "#0A2A22",
          }}
        >
          From enrollment to offer letter.{" "}
          <span style={{ color: "#0E7C5A" }}>No interviews, no waiting.</span>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map(({ icon: Icon, title }, index) => {
            const isLast = index === HOW_IT_WORKS.length - 1;
            return (
              <div
                key={title}
                className="flex flex-col gap-3 rounded-[18px] p-6"
                style={isLast ? { background: "#061B15", color: "#fff" } : { background: "#fff" }}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    className="size-9"
                    style={{ color: isLast ? "#F3DEA4" : "#0E7C5A" }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-sm font-extrabold"
                    style={{ color: isLast ? "#9FD9C4" : "#6B7F77" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="text-xl font-extrabold">{title}</div>
                <div
                  className="text-[15px] leading-relaxed"
                  style={{ color: isLast ? "#D5E9E0" : "#4B5D56" }}
                >
                  {HOW_IT_WORKS_BODY[index]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── WHAT YOU WALK AWAY WITH ──────────────────────── */}
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 py-16 md:grid-cols-2">
        <div className="relative mx-auto aspect-[1.3] max-h-[480px] w-full max-w-[480px]">
          <div className="absolute top-0 left-0 w-[76%] -rotate-3 overflow-hidden rounded-lg shadow-[0_24px_50px_rgba(6,27,21,0.25)]">
            <Image
              src="/certificates/frontend/training-certificate.png"
              alt="Sample Stively training certificate"
              width={960}
              height={679}
              className="h-auto w-full"
            />
          </div>
          <div className="absolute top-[14%] right-[14%] w-[32%] rotate-[4deg] overflow-hidden rounded-md shadow-[0_24px_50px_rgba(6,27,21,0.28)]">
            <Image
              src="/certificates/frontend/letter-of-recommendation.png"
              alt="Sample Stively letter of recommendation"
              width={960}
              height={1358}
              className="h-auto w-full"
            />
          </div>
          <div className="absolute top-[24%] right-0 w-[32%] rotate-[9deg] overflow-hidden rounded-md shadow-[0_24px_50px_rgba(6,27,21,0.3)]">
            <Image
              src="/certificates/frontend/experience-letter.png"
              alt="Sample Stively experience letter"
              width={960}
              height={1358}
              className="h-auto w-full"
            />
          </div>
        </div>

        <div className="flex flex-col gap-[18px]">
          <div className="text-sm font-extrabold tracking-[0.16em]" style={{ color: "#0E7C5A" }}>
            WHAT YOU WALK AWAY WITH
          </div>
          <h2
            className="font-sans font-extrabold"
            style={{
              fontSize: "clamp(2rem, 4.4vw, 3.25rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: "#0A2A22",
            }}
          >
            5 documents that make your resume stand out
          </h2>
          <div className="mt-2 flex flex-col gap-3.5">
            {DOCUMENTS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3.5 text-lg font-bold">
                <Icon className="size-[30px]" style={{ color: "#0E7C5A" }} aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
          <div className="text-[15px]" style={{ color: "#4B5D56" }}>
            Every certificate carries a unique ID and can be verified at stively.com/verify.
          </div>
        </div>
      </div>

      {/* ── THE TRAINING ─────────────────────────────────── */}
      <div style={{ background: "#061B15", color: "#fff" }}>
        <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-20 md:grid-cols-2">
          <div className="flex flex-col gap-[18px]">
            <div className="text-sm font-extrabold tracking-[0.16em]" style={{ color: "#23C08A" }}>
              THE TRAINING
            </div>
            <h2
              className="font-sans font-extrabold"
              style={{
                fontSize: "clamp(2rem, 4.4vw, 3.25rem)",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
              }}
            >
              We train you from <span style={{ color: "#23C08A" }}>basic to advanced.</span>
            </h2>
            <p className="text-lg leading-relaxed text-pretty" style={{ color: "#D5E9E0" }}>
              {curriculum ? `${curriculum.moduleCount} structured modules.` : "Structured modules,"}{" "}
              Every lesson has a short video, written notes and a quiz you must pass to unlock the
              next one, so you actually learn instead of just watching.
            </p>
            <div className="mt-1.5 flex flex-wrap gap-2.5">
              {TRAINING_PILLS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <Icon className="size-[18px]" style={{ color: "#23C08A" }} aria-hidden="true" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {modules.length > 0 ? (
              modules.map((module, index) => {
                const accent = MODULE_ACCENTS[index % MODULE_ACCENTS.length];
                const topics = curriculumTopics.get(module.title) ?? [];
                const subtitle =
                  module.lessonCount > 0
                    ? `${module.lessonCount} lesson${module.lessonCount === 1 ? "" : "s"}${
                        module.totalMinutes != null
                          ? ` · ${formatMinutes(module.totalMinutes)}`
                          : ""
                      }`
                    : topics.length > 0
                      ? topics.slice(0, 2).join(" · ")
                      : "Curriculum coming soon";
                return (
                  <div
                    key={module.id}
                    className="flex items-center gap-[18px] rounded-2xl px-5 py-[18px]"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <div
                      className="flex size-12 shrink-0 items-center justify-center rounded-full text-[17px] font-extrabold"
                      style={{ background: accent.bg, color: accent.text }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-lg font-extrabold">{module.title}</div>
                      <div className="text-sm" style={{ color: "#9FD9C4" }}>
                        {subtitle}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm" style={{ color: "#9FD9C4" }}>
                Full module breakdown added soon.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── WHY STIVELY ──────────────────────────────────── */}
      <div className="mx-auto max-w-[1180px] px-5 pt-20 pb-10">
        <div className="text-sm font-extrabold tracking-[0.16em]" style={{ color: "#0E7C5A" }}>
          WHY STIVELY
        </div>
        <h2
          className="mt-3 font-sans font-extrabold"
          style={{
            fontSize: "clamp(2rem, 4.4vw, 3.25rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            color: "#0A2A22",
          }}
        >
          Others sell videos. <span style={{ color: "#0E7C5A" }}>We build careers.</span>
        </h2>
        <div className="mt-9 grid gap-[18px] sm:grid-cols-2">
          <div
            className="flex flex-col gap-[18px] rounded-[20px] p-[30px]"
            style={{ background: "#E6ECE8" }}
          >
            <div className="text-sm font-extrabold tracking-[0.14em]" style={{ color: "#4B5D56" }}>
              TYPICAL ONLINE COURSE
            </div>
            {COMPARISON.typical.map((line, index) => (
              <div
                key={line}
                className="flex items-center gap-3 text-[17px]"
                style={{ color: index === 0 ? "#33453D" : "#4B5D56" }}
              >
                {index === 0 ? (
                  <Check className="size-6" style={{ color: "#6B7F77" }} aria-hidden="true" />
                ) : (
                  <X className="size-6" style={{ color: "#C24848" }} aria-hidden="true" />
                )}
                {line}
              </div>
            ))}
          </div>
          <div
            className="flex flex-col gap-[18px] rounded-[20px] p-[30px]"
            style={{
              background: "#fff",
              border: "2px solid #C6A04A",
              boxShadow: "0 20px 44px rgba(6,27,21,0.1)",
            }}
          >
            <div className="text-sm font-extrabold tracking-[0.14em]" style={{ color: "#0E7C5A" }}>
              STIVELY
            </div>
            {COMPARISON.stively.map((line, index) => (
              <div
                key={line}
                className="flex items-center gap-3 text-[17px] font-bold"
                style={index === COMPARISON.stively.length - 1 ? { color: "#0B5C43" } : undefined}
              >
                <BadgeCheck className="size-6" style={{ color: "#0E7C5A" }} aria-hidden="true" />
                {line}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-[22px] max-w-2xl text-base leading-relaxed" style={{ color: "#4B5D56" }}>
          Taught by a software studio that ships real client work every day, not a course platform
          with hired instructors.
        </p>
      </div>

      {/* ── WHO IT'S FOR + PRICING ───────────────────────── */}
      <div className="mx-auto grid max-w-[1180px] items-start gap-10 px-5 py-[60px] md:grid-cols-2">
        <div className="flex flex-col gap-[18px]">
          <div className="text-sm font-extrabold tracking-[0.16em]" style={{ color: "#0E7C5A" }}>
            WHO IT&apos;S FOR
          </div>
          <h2
            className="font-sans font-extrabold"
            style={{
              fontSize: "clamp(1.875rem, 4vw, 2.875rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#0A2A22",
            }}
          >
            Built for people starting from zero
          </h2>
          <div className="flex flex-col gap-3.5 text-[17px] leading-snug">
            {AUDIENCE.map(({ icon: Icon, bold, rest }) => (
              <div key={bold} className="flex gap-3">
                <Icon className="size-7 shrink-0" style={{ color: "#0E7C5A" }} aria-hidden="true" />
                <div>
                  <b>{bold}</b> {rest}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[15px]" style={{ color: "#4B5D56" }}>
            <Laptop className="size-[22px]" style={{ color: "#0E7C5A" }} aria-hidden="true" />
            All you need: a laptop and internet. No prior coding.
          </div>
        </div>

        <div
          id="enroll"
          className="flex flex-col gap-[18px] rounded-3xl p-[34px]"
          style={{
            background: "#061B15",
            color: "#fff",
            border: "2px solid #C6A04A",
            boxShadow: "0 30px 60px rgba(6,27,21,0.3)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-extrabold tracking-[0.14em]" style={{ color: "#23C08A" }}>
              FOUNDING PRICE
            </span>
            {percentOff != null && (
              <span
                className="rounded-full px-3 py-1.5 text-[13px] font-extrabold"
                style={{ background: "#C6A04A", color: "#061B15" }}
              >
                {percentOff}% OFF
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-3.5">
            <span
              className="text-[56px] leading-none font-extrabold tracking-tight sm:text-[68px]"
              style={{ color: "#F3DEA4" }}
            >
              {payable != null ? formatPrice(payable, offering.currency) : "—"}
            </span>
            {hasDiscount && (
              <span className="text-[22px] line-through" style={{ color: "#9FB3AB" }}>
                {formatPrice(anchor, offering.currency)}
              </span>
            )}
          </div>
          <div className="text-[15px]" style={{ color: "#D5E9E0" }}>
            One-time payment &middot; Lifetime access
          </div>
          <div className="flex flex-col gap-2.5 text-base">
            {[
              "Full training, basic to advanced",
              "Video + reading + quizzes",
              "Intern portal + automatic offer letter",
              `${STIPEND_DISPLAY} stipend per project`,
              "5 certificates & letters",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <BadgeCheck
                  className="size-[22px]"
                  style={{ color: "#23C08A" }}
                  aria-hidden="true"
                />
                {item}
              </div>
            ))}
          </div>

          {hasGuestForm ? (
            <div className="mt-1 rounded-2xl bg-white p-5" style={{ color: "#0A1F1A" }}>
              <GuestCheckoutForm
                offering={{
                  id: offering.id,
                  slug: offering.slug,
                  title: offering.title,
                  price: payable ?? offering.price ?? 0,
                  currency: offering.currency,
                  promptsPackPrice: offering.promptsPackPrice,
                  promptsPack500Price: offering.promptsPack500Price,
                }}
                nonce={nonce}
              />
            </div>
          ) : (
            <Link href={enrollHref} className={`${enrollBtnClass} mt-1`}>
              Enroll Now
            </Link>
          )}

          {saleEndsAt && (
            <SaleCountdown
              endsAt={saleEndsAt.toISOString()}
              label="Price rises in"
              className="flex items-center justify-center gap-2 text-sm text-[#9fd9c4]"
            />
          )}
          <div
            className="flex items-center justify-center gap-2 text-[13px]"
            style={{ color: "#9FB3AB" }}
          >
            <Lock className="size-4" aria-hidden="true" />
            Secure payment powered by Razorpay
          </div>
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-[820px] px-5 py-16">
        <div className="text-sm font-extrabold tracking-[0.16em]" style={{ color: "#0E7C5A" }}>
          QUESTIONS
        </div>
        <h2
          className="mt-3 mb-7 font-sans font-extrabold"
          style={{
            fontSize: "clamp(1.875rem, 4vw, 2.875rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#0A2A22",
          }}
        >
          Everything you&apos;re wondering
        </h2>
        <FrontendLandingFaq items={courseFaqs} />
      </div>

      <FrontendStipendTerms />

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <div
        style={{
          background:
            "radial-gradient(800px 500px at 50% 100%, rgba(35,192,138,0.28), transparent 65%), #061B15",
          color: "#fff",
        }}
      >
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-5 px-5 pt-20 pb-16 text-center md:pb-24">
          <h2
            className="font-sans font-extrabold"
            style={{
              fontSize: "clamp(2.125rem, 5vw, 3.75rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Your first dev job <span style={{ color: "#23C08A" }}>starts today.</span>
          </h2>
          <p className="max-w-xl text-lg leading-relaxed" style={{ color: "#D5E9E0" }}>
            Learn it, build it, get paid for it.
            {payable != null &&
              ` Lock in ${formatPrice(payable, offering.currency)} before the founding price ends.`}
          </p>
          <EnrollCta
            href={enrollHref}
            label={enrollLabel}
            hasGuestForm={hasGuestForm}
            className={`${enrollBtnClass} text-[20px]`}
          />
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-base font-bold transition-colors hover:text-white"
            style={{ color: "#9FD9C4" }}
          >
            <MessageCircle className="size-[22px]" aria-hidden="true" />
            Questions? Chat with us on WhatsApp
          </a>
          <div className="mt-7 text-[13px] tracking-[0.08em]" style={{ color: "#6B8F82" }}>
            © 2026 STIVELY TECHNOLOGIES &middot; UDYAM-RJ-17-0578717 &middot; WWW.STIVELY.COM
          </div>
        </div>
      </div>

      {/* Persistent mobile purchase bar - same real component/behavior as CourseDetailView's. */}
      {payable != null && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t p-3 backdrop-blur lg:hidden"
          style={{ background: "rgba(6,27,21,0.95)", borderColor: "rgba(255,255,255,0.1)" }}
        >
          {/* pl-16 keeps the price clear of the floating WhatsApp chat widget pinned to the same bottom-left corner - same fix course-detail-view.tsx's own mobile bar already uses. */}
          <div className="flex items-center justify-between gap-3 pl-16">
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tabular-nums" style={{ color: "#F3DEA4" }}>
                {formatPrice(payable, offering.currency)}
              </span>
              {hasDiscount && (
                <span className="text-xs tabular-nums line-through" style={{ color: "#9FB3AB" }}>
                  {formatPrice(anchor, offering.currency)}
                </span>
              )}
            </div>
            <EnrollCta
              href={enrollHref}
              label="Enroll Now"
              hasGuestForm={hasGuestForm}
              className="max-w-[60%] flex-1 rounded-[14px] border-0 bg-[#23c08a] py-3 font-extrabold text-[#061b15] hover:bg-[#3ad69e] hover:text-[#061b15]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export { FrontendCourseLanding };
