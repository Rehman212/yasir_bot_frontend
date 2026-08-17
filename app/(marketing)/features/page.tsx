import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { features } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Features",
};

const deepFeatures = [
  ...features,
  {
    title: "Sheet column mapping",
    description:
      "Map any column names to titles, content, SEO fields, taxonomy, and publish dates.",
  },
  {
    title: "Error handling",
    description:
      "Catch invalid dates, missing titles, broken image URLs, and duplicates before publish.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        title="Features built for serious WordPress publishing"
        description="Bulk posting, scheduling, media uploads, multi-site management, and SEO mapping in one workflow."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          {deepFeatures.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-sm)]"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button href="/signup" size="lg">
            Start with Free Plan
          </Button>
        </div>
      </section>
    </>
  );
}
