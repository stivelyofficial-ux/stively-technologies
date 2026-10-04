import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderInternshipDocumentPdf } from "@/features/internship-documents/server/render";

/**
 * Same contract as the training-certificate route: rendered fresh from the
 * row on every request, only the intern it was issued to (or an admin) can
 * fetch it, and nothing is cached. The public /verify/document page shows a
 * status summary only - never these bytes.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentNumber: string }> }
) {
  const { documentNumber } = await params;
  const forceDownload = request.nextUrl.searchParams.get("mode") === "download";

  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=/api/internship-documents/${documentNumber}/pdf`, request.url)
    );
  }

  const doc = await prisma.internshipDocument.findUnique({
    where: { documentNumber },
    include: { track: { select: { studentId: true } } },
  });
  if (!doc) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  const isOwner = doc.track.studentId === session.user.id;
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "You don't have access to this document." }, { status: 403 });
  }
  if (doc.status === "REVOKED") {
    return NextResponse.json({ error: "This document has been revoked." }, { status: 410 });
  }

  let file: Buffer;
  try {
    file = await renderInternshipDocumentPdf(doc);
  } catch (error) {
    console.error("internship document pdf route: render failed:", error);
    return NextResponse.json(
      { error: "Something went wrong preparing your document. Please contact support." },
      { status: 500 }
    );
  }

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${forceDownload ? "attachment" : "inline"}; filename="${doc.documentNumber}.pdf"`,
      "Content-Length": String(file.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}
