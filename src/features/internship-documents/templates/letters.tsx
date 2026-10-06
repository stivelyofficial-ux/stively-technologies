import "server-only";

import path from "node:path";
import { readFileSync } from "node:fs";
import * as React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

import { registerDocumentFonts } from "@/features/documents/lib/fonts";
import { firstName, longDate, shortDate } from "../lib/documents";

/**
 * The offer letter, letter of recommendation and experience letter, built
 * from Stively's own letter designs: the header band, the signature/seal
 * block and the footer band are cut straight from the template artwork (so
 * the logo, signature and official seal are pixel-identical), and everything
 * that varies per intern is live text laid on top at the template's positions.
 * Wording is gender-neutral on purpose - the template's "he/him" was written
 * for one example intern.
 */
const ASSET_DIR = path.join(process.cwd(), "src/features/internship-documents/assets");

function toDataUri(file: string): string {
  return `data:image/png;base64,${readFileSync(path.join(ASSET_DIR, file)).toString("base64")}`;
}

// Template artwork is 1240 x 1754 px for an A4 page; every position below is
// the template's pixel value times S, so it lines up with the original.
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const S = PAGE_W / 1240;
const px = (n: number) => n * S;

const INK = "#0B2A20";
const BODY = "#1F2A26";
const GREEN = "#0E7A52";
const GOLD = "#C9A24B";

const styles = StyleSheet.create({
  page: { backgroundColor: "#FBFCFA", fontFamily: "Geist", color: BODY },
  header: { position: "absolute", top: 0, left: 0, width: PAGE_W, height: px(182) },
  signoff: { position: "absolute", top: px(1470), left: 0, width: PAGE_W, height: px(200) },
  footer: {
    position: "absolute",
    top: px(1690),
    left: 0,
    width: PAGE_W,
    height: PAGE_H - px(1690),
  },
  ref: {
    position: "absolute",
    top: px(256),
    left: px(113),
    fontSize: 7.2,
    fontWeight: 700,
    letterSpacing: 0.9,
  },
  date: {
    position: "absolute",
    top: px(256),
    right: px(113),
    fontSize: 7.2,
    fontWeight: 700,
    letterSpacing: 0.9,
  },
  title: {
    position: "absolute",
    top: px(322),
    left: px(113),
    fontSize: 27,
    fontWeight: 700,
    color: INK,
    letterSpacing: 0.4,
  },
  subtitle: {
    position: "absolute",
    top: px(411),
    left: px(113),
    fontSize: 9.4,
    fontWeight: 700,
    color: GREEN,
    letterSpacing: 5.2,
  },
  rule: {
    position: "absolute",
    top: px(448),
    left: px(110),
    width: px(80),
    height: 1.4,
    backgroundColor: GOLD,
  },
  body: { position: "absolute", left: px(113), width: PAGE_W - px(113) * 2 },
  p: { fontSize: 10, lineHeight: 1.6, marginBottom: 14 },
  strong: { fontWeight: 700, color: INK },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, marginBottom: 6 },
  cell: { width: "50%", marginBottom: 12 },
  cellLabel: { fontSize: 6.6, fontWeight: 700, color: GREEN, letterSpacing: 1.8, marginBottom: 3 },
  cellValue: { fontSize: 9.6, fontWeight: 700, color: INK },
});

const HEADER_IMAGES = {
  OFFER_LETTER: toDataUri("letter-header-offer.png"),
  LETTER_OF_RECOMMENDATION: toDataUri("letter-header-lor.png"),
  EXPERIENCE_LETTER: toDataUri("letter-header-exp.png"),
} as const;
const SIGNOFF = toDataUri("letter-signoff.png");
const FOOTER = toDataUri("letter-footer.png");

export interface LetterData {
  documentNumber: string;
  issuedAt: Date;
  recipientName: string;
  program: string;
  startDate: Date;
  endDate: Date | null;
  durationLabel: string;
  /** Offer letter "Reporting to" (mentor at issuance); falls back to the generic project lead. */
  reportingTo?: string | null;
}

/** "Frontend Development Internship" -> "Frontend Developer Intern". */
export function roleFor(program: string): string {
  if (/frontend/i.test(program)) return "Frontend Developer Intern";
  return `${program.replace(/\s*internship$/i, "").trim() || "Stively"} Intern`;
}

function B({ children }: { children: React.ReactNode }) {
  return <Text style={styles.strong}>{children}</Text>;
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue}>{value}</Text>
    </View>
  );
}

function LetterPage({
  kind,
  data,
  title,
  bodyTop,
  children,
}: {
  kind: keyof typeof HEADER_IMAGES;
  data: LetterData;
  title: string;
  bodyTop: number;
  children: React.ReactNode;
}) {
  return (
    <Page size="A4" style={styles.page}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf <Image> has no alt prop */}
      <Image src={HEADER_IMAGES[kind]} style={styles.header} />
      <Text style={styles.ref}>REF: {data.documentNumber}</Text>
      <Text style={styles.date}>DATE: {shortDate(data.issuedAt)}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{data.program.toUpperCase()}</Text>
      <View style={styles.rule} />
      <View style={[styles.body, { top: px(bodyTop) }]}>{children}</View>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf <Image> has no alt prop */}
      <Image src={SIGNOFF} style={styles.signoff} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf <Image> has no alt prop */}
      <Image src={FOOTER} style={styles.footer} />
    </Page>
  );
}

