import Image from "next/image";

import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/home/section-heading";

/** Additional screenshot grid - only rendered by the caller when `galleryImages` is non-empty. */
function CaseStudyGallery({ galleryImages, title }: { galleryImages: string[]; title: string }) {
  return (
    <Container className="flex flex-col gap-10">
      <SectionHeading eyebrow="Gallery" title="More screens" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {galleryImages.map((url, index) => (
          <div
            key={url}
            className="border-border/70 bg-muted relative aspect-video overflow-hidden rounded-2xl border"
          >
            <Image
              src={url}
              alt={`${title} screenshot ${index + 1}`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </Container>
  );
}

export { CaseStudyGallery };
