import { WhatsappIcon } from "@/features/sharing/components/brand-icons";
import { cn } from "@/lib/utils";
import { mentorWhatsappUrl } from "../../lib/whatsapp";

/** "Message on WhatsApp" - opens a chat with the mentor straight from the portal, so questions reach the mentor, not the founder. Renders nothing if the mentor has no number. */
function WhatsAppButton({
  number,
  mentorName,
  message,
  className,
  label = "Message on WhatsApp",
}: {
  number: string | null | undefined;
  mentorName?: string | null;
  /** Prefilled chat text; should say whether the sender is a student or an intern. */
  message?: string;
  className?: string;
  label?: string;
}) {
  if (!number) return null;
  const first = mentorName?.trim().split(/\s+/)[0];
  return (
    <a
      href={mentorWhatsappUrl(
        number,
        message ?? `Hi${first ? ` ${first}` : ""}, I'm a Stively student. `
      )}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1fb857]",
        className
      )}
    >
      <WhatsappIcon className="size-4" />
      {label}
    </a>
  );
}

export { WhatsAppButton };
