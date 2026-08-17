import type { Metadata } from "next";
import { PageHero } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "About Us",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About SheetPress"
        description="We help content teams publish WordPress articles faster, safer, and with fewer manual steps."
      />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-16 text-base leading-relaxed text-muted sm:px-6">
        <p>
          SheetPress started from a simple frustration: moving article batches
          from spreadsheets into WordPress took too long and left too much room
          for mistakes.
        </p>
        <p>
          Today, freelancers, SEO teams, and agencies use SheetPress to connect
          multiple sites, import structured content, validate every row, and
          publish or schedule with confidence.
        </p>
        <p>
          Our focus is operational clarity—clean imports, reliable queues,
          transparent errors, and professional tools that feel calm under
          pressure.
        </p>
      </section>
    </>
  );
}
