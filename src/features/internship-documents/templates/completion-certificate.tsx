import "server-only";

import path from "node:path";
import { readFileSync } from "node:fs";
import * as React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

import { registerDocumentFonts } from "@/features/documents/lib/fonts";
import { shortDate } from "../lib/documents";
import type { LetterData } from "./letters";

/**
 * The Internship Completion Certificate, laid out on Stively's own
 * certificate artwork (1491 x 1055). The artwork is the template with its
 * per-intern areas (ID/date, name, duration, description, QR) cleared; the
 * live values are drawn back into those same spots, so a certificate looks
 * exactly like the approved design, just with the intern's real details.
 */
const BG = `data:image/png;base64,${readFileSync(
  path.join(process.cwd(), "src/features/internship-documents/assets/internship-certificate-bg.png")
).toString("base64")}`;

const W = 1491;
const H = 1055;
const INK = "#0A3526";

const s = StyleSheet.create({
  page: { width: W, height: H, fontFamily: "Geist", color: INK },
  bg: { position: "absolute", top: 0, left: 0, width: W, height: H },
  id: {
    position: "absolute",
    left: 838,
    top: 68,
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 0.6,
  },
  issued: {
    position: "absolute",
    left: 838,
    top: 90,
    fontSize: 14,
    fontWeight: 500,
    color: "#37524A",
  },
  nameBox: {
    position: "absolute",
    left: 238,
    top: 296,
    width: 776,
    height: 82,
    alignItems: "center",
    justifyContent: "center",
  },
  duration: {
    position: "absolute",
    left: 415,
    top: 513,
    fontSize: 14.5,
    fontWeight: 500,
    color: "#1D2B27",
  },
  durationSub: { position: "absolute", left: 415, top: 534, fontSize: 14, color: "#5B6B64" },
  desc: {
    position: "absolute",
    left: 244,
    top: 575,
    width: 766,
    fontSize: 16.5,
    lineHeight: 1.5,
    color: "#2A3A34",
    textAlign: "center",
  },
  qr: { position: "absolute", left: 1267, top: 820, width: 110, height: 110 },
  verify: {
    position: "absolute",
    left: 1204,
    top: 979,
    width: 232,
    textAlign: "center",
    fontSize: 12.5,
    fontWeight: 600,
    letterSpacing: 0.4,
    color: "#CDE8DC",
  },
});

function titleDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export function CompletionCertificateDocument({
  data,
  qrDataUrl,
}: {
  data: LetterData;
  qrDataUrl: string;
}) {
  registerDocumentFonts();
  const end = data.endDate ?? data.issuedAt;
  const nameSize = data.recipientName.length > 30 ? 36 : data.recipientName.length > 22 ? 44 : 54;
  return (
    <Document
      title={`Internship Completion Certificate - ${data.recipientName}`}
      author="Stively Technologies"
    >
      <Page size={[W, H]} style={s.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf <Image> has no alt prop */}
        <Image src={BG} style={s.bg} />
        <Text style={s.id}>ID: {data.documentNumber}</Text>
        <Text style={s.issued}>Issued: {shortDate(data.issuedAt)}</Text>
        <View style={s.nameBox}>
          <Text style={{ fontSize: nameSize, fontWeight: 600, color: INK }}>
            {data.recipientName}
          </Text>
        </View>
        <Text style={s.duration}>
          {titleDate(data.startDate)} – {titleDate(end)}
        </Text>
        <Text style={s.durationSub}>({data.durationLabel})</Text>
        <Text style={s.desc}>
          {data.recipientName} completed the {data.program} at Stively Technologies, working on a
          client-style project reviewed by the Stively team.
        </Text>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf <Image> has no alt prop */}
        <Image src={qrDataUrl} style={s.qr} />
        <Text style={s.verify}>{data.documentNumber}</Text>
      </Page>
    </Document>
  );
}
