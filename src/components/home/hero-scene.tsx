import { ArrowRight, GraduationCap, Globe, Layers } from "lucide-react";

/**
 * The hero's product scene: a tilted laptop screen showing Stively's own
 * "Build / Launch / Grow" product UI, with three glass cards floating
 * around it - one per thing we actually sell. Built from real DOM (not a
 * stock photo) so it stays crisp at every size, themes with the site, and
 * costs no image bytes. Decorative: the headline and CTAs beside it carry
 * the meaning, so the whole scene is aria-hidden.
 */
function HeroScene() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto h-[420px] w-full max-w-[640px] sm:h-[500px] lg:h-[560px] lg:max-w-none"
    >
      {/* soft light behind the device */}
      <div className="from-primary/15 via-brand-iris/10 to-brand-teal/15 absolute inset-x-[6%] top-[14%] bottom-[8%] rounded-[40px] bg-linear-to-br blur-3xl" />

      {/* Laptop screen */}
      <div
        className="absolute top-[16%] left-[6%] w-[84%] origin-center"
        style={{ transform: "perspective(1800px) rotateY(-14deg) rotateX(5deg) rotateZ(1deg)" }}
      >
        <div className="rounded-[22px] bg-[#0b1020] p-[7px] shadow-[0_40px_90px_-20px_rgba(18,32,92,0.55),0_0_0_1px_rgba(255,255,255,0.06)_inset]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-linear-to-br from-[#0e1633] via-[#0b1226] to-[#070b18]">
            {/* browser chrome */}
            <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
              <span className="size-2 rounded-full bg-[#ff5f57]" />
              <span className="size-2 rounded-full bg-[#febc2e]" />
              <span className="size-2 rounded-full bg-[#28c840]" />
              <span className="ml-3 h-4 w-40 rounded-full bg-white/5" />
            </div>
            {/* product UI */}
            <div className="grid h-[calc(100%-37px)] grid-cols-[1.15fr_1fr] gap-4 p-5">
              <div className="flex flex-col justify-center gap-3">
                <span className="font-display text-[10px] font-semibold tracking-[0.2em] text-[#7da2ff] uppercase">
                  Stively
                </span>
                <p className="font-display text-[clamp(1.4rem,3.1vw,2.35rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-white">
                  Build.
                  <br />
                  Launch.
                  <br />
                  Grow.
                </p>
                <p className="max-w-[16rem] text-[9px] leading-relaxed text-white/50 sm:text-[10px]">
                  Web apps. Mobile apps. Custom software. Built for real businesses.
                </p>
                <span className="bg-primary mt-1 inline-flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-[9px] font-semibold text-white shadow-[0_6px_20px_-4px_rgba(43,89,230,0.8)]">
                  Get a free consultation <ArrowRight className="size-2.5" />
                </span>
              </div>
              {/* device + chart */}
              <div className="relative">
                <div className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="h-1.5 w-12 rounded-full bg-white/20" />
                    <span className="bg-primary/70 size-3 rounded-full" />
                  </div>
                  <div className="flex h-[58%] items-end gap-1.5">
                    {[38, 55, 42, 68, 52, 80, 62, 92].map((h, i) => (
                      <span
                        key={i}
                        className="from-primary/30 flex-1 rounded-t-[3px] bg-linear-to-t to-[#5b86ff]"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <span className="h-7 rounded-md bg-white/[0.06]" />
                    <span className="h-7 rounded-md bg-white/[0.06]" />
                  </div>
                </div>
              </div>
            </div>
            {/* screen sheen */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-transparent via-white/[0.03] to-white/[0.07]" />
          </div>
        </div>
        {/* base */}
        <div className="mx-auto -mt-px h-3 w-[104%] -translate-x-[2%] rounded-b-[18px] bg-linear-to-b from-[#c9cfdd] to-[#9aa3b8] shadow-[0_18px_30px_-12px_rgba(18,32,92,0.5)]" />
      </div>

      {/* Floating cards */}
      <FloatCard
        className="top-[2%] left-[2%] w-[52%] sm:left-[6%] sm:w-[44%]"
        style={{ "--home-tilt": "-4deg" } as React.CSSProperties}
        icon={<Globe className="size-5" />}
        title="Website Development"
        text="Modern & responsive websites"
      />
      <FloatCard
        className="top-[0%] right-[0%] w-[46%] sm:w-[38%]"
        style={{ "--home-tilt": "3deg", animationDelay: "-2.4s" } as React.CSSProperties}
        icon={<Layers className="size-5" />}
        title="Custom Software"
        text="Business-specific solutions"
      />
      <FloatCard
        className="right-[0%] bottom-[0%] w-[68%] sm:w-[56%]"
        style={{ "--home-tilt": "-2.5deg", animationDelay: "-4.2s" } as React.CSSProperties}
        icon={<GraduationCap className="size-6" />}
        title="Practical Training"
        text="Learn in-demand skills and build real projects, with certificates you can verify."
        large
      />

      {/* Stack of "Build / Learn / Grow" books, bottom-left */}
      <div className="absolute bottom-[7%] left-[0%] hidden w-[24%] flex-col gap-1 sm:flex">
        {["Build", "Learn", "Grow"].map((word, i) => (
          <span
            key={word}
            className="border-border/80 bg-card text-foreground rounded-md border px-3 py-2 text-xs font-semibold shadow-[0_8px_20px_-8px_rgba(18,32,92,0.35)]"
            style={{ transform: `translateX(${[0, 8, -4][i]}px)` }}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

function FloatCard({
  icon,
  title,
  text,
  className,
  style,
  large = false,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  className?: string;
  style?: React.CSSProperties;
  large?: boolean;
}) {
  return (
    <div
      className={`home-float border-border/60 bg-card/90 absolute flex items-start gap-3 rounded-2xl border p-3.5 shadow-[0_24px_50px_-18px_rgba(18,32,92,0.45)] backdrop-blur-md sm:p-4 ${className ?? ""}`}
      style={style}
    >
      <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11">
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-foreground text-[13px] leading-tight font-semibold sm:text-sm">
          {title}
        </span>
        <span
          className={`text-muted-foreground leading-snug ${large ? "text-xs sm:text-[13px]" : "text-[11px] sm:text-xs"}`}
        >
          {text}
        </span>
      </div>
    </div>
  );
}

export { HeroScene };
