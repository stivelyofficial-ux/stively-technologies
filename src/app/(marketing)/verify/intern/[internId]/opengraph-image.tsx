import { ImageResponse } from "next/og";

import { getPublicInternByInternId } from "@/features/internships/server/verify-queries";

export const alt = "Verified Stively intern";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The preview card shown when someone shares their Intern ID link - name, program and the verified badge only. */
export default async function Image({ params }: { params: Promise<{ internId: string }> }) {
  const { internId } = await params;
  const intern = await getPublicInternByInternId(decodeURIComponent(internId)).catch(() => null);

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
        background: "linear-gradient(135deg, #04201a 0%, #0b3a4a 70%, #0f5a41 100%)",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
        <div
          style={{
            display: "flex",
            background: "#C9A24B",
            color: "#04201a",
            padding: "10px 26px",
            borderRadius: 999,
            fontWeight: 800,
            fontSize: 24,
            letterSpacing: 4,
          }}
        >
          INTERN
        </div>
      </div>

      {intern ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
            {intern.name}
          </div>
          <div style={{ display: "flex", fontSize: 36, color: "#D5E9E0" }}>{intern.program}</div>
          <div style={{ display: "flex", fontSize: 26, color: "#23C08A" }}>
            at Stively Technologies
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", fontSize: 56, fontWeight: 800 }}>
          Stively intern verification
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
          {intern ? `Intern ID ${intern.internId}` : "Verify at stively.com"}
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
          {intern ? "VERIFIED" : "VERIFY"}
        </div>
      </div>
    </div>,
    size
  );
}
