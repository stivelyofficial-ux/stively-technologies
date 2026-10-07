import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";

/**
 * Per-project technology list - deliberately NOT the site-wide TechStack
 * component, which describes Stively's own stack. This one renders whatever
 * techStack: string[] the admin entered for this project.
 */
function CaseStudyTechStack({ techStack }: { techStack: string[] }) {
  return (
    <Container>
      <div className="border-border/70 bg-muted/40 flex flex-col gap-5 rounded-3xl border p-8 sm:flex-row sm:items-center sm:gap-10">
        <Eyebrow>Technology stack</Eyebrow>
        <ul className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <li
              key={tech}
              className="border-border bg-card text-foreground rounded-full border px-4 py-1.5 text-sm font-medium"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}

export { CaseStudyTechStack };
