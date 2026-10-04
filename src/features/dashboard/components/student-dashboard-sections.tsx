import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleDot,
  Compass,
  Download,
  ExternalLink,
  Gift,
  GraduationCap,
  LayoutGrid,
  LifeBuoy,
  MessageCircle,
  PhoneCall,
  Award,
  RotateCcw,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { DashboardCourse, DashboardInternship } from "../server/student-dashboard";
import type { BlogPostPreview } from "@/features/blog/server/blog-feed";
import { BLOG_HOME_URL } from "@/features/blog/lib/constants";

const CARD = "bg-card border-border rounded-2xl border";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Hero ─────────────────────────────────────────────────────────── */

type PathState = "done" | "current" | "todo";

function PathStep({ state, title, sub }: { state: PathState; title: string; sub: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3.5 rounded-[14px] px-4 py-3",
        state === "current"
          ? "bg-[#5B82F5]/35"
          : state === "done"
            ? "bg-white/[0.06]"
            : "bg-white/[0.04]"
      )}
    >
      {state === "done" ? (
        <CheckCircle2 className="size-6 shrink-0 text-[#5EEAD4]" aria-hidden="true" />
      ) : state === "current" ? (
        <CircleDot className="size-6 shrink-0 text-white" aria-hidden="true" />
      ) : (
        <Circle className="size-6 shrink-0 text-[#A9B6DA]" aria-hidden="true" />
      )}
      <div className="flex flex-col gap-px">
        <span className="text-[15px] font-semibold">{title}</span>
        <span className="text-[13px] text-[#A9B6DA]">{sub}</span>
      </div>
    </div>
  );
}

const HERO =
  "relative grid items-center gap-7 overflow-hidden rounded-[22px] bg-[#0F1B3D] p-6 text-white sm:p-8 lg:grid-cols-2 dark:bg-[#16234A]";
const HERO_GLOW =
  "pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-[radial-gradient(circle,rgba(91,130,245,0.45),transparent_70%)]";
const BTN_LIGHT =
  "inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[15px] font-bold text-[#0F1B3D] transition-colors hover:bg-[#E6EDFD]";
const BTN_GHOST =
  "inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10";

