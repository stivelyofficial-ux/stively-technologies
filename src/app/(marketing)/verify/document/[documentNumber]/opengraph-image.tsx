import { ImageResponse } from "next/og";

import { getPublicInternshipDocument } from "@/features/internship-documents/server/verify-queries";

export const alt = "Verified Stively document";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Preview card for a shared internship document - name, document type and the verified badge only. */
export default async function Image({ params }: { params: Promise<{ documentNumber: string }> }) {
  const { documentNumber } = await params;
  const doc = await getPublicInternshipDocument(decodeURIComponent(documentNumber)).catch(
    () => null
  );
  const valid = doc?.status === "ISSUED";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        color: "#fff",
        background: "linear-gradient(135deg, #04201a 0%, #0b3a2f 60%, #0f5a41 100%)",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            display: "flex",
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "#1F6BFF",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44,
            fontWeight: 800,
          }}
        >
          S
        </div>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>Stively</div>
      </div>

      {valid && doc ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#23C08A",
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            {doc.kindLabel.toUpperCase()}
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
            {doc.recipientName}
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#D5E9E0" }}>{doc.program}</div>
        </div>
      ) : (
        <div style={{ display: "flex", fontSize: 56, fontWeight: 800 }}>
          Stively document verification
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 24,
          color: "#9FD9C4",
        }}
      >
        <div style={{ display: "flex" }}>
          {valid && doc ? `Reference ${doc.documentNumber}` : "Verify at stively.com"}
        </div>
        <div
          style={{
            display: "flex",
            background: "#23C08A",
            color: "#04201a",
            padding: "10px 22px",
            borderRadius: 999,
            fontWeight: 700,
          }}
        >
          {valid ? "VERIFIED" : "VERIFY"}
        </div>
      </div>
    </div>,
    size
  );
}
