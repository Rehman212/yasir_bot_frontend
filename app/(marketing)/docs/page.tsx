import type { Metadata } from "next";
import { PageHero } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Documentation",
};

const sections = [
  {
    title: "Getting started",
    items: ["Create an account", "Verify your email", "Complete onboarding"],
  },
  {
    title: "WordPress connections",
    items: [
      "Generate an application password",
      "Test connection",
      "Reconnect or remove a site",
    ],
  },
  {
    title: "Imports",
    items: [
      "Excel and CSV uploads",
      "Google Sheets",
      "Column mapping",
      "Validation rules",
    ],
  },
  {
    title: "Publishing",
    items: [
      "Drafts, immediate publish, and scheduling",
      "Queue controls",
      "Retries and error handling",
    ],
  },
];

export default function DocsPage() {
  return (
    <>
      <PageHero
        title="Documentation"
        description="Step-by-step help for connecting WordPress, importing spreadsheets, and managing the publishing queue."
      />
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-16 sm:px-6 md:grid-cols-2">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-sm)]"
          >
            <h2 className="text-lg font-semibold text-foreground">
              {section.title}
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {section.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}
