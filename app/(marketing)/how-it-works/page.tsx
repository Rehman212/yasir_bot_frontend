import type { Metadata } from "next";
import { PageHero } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How It Works",
};

const steps = [
  {
    title: "Create an account",
    description: "Sign up in minutes and choose the plan that matches your publishing volume.",
  },
  {
    title: "Connect WordPress",
    description: "Add your site URL, username, and application password, then run a connection test.",
  },
  {
    title: "Upload an Excel or CSV file",
    description: "Import articles from Excel, CSV, Google Sheets, or paste a single draft manually.",
  },
  {
    title: "Map the columns",
    description: "Match spreadsheet columns to title, content, images, categories, tags, and SEO fields.",
  },
  {
    title: "Preview articles",
    description: "Open drafts, fix issues, remove duplicates, and confirm featured media.",
  },
  {
    title: "Choose publishing settings",
    description: "Publish now, save drafts, use sheet dates, or schedule posts at intervals.",
  },
  {
    title: "Start publishing",
    description: "Launch the queue and watch real-time progress across waiting, processing, and completed jobs.",
  },
  {
    title: "View results",
    description: "Open WordPress URLs, retry failures, and keep a full publishing history.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        title="How SheetPress works"
        description="A complete process from account setup to published WordPress posts—with validation at every step."
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-sm)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
                {index + 1}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {step.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/signup">Create Free Account</Button>
          <Button href="/docs" variant="secondary">
            Read Documentation
          </Button>
        </div>
      </section>
    </>
  );
}
