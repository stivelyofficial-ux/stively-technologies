import { siteConfig } from "@/config/site";

/** The only thing a certificate's QR code ever encodes - a public URL, nothing else. */
export function getCertificateVerificationUrl(certificateNumber: string): string {
  // Always the live site: this URL is printed in the PDF's QR code and shared on LinkedIn, so it must never be a localhost or preview address.
  return `${siteConfig.productionUrl}/verify/${certificateNumber}`;
}