export function OfferLetterDocument({ data }: { data: LetterData }) {
  registerDocumentFonts();
  const first = firstName(data.recipientName);
  const role = roleFor(data.program);
  return (
    <Document title={`Offer Letter - ${data.recipientName}`} author="Stively Technologies">
      <LetterPage kind="OFFER_LETTER" data={data} title="OFFER LETTER" bodyTop={500}>
        <Text style={[styles.p, { marginBottom: 22 }]}>
          To, <B>{data.recipientName}</B>
        </Text>
        <Text style={[styles.p, styles.strong, { marginBottom: 14 }]}>
          Subject: Offer of Internship — {role}
        </Text>
        <Text style={styles.p}>Dear {first},</Text>
        <Text style={styles.p}>
          We are pleased to offer you the position of <B>{role}</B> at Stively Technologies. Having
          completed the Frontend Development training, you will join our team to work on a real
          client-style project using HTML, CSS, JavaScript and React.js.
        </Text>
        <Text style={styles.p}>
          For every project you successfully deliver during the internship, you will receive a
          stipend of <B>₹3,000 per project</B>. On completion you will receive an Internship
          Certificate, a Letter of Recommendation and an Experience Letter.
        </Text>
        <View style={styles.grid}>
          <Cell label="ROLE" value={role} />
          <Cell label="START DATE" value={longDate(data.startDate)} />
          <Cell label="DURATION" value={data.durationLabel} />
          <Cell label="MODE" value="Remote" />
          <Cell label="STIPEND" value="₹3,000 per delivered project" />
          <Cell label="REPORTING TO" value={data.reportingTo ?? "Project Lead, Stively"} />
        </View>
        <Text style={styles.p}>
          We look forward to having you on board. Your acceptance of the internship terms on the
          Stively intern portal confirms this offer.
        </Text>
      </LetterPage>
    </Document>
  );
}

export function RecommendationLetterDocument({ data }: { data: LetterData }) {
  registerDocumentFonts();
  const first = firstName(data.recipientName);
  const end = data.endDate ?? data.issuedAt;
  return (
    <Document
      title={`Letter of Recommendation - ${data.recipientName}`}
      author="Stively Technologies"
    >
      <LetterPage
        kind="LETTER_OF_RECOMMENDATION"
        data={data}
        title="LETTER OF RECOMMENDATION"
        bodyTop={512}
      >
        <Text style={[styles.p, styles.strong, { marginBottom: 14 }]}>
          Subject: Recommendation for {data.recipientName}
        </Text>
        <Text style={styles.p}>To Whom It May Concern,</Text>
        <Text style={styles.p}>
          It is my pleasure to recommend <B>{data.recipientName}</B>, who completed the{" "}
          {data.program} at Stively Technologies from {longDate(data.startDate)} to {longDate(end)}.
        </Text>
        <Text style={styles.p}>
          During the internship, {first} worked on a client-style project, building responsive
          interfaces with HTML, CSS, JavaScript and React.js, and responded to feedback from the
          Stively team.
        </Text>
        <Text style={styles.p}>
          Beyond technical skill, {first} showed ownership, clear communication and a genuine
          willingness to learn, and managed the internship timeline independently.
        </Text>
        <Text style={styles.p}>
          I am confident {first} will be a valuable addition to any organisation or academic
          program, and I recommend them without reservation.
        </Text>
      </LetterPage>
    </Document>
  );
}

export function ExperienceLetterDocument({ data }: { data: LetterData }) {
  registerDocumentFonts();
  const first = firstName(data.recipientName);
  const end = data.endDate ?? data.issuedAt;
  return (
    <Document title={`Experience Letter - ${data.recipientName}`} author="Stively Technologies">
      <LetterPage kind="EXPERIENCE_LETTER" data={data} title="EXPERIENCE LETTER" bodyTop={512}>
        <Text style={[styles.p, styles.strong, { marginBottom: 14 }]}>
          Subject: Internship Experience Certificate
        </Text>
        <Text style={styles.p}>To Whom It May Concern,</Text>
        <Text style={styles.p}>
          This is to certify that <B>{data.recipientName}</B> worked with Stively Technologies as a{" "}
          <B>{roleFor(data.program)}</B> from <B>{longDate(data.startDate)}</B> to{" "}
          <B>{longDate(end)}</B>, in remote mode.
        </Text>
        <Text style={styles.p}>
          During this period, {first} worked on a real-world, client-style project, including
          responsive websites and React.js components. Responsibilities included UI development,
          cross-device testing, version control with Git and deployment.
        </Text>
        <Text style={styles.p}>
          {first}&apos;s conduct throughout the internship was professional, and the final project
          was reviewed by the Stively team.
        </Text>
        <Text style={styles.p}>We wish {first} every success in future endeavours.</Text>
      </LetterPage>
    </Document>
  );
}
