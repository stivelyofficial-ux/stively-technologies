/** wa.me deep link to a mentor's WhatsApp (10-digit Indian mobile, stored without +91), optionally with a prefilled message. */
export function mentorWhatsappUrl(number: string, text?: string): string {
  const base = `https://wa.me/91${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
