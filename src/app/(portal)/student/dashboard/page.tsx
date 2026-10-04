import type { Metadata } from "next";
import Link from "next/link";
import { Award, Briefcase, Crown, GraduationCap, Gift } from "lucide-react";

import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { SetPageTitle } from "@/components/dashboard-shell/layout/dashboard-title-context";
import { getOfferingsForAudience } from "@/features/offerings/server/queries";
import { getOfferingPricing } from "@/features/offerings/lib/pricing";
import { getReferralStatsForUser } from "@/features/referrals/server/queries";
import { getLatestBlogPosts } from "@/features/blog/server/blog-feed";
import { getStudentDashboardData } from "@/features/dashboard/server/student-dashboard";
import {
  Hero,
  StatTiles,
  MyLearning,
  QuickActions,
  LatestBlogPosts,
  HelpCard,
} from "@/features/dashboard/components/student-dashboard-sections";
import {
  RecommendedOfferings,
  type RecommendedOffering,
} from "@/features/dashboard/components/recommended-offerings";

export const metadata: Metadata = { title: "Student Dashboard" };

const TYPE_LABEL: Record<string, string> = {
  TRAINING: "Training",
  DIGITAL_PRODUCT: "Digital",
  INTERNSHIP: "Internship",
  CAREER_GUIDANCE: "Career",
};

function greeting(): string {
  // Server time zone is UTC; the dashboard is for India-based students, so greet by IST.
  const hour = (new Date().getUTCHours() + 5 + (new Date().getUTCMinutes() >= 30 ? 1 : 0)) % 24;
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

/**
 * The student's home. Everything here is real data (enrollments, internship
 * track, referral earnings, published offerings, the live blog) - nothing is
 * fabricated, so a brand-new student sees honest, useful empty states rather
 * than placeholders. All the queries run in parallel and are narrowly
 * selected; the blog feed is cached for an hour and can never block the
 * page (it returns [] on any failure).
 */
export default async function StudentDashboardPage() {
  const user = await requireRole("STUDENT");
  const firstName = user.name?.split(" ")[0];

  const [dashboard, offerings, referral, profile, blogPosts] = await Promise.all([
    getStudentDashboardData(user.id),
    getOfferingsForAudience("STUDENT", 8),
    getReferralStatsForUser(user.id),
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { isPrimeMember: true } }),
    getLatestBlogPosts(3),
  ]);

  const { courses, internship, completedCount, certificateCount } = dashboard;
  const ownedTitles = new Set(courses.map((c) => c.title));
  const continueCourse = courses.find((c) => c.status === "ACTIVE") ?? null;

  const internshipLabel = !internship
    ? "Not unlocked"
    : internship.status === "COMPLETED"
      ? "Completed"
      : !internship.onboarded
        ? "Ready to start"
        : internship.status === "PAUSED"
          ? "Paused"
          : "Active";

  const recommended: RecommendedOffering[] = offerings
    .filter((o) => !ownedTitles.has(o.title))
    .slice(0, 8)
    .map((o) => {
      const pricing = getOfferingPricing(o);
      const isDigital = o.category === "DIGITAL_PRODUCT";
      return {
        id: o.id,
        href: isDigital ? `/digital-store/${o.slug}` : `/offerings/${o.slug}`,
        type: TYPE_LABEL[o.category] ?? "Program",
        title: o.title,
        description: o.shortDescription,
        price: pricing.payable != null ? formatPrice(pricing.payable, o.currency) : "Custom",
        was:
          pricing.payable != null && pricing.anchor != null && pricing.anchor > pricing.payable
            ? formatPrice(pricing.anchor, o.currency)
            : null,
        meta: isDigital ? "Instant" : (o.duration ?? ""),
      };
    });

  return (
    <>
      <SetPageTitle title="Student Dashboard" />
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-4 pt-6 pb-16 sm:px-7 sm:pt-9 sm:pb-20 md:gap-10">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-foreground text-[28px] font-bold tracking-tight sm:text-[32px]">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-muted-foreground text-base">
            {completedCount > 0
              ? `You've finished ${completedCount} program${completedCount > 1 ? "s" : ""}.${internship ? " Your internship is the next step." : ""}`
              : continueCourse
                ? "Pick up where you left off."
                : "Here's where to start with Stively."}
          </p>
        </div>

        <Hero courses={courses} internship={internship} continueCourse={continueCourse} />

        <StatTiles
          tiles={[
            { icon: GraduationCap, value: String(completedCount), label: "Programs completed" },
            { icon: Award, value: String(certificateCount), label: "Certificates earned" },
            { icon: Briefcase, value: internshipLabel, label: "Internship status" },
            {
              icon: Gift,
              value: formatPrice(referral.paidAmount + referral.pendingAmount),
              label: "Referral earnings",
            },
          ]}
        />

        <MyLearning courses={courses} />

        <QuickActions hasInternship={internship != null} />

        {!profile.isPrimeMember && courses.length > 0 && (
          <div className="bg-primary/10 flex flex-wrap items-center gap-4 rounded-[18px] px-6 py-[22px]">
            <span className="bg-primary text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-[14px]">
              <Crown className="size-[26px]" aria-hidden="true" />
            </span>
            <div className="flex min-w-[220px] flex-1 flex-col gap-1">
              <p className="text-foreground text-[17px] font-bold">
                Get 50% off every course, forever
              </p>
              <p className="text-muted-foreground text-sm">
                A one-time ₹399 unlocks Stively Prime - half price on everything you take from here
                on.
              </p>
            </div>
            <Link
              href="/checkout/prime-membership"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors"
            >
              Become a Prime member
            </Link>
          </div>
        )}

        <RecommendedOfferings offerings={recommended} />

        <section className="grid items-start gap-5 lg:grid-cols-3">
          <LatestBlogPosts posts={blogPosts} />
          <HelpCard />
        </section>
      </div>
    </>
  );
}