function Hero({
  courses,
  internship,
  continueCourse,
}: {
  courses: DashboardCourse[];
  internship: DashboardInternship | null;
  continueCourse: DashboardCourse | null;
}) {
  const completed = courses.filter((c) => c.status === "COMPLETED");

  if (internship) {
    const final = internship.finalStatus;
    const steps: { title: string; sub: string; state: PathState }[] = [
      {
        title: "Training completed",
        sub: completed[0] ? `${completed[0].title} · 100%` : "Course finished",
        state: "done",
      },
      {
        title: internship.onboarded ? "Internship started" : "Choose your internship duration",
        sub: internship.onboarded
          ? "You are an active Stively intern"
          : "Pick 1, 2 or 3 months to begin",
        state: internship.onboarded ? "done" : "current",
      },
      {
        title: internship.hasProject ? "Build your project" : "Project being assigned",
        sub: internship.projectTitle ?? "Our team assigns your project personally",
        state: !internship.onboarded
          ? "todo"
          : final === "SUBMITTED" || final === "APPROVED"
            ? "done"
            : "current",
      },
      {
        title: "Earn ₹3,000 + Experience Letter",
        sub:
          final === "APPROVED"
            ? "Approved - stipend payable"
            : final === "SUBMITTED"
              ? "Final project under review"
              : "On successful delivery",
        state: final === "APPROVED" ? "done" : "todo",
      },
    ];
    return (
      <div className={HERO}>
        <div className={HERO_GLOW} aria-hidden="true" />
        <div className="relative flex flex-col items-start gap-3.5">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.12] px-3 py-1.5 text-[13px] font-semibold">
            <CheckCircle2 className="size-4 text-[#5EEAD4]" aria-hidden="true" />
            {completed[0] ? `${completed[0].title} · Completed` : "Training completed"}
          </span>
          <h2 className="text-[clamp(24px,3vw,32px)] leading-tight font-bold tracking-tight">
            {internship.onboarded
              ? "Your internship is under way. Deliver your first paid project."
              : "Your internship is unlocked. Start your first paid project."}
          </h2>
          <p className="text-[15px] leading-relaxed text-[#C9D3EE]">
            Deliver the project to earn <b className="text-white">₹3,000</b> and your internship
            documents.
          </p>
          <div className="mt-1 flex flex-wrap gap-2.5">
            <Link href="/intern" className={BTN_LIGHT}>
              Open Intern Portal <ArrowRight className="size-[18px]" aria-hidden="true" />
            </Link>
            <Link href="/student/learning" className={BTN_GHOST}>
              <Award className="size-[18px]" aria-hidden="true" />
              View certificates
            </Link>
          </div>
        </div>
        <div className="relative flex flex-col gap-2.5">
          {steps.map((s) => (
            <PathStep key={s.title} {...s} />
          ))}
        </div>
      </div>
    );
  }

  if (continueCourse) {
    return (
      <div className={HERO}>
        <div className={HERO_GLOW} aria-hidden="true" />
        <div className="relative flex flex-col items-start gap-3.5">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.12] px-3 py-1.5 text-[13px] font-semibold">
            <BookOpen className="size-4 text-[#5EEAD4]" aria-hidden="true" />
            In progress
          </span>
          <h2 className="text-[clamp(24px,3vw,32px)] leading-tight font-bold tracking-tight">
            Continue {continueCourse.title}
          </h2>
          <p className="text-[15px] leading-relaxed text-[#C9D3EE]">
            Finish the course to unlock your certificate and a paid internship project.
          </p>
          <Link href="/student/learning" className={cn(BTN_LIGHT, "mt-1")}>
            Continue learning <ArrowRight className="size-[18px]" aria-hidden="true" />
          </Link>
        </div>
        <div className="relative flex flex-col gap-3 rounded-[14px] bg-white/[0.06] p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-semibold">Your progress</span>
            <span className="text-2xl font-bold tabular-nums">{continueCourse.progress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
            <div
              className="h-full rounded-full bg-[#5EEAD4]"
              style={{ width: `${continueCourse.progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={HERO}>
      <div className={HERO_GLOW} aria-hidden="true" />
      <div className="relative flex flex-col items-start gap-3.5">
        <h2 className="text-[clamp(24px,3vw,32px)] leading-tight font-bold tracking-tight">
          Start your first program and earn while you learn.
        </h2>
        <p className="text-[15px] leading-relaxed text-[#C9D3EE]">
          Finish a training program, get certified, then take on a paid internship project.
        </p>
        <Link href="/training" className={cn(BTN_LIGHT, "mt-1")}>
          Browse training <ArrowRight className="size-[18px]" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

/* ── Stats ────────────────────────────────────────────────────────── */

function StatTiles({ tiles }: { tiles: { icon: LucideIcon; value: string; label: string }[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {tiles.map(({ icon: Icon, value, label }) => (
        <li key={label} className={cn(CARD, "flex items-center gap-3.5 px-4 py-4 sm:px-5")}>
          <span className="bg-primary/10 text-primary flex size-[46px] shrink-0 items-center justify-center rounded-xl">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-foreground truncate text-[22px] leading-tight font-bold">
              {value}
            </span>
            <span className="text-muted-foreground text-[13px]">{label}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ── My learning ──────────────────────────────────────────────────── */

function MyLearning({ courses }: { courses: DashboardCourse[] }) {
  if (courses.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[22px] font-bold">My learning</h2>
        <Link
          href="/student/learning"
          className="text-primary text-sm font-semibold hover:underline"
        >
          View all →
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {courses.slice(0, 4).map((course) => {
          const done = course.status === "COMPLETED";
          return (
            <div
              key={course.enrollmentId}
              className={cn(CARD, "flex items-start gap-4 p-5 sm:gap-[18px] sm:p-[22px]")}
            >
              <span className="bg-primary/10 text-primary flex size-14 shrink-0 items-center justify-center rounded-[14px]">
                <GraduationCap className="size-7" aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold",
                      done ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                    )}
                  >
                    {done
                      ? "Completed"
                      : course.status === "PAUSED"
                        ? "Paused"
                        : `${course.progress}% done`}
                  </span>
                  {done && course.completedAt && (
                    <span className="text-muted-foreground text-[13px]">
                      Finished {formatDate(course.completedAt)}
                    </span>
                  )}
                </div>
                <h3 className="text-foreground text-lg leading-snug font-bold">{course.title}</h3>
                <div className="bg-muted h-1.5 overflow-hidden rounded-full" aria-hidden="true">
                  <div
                    className={cn("h-full rounded-full", done ? "bg-success/70" : "bg-primary")}
                    style={{ width: `${done ? 100 : course.progress}%` }}
                  />
                </div>
                <div className="mt-0.5 flex flex-wrap gap-2">
                  {done && course.certificateNumber && (
                    <Link
                      href={`/student/learning/${course.enrollmentId}#certificate`}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors"
                    >
                      <Download className="size-4" aria-hidden="true" />
                      Certificate
                    </Link>
                  )}
                  <Link
                    href={`/student/learning/${course.enrollmentId}`}
                    className="border-border text-foreground hover:border-primary hover:text-primary inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors"
                  >
                    {done ? (
                      <RotateCcw className="size-4" aria-hidden="true" />
                    ) : (
                      <ArrowRight className="size-4" aria-hidden="true" />
                    )}
                    {done ? "Revisit lessons" : "Continue"}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── Quick actions ────────────────────────────────────────────────── */

function QuickActions({ hasInternship }: { hasInternship: boolean }) {
  const actions: { icon: LucideIcon; title: string; sub: string; href: string }[] = [
    {
      icon: Briefcase,
      title: "Intern Portal",
      sub: hasInternship ? "Project, tasks & daily reports" : "Unlocks once you finish a course",
      href: "/intern",
    },
    { icon: Gift, title: "Refer & Earn", sub: "Invite friends, earn rewards", href: "/referrals" },
    {
      icon: Compass,
      title: "Career Guidance",
      sub: "Talk to a career advisor",
      href: "/student/career-guidance",
    },
    {
      icon: LayoutGrid,
      title: "Browse Offerings",
      sub: "Training, internships & more",
      href: "/offerings",
    },
  ];
  return (
    <section className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map(({ icon: Icon, title, sub, href }) => (
        <Link
          key={title}
          href={href}
          className={cn(
            CARD,
            "hover:border-primary hover:bg-muted flex items-center gap-3.5 p-[18px] transition-colors"
          )}
        >
          <Icon className="text-primary size-[26px] shrink-0" aria-hidden="true" />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-foreground text-[15px] font-semibold">{title}</span>
            <span className="text-muted-foreground text-[13px]">{sub}</span>
          </span>
          <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
        </Link>
      ))}
    </section>
  );
}

/* ── Blog + help ──────────────────────────────────────────────────── */

function LatestBlogPosts({ posts }: { posts: BlogPostPreview[] }) {
  return (
    <div className={cn(CARD, "flex flex-col gap-4 p-[22px] lg:col-span-2")}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[17px] font-bold">Latest from our blog</h3>
        <a
          href={BLOG_HOME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary inline-flex items-center gap-1 text-sm font-semibold hover:underline"
        >
          blog.stively.com <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>
      {posts.length === 0 ? (
        <div className="text-muted-foreground flex items-center gap-3 text-sm leading-relaxed">
          <Newspaper className="size-7 shrink-0" aria-hidden="true" />
          Our latest articles are on the Stively blog - guides on careers, freelancing, AI and
          building software.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-3">
          {posts.map((post) => (
            <li key={post.url}>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group border-border hover:border-primary/50 flex h-full flex-col overflow-hidden rounded-xl border transition-colors"
              >
                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt=""
                    width={600}
                    height={315}
                    sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 100vw"
                    // The blog serves its own pre-sized images; skipping Next's optimizer avoids proxying every cover through our server.
                    unoptimized
                    className="aspect-[1.9/1] w-full object-cover"
                  />
                ) : (
                  <div className="bg-muted aspect-[1.9/1] w-full" aria-hidden="true" />
                )}
                <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                  {post.publishedAt && (
                    <span className="text-muted-foreground text-xs">
                      {formatDate(post.publishedAt)}
                    </span>
                  )}
                  <span className="text-foreground group-hover:text-primary text-[15px] leading-snug font-semibold">
                    {post.title}
                  </span>
                  <span className="text-muted-foreground line-clamp-2 text-[13px] leading-relaxed">
                    {post.description}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HelpCard() {
  return (
    <div className={cn(CARD, "flex flex-col gap-3 p-[22px]")}>
      <h3 className="text-[17px] font-bold">Need help?</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        A real person replies, usually within a few hours.
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href="https://wa.me/919579704823?text=Hi%20Stively%2C%20I%20need%20help%20with%20my%20student%20account."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <MessageCircle className="size-[18px]" aria-hidden="true" />
          WhatsApp us
        </a>
        <Link
          href="/student/support"
          className="border-border text-foreground hover:border-primary hover:text-primary inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <LifeBuoy className="size-[18px]" aria-hidden="true" />
          Support
        </Link>
        <Link
          href="/contact"
          className="border-border text-foreground hover:border-primary hover:text-primary inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <PhoneCall className="size-[18px]" aria-hidden="true" />
          Request callback
        </Link>
      </div>
    </div>
  );
}

export { Hero, StatTiles, MyLearning, QuickActions, LatestBlogPosts, HelpCard };
