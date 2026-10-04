import type { CSSProperties, ReactNode } from "react";
import { Alex_Brush } from "next/font/google";

import { formatCardDate } from "../../lib/id-card";

const signatureFont = Alex_Brush({ weight: "400", subsets: ["latin"] });

export interface InternIdCardData {
  name: string;
  email: string;
  internId: string;
  program: string;
  validTill: Date;
  startDate: Date;
  projectTitle: string | null;
  stack: string[];
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  /** Pre-rendered QR image (data URL) pointing at the public verification page. */
  qrDataUrl: string;
}

/**
 * The card is laid out on the design's 1210 x 2000 canvas and every size is
 * converted to `cqw` (1% of the card's own width), so it scales perfectly at
 * any display size - phone, desktop or print - with no media queries.
 */
const W = 1210;
const u = (px: number) => `${((px / W) * 100).toFixed(3)}cqw`;

const SHELL: CSSProperties = {
  containerType: "inline-size",
  aspectRatio: "1210 / 2000",
  width: "100%",
  maxWidth: 380,
  position: "relative",
  overflow: "hidden",
  borderRadius: u(64),
  boxShadow: "0 20px 50px -20px rgba(4,32,26,0.45)",
  breakInside: "avoid",
};

const abs = (style: CSSProperties): CSSProperties => ({ position: "absolute", ...style });

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

function Lanyard({ tint }: { tint: string }) {
  return (
    <span
      aria-hidden="true"
      style={abs({
        left: u(485),
        top: u(52),
        width: u(238),
        height: u(39),
        borderRadius: 999,
        background: tint,
      })}
    />
  );
}

function Stripe() {
  return (
    <span
      aria-hidden="true"
      style={abs({
        left: 0,
        right: 0,
        bottom: 0,
        height: u(28),
        background: "linear-gradient(90deg, #23C08A, #2B59E6 60%, #C9A24B)",
      })}
    />
  );
}

function Label({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span
      style={{ fontSize: u(22), fontWeight: 700, letterSpacing: "0.28em", color, display: "block" }}
    >
      {children}
    </span>
  );
}

