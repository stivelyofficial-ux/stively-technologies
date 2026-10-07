import { Container } from "@/components/shared/container";
import { DeviceFrame } from "@/components/sections/portfolio/device-frame";
import { SectionHeading } from "@/components/home/section-heading";

/** Device-mockup grid - only rendered by the caller when `mockupImages` is non-empty. */
function CaseStudyDeviceMockups({
  mockupImages,
  title,
}: {
  mockupImages: string[];
  title: string;
}) {
  return (
    <Container className="flex flex-col gap-10">
      <SectionHeading eyebrow="Responsive mockups" title="Built for every screen" />
      <div className="grid gap-6 sm:grid-cols-2">
        {mockupImages.map((url, index) => (
          <DeviceFrame key={url} imageUrl={url} alt={`${title} mockup ${index + 1}`} />
        ))}
      </div>
    </Container>
  );
}

export { CaseStudyDeviceMockups };
