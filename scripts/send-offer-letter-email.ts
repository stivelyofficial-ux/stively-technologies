/**
 * One-off: emails an intern their already-issued offer letter.
 * Usage: NODE_PATH=<dir containing a server-only stub> npx tsx scripts/send-offer-letter-email.ts STV-FEI-OL-2026-00001
 * (the stub is only needed because the email module imports "server-only").
 */
import { prisma } from "@/lib/prisma";
import { sendOfferLetterEmail } from "@/features/internship-documents/server/email";

async function main() {
  const number = process.argv[2];
  if (!number) throw new Error("Pass the offer letter's document number.");
  const ok = await sendOfferLetterEmail(number);
  console.log(ok ? `SENT ${number}` : `NOT SENT ${number}`);
  if (!ok) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