/** Front of the card: identity. Always dark - a badge, independent of the site theme. */
function InternIdCardFront({ data }: { data: InternIdCardData }) {
  const initial = (data.name.trim()[0] ?? "S").toUpperCase();
  return (
    <div
      style={{
        ...SHELL,
        color: "#fff",
        background:
          "radial-gradient(120% 50% at 100% 0%, #0f5a41 0%, rgba(15,90,65,0) 62%), radial-gradient(90% 35% at 0% 100%, #0b3a4a 0%, rgba(11,58,74,0) 60%), #04201a",
      }}
    >
      <Lanyard tint="#DCE5E0" />

      {/* brand + role pill */}
      <span
        style={abs({
          left: u(103),
          top: u(151),
          width: u(106),
          height: u(106),
          borderRadius: u(26),
          background: "#1F6BFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: u(76),
          fontWeight: 800,
        })}
      >
        S
      </span>
      <div style={abs({ left: u(238), top: u(150), lineHeight: 1 })}>
        <span
          style={{ display: "block", fontSize: u(62), fontWeight: 700, letterSpacing: "-0.02em" }}
        >
          Stively
        </span>
        <span
          style={{
            display: "block",
            marginTop: u(14),
            fontSize: u(22),
            fontWeight: 600,
            letterSpacing: "0.34em",
            color: "#9FD9C4",
          }}
        >
          TECHNOLOGIES
        </span>
      </div>
      <span
        style={abs({
          left: u(927),
          top: u(168),
          width: u(180),
          height: u(71),
          borderRadius: 999,
          background: "#C9A24B",
          color: "#04201a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: u(28),
          fontWeight: 800,
          letterSpacing: "0.22em",
        })}
      >
        INTERN
      </span>

      {/* avatar */}
      <span
        style={abs({
          left: u(291),
          top: u(384),
          width: u(626),
          height: u(626),
          borderRadius: "50%",
          background: "conic-gradient(from 200deg, #2B59E6, #23C08A, #C9A24B, #2B59E6)",
        })}
      />
      <span
        style={abs({
          left: u(312),
          top: u(405),
          width: u(584),
          height: u(584),
          borderRadius: "50%",
          background: "radial-gradient(circle at 40% 35%, #125a42, #06241c 70%)",
          boxShadow: `0 0 0 ${u(10)} #04201a`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#23C08A",
          fontSize: u(250),
          fontWeight: 800,
        })}
      >
        {initial}
      </span>

      {/* name + role tag */}
      <div
        style={abs({ left: 0, right: 0, top: u(1090), textAlign: "center", padding: `0 ${u(40)}` })}
      >
        <h2
          style={{
            margin: 0,
            fontSize: u(104),
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {data.name}
        </h2>
        <p
          style={{
            margin: 0,
            marginTop: u(34),
            fontFamily: MONO,
            fontSize: u(46),
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#23C08A" }}>&lt;FrontendDeveloper</span>{" "}
          <span style={{ color: "#E8D49A" }}>role</span>
          <span style={{ color: "rgba(255,255,255,0.7)" }}>=</span>
          <span>&quot;intern&quot;</span> <span style={{ color: "#23C08A" }}>/&gt;</span>
        </p>
      </div>

      {/* info panel */}
      <div
        style={abs({
          left: u(88),
          top: u(1394),
          width: u(1034),
          height: u(387),
          borderRadius: u(64),
          border: `${u(2)} solid rgba(255,255,255,0.12)`,
          background: "rgba(255,255,255,0.06)",
        })}
      />
      <div style={abs({ left: u(145), top: u(1454) })}>
        <Label color="#9FD9C4">INTERN ID</Label>
        <span
          style={{
            display: "block",
            marginTop: u(10),
            fontFamily: MONO,
            fontSize: u(40),
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {data.internId}
        </span>
      </div>
      <div style={abs({ left: u(520), top: u(1454) })}>
        <Label color="#9FD9C4">VALID TILL</Label>
        <span
          style={{
            display: "block",
            marginTop: u(10),
            fontSize: u(42),
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {formatCardDate(data.validTill)}
        </span>
      </div>
      <div style={abs({ left: u(145), top: u(1582), width: u(640) })}>
        <Label color="#9FD9C4">PROGRAM</Label>
        <span
          style={{
            display: "block",
            marginTop: u(14),
            fontSize: u(40),
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          {data.program}
        </span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- a generated data: URL; next/image can't optimise it */}
      <img
        src={data.qrDataUrl}
        alt={`QR code to verify intern ${data.internId}`}
        style={abs({
          left: u(805),
          top: u(1458),
          width: u(260),
          height: u(260),
          borderRadius: u(28),
          background: "#fff",
          padding: u(14),
          objectFit: "contain",
        })}
      />

      {/* footer row */}
      <span
        style={abs({
          left: u(103),
          top: u(1884),
          fontSize: u(30),
          color: "rgba(255,255,255,0.92)",
          maxWidth: u(600),
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        })}
      >
        ✉ {data.email}
      </span>
      <span
        style={abs({
          right: u(103),
          top: u(1884),
          fontSize: u(30),
          color: "rgba(255,255,255,0.92)",
          whiteSpace: "nowrap",
        })}
      >
        <span style={{ color: "#23C08A" }}>✔</span> stively.com/verify
      </span>
      <Stripe />
    </div>
  );
}

/** Back of the card: the current project and holder terms. */
function InternIdCardBack({ data }: { data: InternIdCardData }) {
  const status = data.status.toLowerCase();
  const facts: [string, string, number, number][] = [
    ["START DATE", formatCardDate(data.startDate), 103, 560],
    ["END DATE", formatCardDate(data.validTill), 629, 560],
    ["MODE", "Remote", 103, 700],
    ["REPORTS TO", "Project Lead", 629, 700],
  ];
  return (
    <div style={{ ...SHELL, color: "#04201a", background: "#F5F7F5" }}>
      <Lanyard tint="#DCE5E0" />

      <span
        style={abs({
          left: u(103),
          top: u(172),
          fontSize: u(26),
          fontWeight: 700,
          letterSpacing: "0.26em",
          color: "#0E7C5A",
        })}
      >
        CURRENT PROJECT
      </span>
      <h2
        style={abs({
          left: u(103),
          top: u(215),
          width: u(1000),
          margin: 0,
          fontSize: u(74),
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        })}
      >
        {data.projectTitle ?? "Project to be assigned"}
      </h2>

      <ul
        style={abs({
          left: u(103),
          top: u(424),
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          gap: u(20),
          flexWrap: "wrap",
          width: u(1000),
        })}
      >
        {data.stack.slice(0, 4).map((s) => (
          <li
            key={s}
            style={{
              borderRadius: 999,
              background: "#D4EDE3",
              color: "#0E7C5A",
              fontSize: u(30),
              fontWeight: 600,
              padding: `${u(18)} ${u(30)}`,
            }}
          >
            {s.split(" / ")[0]}
          </li>
        ))}
      </ul>

      {facts.map(([label, value, x, y]) => (
        <div key={label} style={abs({ left: u(x), top: u(y) })}>
          <span
            style={{
              display: "block",
              fontSize: u(22),
              fontWeight: 700,
              letterSpacing: "0.26em",
              color: "#4A5D55",
            }}
          >
            {label}
          </span>
          <span
            style={{
              display: "block",
              marginTop: u(12),
              fontSize: u(40),
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </span>
        </div>
      ))}

      <pre
        style={abs({
          left: u(103),
          top: u(852),
          width: u(1004),
          height: u(302),
          margin: 0,
          boxSizing: "border-box",
          padding: `${u(52)} ${u(48)}`,
          borderRadius: u(52),
          background: "#04201a",
          color: "#fff",
          fontFamily: MONO,
          fontSize: u(38),
          lineHeight: 1.45,
          whiteSpace: "pre",
        })}
      >
        <span style={{ color: "#E8D49A" }}>const</span> intern = {"{"}
        {"\n   "}status: <span style={{ color: "#23C08A" }}>&quot;{status}&quot;</span>,{"\n   "}
        verified: <span style={{ color: "#8FA8FF" }}>true</span>
        {"\n};"}
      </pre>

      <p
        style={abs({
          left: u(103),
          top: u(1210),
          width: u(1004),
          margin: 0,
          fontSize: u(33),
          lineHeight: 1.5,
          color: "#3F5249",
        })}
      >
        This card identifies the holder as an intern of Stively Technologies. It is
        non-transferable. If found, please return to Stively Technologies or write to
        team@stively.com.
      </p>

      <div style={abs({ left: u(103), top: u(1700) })}>
        <span
          className={signatureFont.className}
          style={{ display: "block", fontSize: u(112), lineHeight: 1 }}
        >
          Abhijit K.
        </span>
        <span
          style={{
            display: "block",
            width: u(435),
            height: u(3),
            background: "#04201a",
            marginTop: u(10),
          }}
        />
        <span
          style={{
            display: "block",
            marginTop: u(20),
            fontSize: u(30),
            fontWeight: 700,
            letterSpacing: "0.14em",
          }}
        >
          ABHIJIT KARANDE
        </span>
        <span style={{ display: "block", marginTop: u(6), fontSize: u(28), color: "#4A5D55" }}>
          Founder &amp; CEO
        </span>
      </div>
      <div style={abs({ right: u(103), top: u(1836), textAlign: "right" })}>
        <span style={{ display: "block", fontSize: u(28), fontWeight: 700 }}>www.stively.com</span>
        <span style={{ display: "block", marginTop: u(6), fontSize: u(25), color: "#4A5D55" }}>
          UDYAM-RJ-17-0578717
        </span>
      </div>
      <Stripe />
    </div>
  );
}

export { InternIdCardFront, InternIdCardBack };
