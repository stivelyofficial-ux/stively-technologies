import { Mail, Phone, Clock, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { siteConfig } from "@/config/site";
import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";

interface ContactMethod {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

/**
 * Only renders methods with real values - siteConfig.contactPhone and
 * siteConfig.businessHours / officeLocation are optional, and nothing is
 * shown for a field that has no real value.
 */
function ContactMethods() {
  const methods: ContactMethod[] = [
    {
      icon: Mail,
      label: "Email",
      value: siteConfig.contactEmail,
      href: `mailto:${siteConfig.contactEmail}`,
    },
    ...(siteConfig.contactPhone
      ? [
          {
            icon: Phone as LucideIcon,
            label: "Phone",
            value: siteConfig.contactPhone,
            href: `tel:${siteConfig.contactPhone}`,
          },
        ]
      : []),
    ...(siteConfig.businessHours
      ? [{ icon: Clock as LucideIcon, label: "Business hours", value: siteConfig.businessHours }]
      : []),
    ...(siteConfig.officeLocation
      ? [{ icon: MapPin as LucideIcon, label: "Location", value: siteConfig.officeLocation }]
      : []),
  ];

  return (
    <Section className="py-10 md:py-14">
      <Container>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {methods.map((method, index) => (
            <li key={method.label}>
              <Reveal delay={index * 55} className="h-full">
                <div className="border-border/70 bg-card hover:border-primary/30 flex h-full flex-col gap-4 rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(43,89,230,0.35)]">
                  <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
                    <method.icon className="size-6" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
                      {method.label}
                    </span>
                    {method.href ? (
                      <a
                        href={method.href}
                        className="text-foreground hover:text-primary text-base font-semibold break-words"
                      >
                        {method.value}
                      </a>
                    ) : (
                      <span className="text-foreground text-base font-semibold">
                        {method.value}
                      </span>
                    )}
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export { ContactMethods };
