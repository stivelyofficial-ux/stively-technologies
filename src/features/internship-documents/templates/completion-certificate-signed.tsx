import "server-only";

import path from "node:path";
import { readFileSync } from "node:fs";
import * as React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

import { registerDocumentFonts } from "@/features/documents/lib/fonts";
import { shortDate } from "../lib/documents";
import type { LetterData } from "./letters";

/**
 * The redesigned Internship Completion Certificate: drawn entirely in vector
 * (no baked-in text or signature), so every name, date and signature is live
 * and crisp at any zoom, and the signatory is whoever the document row says.
 * Deep green frame, ivory field, a restrained gold rule; Playfair Display for
 * the title and name, Geist for details, Alex Brush for the signature, the
 * official seal as supplied. Documents issued before signatories existed keep
 * the original artwork template (completion-certificate.tsx).
 */
const SEAL = `data:image/png;base64,${readFileSync(
  path.join(process.cwd(), "src/features/internship-documents/assets/official-seal.png")
).toString("base64")}`;

const W = 1491;
const H = 1055;

const GREEN = "#0A3526";
const GREEN_MID = "#0F5A3E";
const GOLD = "#B8903A";
const GOLD_LIGHT = "#D9BE7C";
const IVORY = "#FBF8F0";
const INK = "#0B2A20";
const MUTED = "#5B6B64";

const FRAME = 26; // green border thickness

const s = StyleSheet.create({
  page: { width: W, height: H, backgroundColor: GREEN, fontFamily: "Geist", color: INK },
  field: {
    position: "absolute",
    top: FRAME,
    left: FRAME,
    width: W - FRAME * 2,
    height: H - FRAME * 2,
    backgroundColor: IVORY,
  },
  goldFrame: {
    position: "absolute",
    top: FRAME + 18,
    left: FRAME + 18,
    width: W - (FRAME + 18) * 2,
    height: H - (FRAME + 18) * 2,
    borderWidth: 1.6,
    borderColor: GOLD,
  },
  goldFrameInner: {
    position: "absolute",
    top: FRAME + 26,
    left: FRAME + 26,
    width: W - (FRAME + 26) * 2,
    height: H - (FRAME + 26) * 2,
    borderWidth: 0.6,
    borderColor: GOLD_LIGHT,
  },
  corner: {
    position: "absolute",
    width: 14,
    height: 14,
    backgroundColor: GOLD,
    transform: "rotate(45deg)",
  },
  center: { position: "absolute", left: 0, width: W, alignItems: "center" },
  caps: { fontWeight: 600, letterSpacing: 5, color: MUTED },
});

function longIst(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function Diamond({ left, top }: { left: number; top: number }) {
  return <View style={[s.corner, { left: left - 7, top: top - 7 }]} />;
}

function Ornament({ top }: { top: number }) {
  return (
    <View style={[s.center, { top, flexDirection: "row", justifyContent: "center" }]}>
      <View style={{ width: 210, height: 1.2, backgroundColor: GOLD_LIGHT, marginTop: 6 }} />
      <View
        style={{
          width: 12,
          height: 12,
          marginHorizontal: 16,
          backgroundColor: GOLD,
          transform: "rotate(45deg)",
        }}
      />
      <View style={{ width: 210, height: 1.2, backgroundColor: GOLD_LIGHT, marginTop: 6 }} />
    </View>
  );
}

const SKILLS = [
  "HTML5",
  "CSS3",
  "JavaScript",
  "React.js",
  "Tailwind CSS",
  "Git & GitHub",
  "Responsive Design",
];

export function SignedCompletionCertificateDocument({
  data,
  qrDataUrl,
}: {
  data: LetterData;
  qrDataUrl: string;
}) {
  registerDocumentFonts();
  const end = data.endDate ?? data.issuedAt;
  const isFrontend = /frontend/i.test(data.program);
  const nameSize = data.recipientName.length > 34 ? 46 : data.recipientName.length > 26 ? 56 : 68;
  const signatory = data.signatoryName ?? "Stively Technologies";
  const signatoryTitle = data.signatoryTitle ?? "Stively Technologies";

  return (
    <Document
      title={`Internship Completion Certificate - ${data.recipientName}`}
      author="Stively Technologies"
    >
      <Page size={[W, H]} style={s.page}>
        <View style={s.field} />
        <View style={s.goldFrame} />
        <View style={s.goldFrameInner} />
        <Diamond left={FRAME + 18} top={FRAME + 18} />
        <Diamond left={W - FRAME - 18} top={FRAME + 18} />
        <Diamond left={FRAME + 18} top={H - FRAME - 18} />
        <Diamond left={W - FRAME - 18} top={H - FRAME - 18} />

        {/* Header: brand left, reference right */}
        <View
          style={{
            position: "absolute",
            top: 86,
            left: 104,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 14,
              backgroundColor: GREEN_MID,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 38, fontWeight: 700 }}>S</Text>
          </View>
          <View style={{ marginLeft: 16 }}>
            <Text style={{ fontSize: 25, fontWeight: 700, color: INK }}>Stively Technologies</Text>
            <Text style={{ fontSize: 10.5, letterSpacing: 4.5, color: MUTED, marginTop: 4 }}>
              LEARN · BUILD · GROW
            </Text>
          </View>
        </View>
        <View style={{ position: "absolute", top: 90, right: 104, alignItems: "flex-end" }}>
          <Text style={{ fontSize: 10.5, letterSpacing: 3, color: MUTED }}>CERTIFICATE ID</Text>
          <Text style={{ fontSize: 17, fontWeight: 700, letterSpacing: 0.8, marginTop: 3 }}>
            {data.documentNumber}
          </Text>
          <Text style={{ fontSize: 13.5, color: MUTED, marginTop: 4 }}>
            Issued {shortDate(data.issuedAt)}
          </Text>
        </View>

        {/* Title */}
        <View style={[s.center, { top: 160 }]}>
          <Text
            style={{
              fontFamily: "Playfair Display",
              fontWeight: 700,
              fontSize: 98,
              letterSpacing: 8,
              color: GREEN,
            }}
          >
            INTERNSHIP
          </Text>
        </View>
        <View style={[s.center, { top: 282 }]}>
          <Text style={{ fontSize: 24, fontWeight: 600, letterSpacing: 13, color: GOLD }}>
            COMPLETION CERTIFICATE
          </Text>
        </View>
        <Ornament top={336} />

        {/* Recipient */}
        <View style={[s.center, { top: 382 }]}>
          <Text style={[s.caps, { fontSize: 13 }]}>THIS IS TO CERTIFY THAT</Text>
        </View>
        <View style={[s.center, { top: 412 }]}>
          <Text
            style={{
              fontFamily: "Playfair Display",
              fontWeight: 600,
              fontSize: nameSize,
              color: INK,
            }}
          >
            {data.recipientName}
          </Text>
        </View>
        <View
          style={{
            position: "absolute",
            top: 412 + nameSize * 1.32,
            left: W / 2 - 300,
            width: 600,
            height: 1.4,
            backgroundColor: GOLD,
          }}
        />

        <View style={[s.center, { top: 528 }]}>
          <Text
            style={{
              fontFamily: "Cormorant Garamond",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 29,
              color: MUTED,
            }}
          >
            has successfully completed the
          </Text>
        </View>
        <View style={[s.center, { top: 566 }]}>
          <Text
            style={{
              fontFamily: "Playfair Display",
              fontWeight: 700,
              fontSize: 42,
              color: GREEN_MID,
            }}
          >
            {data.program}
          </Text>
        </View>

        {/* Details */}
        <View
          style={{
            position: "absolute",
            top: 650,
            left: 200,
            width: W - 400,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 10.5, letterSpacing: 3.5, color: GOLD, fontWeight: 600 }}>
              DURATION
            </Text>
            <Text style={{ fontSize: 19, fontWeight: 600, marginTop: 6 }}>
              {data.durationLabel}
            </Text>
            <Text style={{ fontSize: 13.5, color: MUTED, marginTop: 3 }}>
              {longIst(data.startDate)} – {longIst(end)}
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: GOLD_LIGHT, marginHorizontal: 20 }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 10.5, letterSpacing: 3.5, color: GOLD, fontWeight: 600 }}>
              MODE
            </Text>
            <Text style={{ fontSize: 19, fontWeight: 600, marginTop: 6 }}>
              Remote · Paid Internship
            </Text>
            <Text style={{ fontSize: 13.5, color: MUTED, marginTop: 3 }}>Project based</Text>
          </View>
          <View style={{ width: 1, backgroundColor: GOLD_LIGHT, marginHorizontal: 20 }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 10.5, letterSpacing: 3.5, color: GOLD, fontWeight: 600 }}>
              STIPEND
            </Text>
            <Text style={{ fontSize: 19, fontWeight: 600, marginTop: 6 }}>₹3,000 per project</Text>
            <Text style={{ fontSize: 13.5, color: MUTED, marginTop: 3 }}>
              Paid on each delivered project
            </Text>
          </View>
        </View>

        <View style={[s.center, { top: 738 }]}>
          <Text
            style={{
              width: 900,
              textAlign: "center",
              fontSize: 16,
              lineHeight: 1.55,
              color: "#2A3A34",
            }}
          >
            {data.recipientName} completed the {data.program} at Stively Technologies as a paid
            intern, earning a stipend of ₹3,000 for each client-style project delivered, every one
            reviewed and approved by the Stively team.
          </Text>
        </View>

        {isFrontend && (
          <View style={[s.center, { top: 812 }]}>
            <View style={{ flexDirection: "row" }}>
              {SKILLS.map((skill) => (
                <View
                  key={skill}
                  style={{
                    borderWidth: 1,
                    borderColor: GOLD_LIGHT,
                    borderRadius: 20,
                    paddingVertical: 6,
                    paddingHorizontal: 15,
                    marginHorizontal: 5,
                    backgroundColor: "#F3EFE3",
                  }}
                >
                  <Text style={{ fontSize: 12.5, fontWeight: 500, color: GREEN }}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Signature */}
        <View style={{ position: "absolute", top: 846, left: 130, width: 380 }}>
          <Text style={{ fontFamily: "Alex Brush", fontSize: 58, color: INK, lineHeight: 1 }}>
            {signatory}
          </Text>
          <View style={{ height: 1.2, backgroundColor: INK, marginTop: -8 }} />
          <Text style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1.4, marginTop: 8 }}>
            {signatory.toUpperCase()}
          </Text>
          <Text style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>{signatoryTitle}</Text>
        </View>

        {/* Seal */}
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf <Image> has no alt prop */}
        <Image
          src={SEAL}
          style={{ position: "absolute", top: 856, left: W / 2 - 75, width: 150, height: 134 }}
        />

        {/* Verification */}
        <View style={{ position: "absolute", top: 842, right: 130, alignItems: "center" }}>
          <View
            style={{
              padding: 7,
              borderWidth: 1,
              borderColor: GOLD_LIGHT,
              backgroundColor: "#FFFFFF",
              borderRadius: 6,
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf <Image> has no alt prop */}
            <Image src={qrDataUrl} style={{ width: 88, height: 88 }} />
          </View>
          <Text
            style={{
              fontSize: 10.5,
              letterSpacing: 2.8,
              color: GREEN,
              fontWeight: 600,
              marginTop: 8,
            }}
          >
            SCAN TO VERIFY
          </Text>
          <Text style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>www.stively.com</Text>
        </View>
      </Page>
    </Document>
  );
}
