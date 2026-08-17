import type { Metadata } from "next";
import { PageHero } from "@/components/ui/primitives";
import { faqs } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "FAQs",
};

export default function FaqsPage() {
  return (
    <>
      <PageHero
        title="Frequently asked questions"
        description="Everything from plugins and featured images to scheduling, SEO fields, and credential security."
      />
      <section className="mx-auto max-w-3xl space-y-3 px-4 py-16 sm:px-6">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="rounded-2xl border border-border bg-white px-5 py-4 shadow-[var(--shadow-sm)]"
            open
          >
            <summary className="cursor-pointer list-none font-semibold text-foreground">
              {faq.question}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p>
          </details>
        ))}
      </section>
    </>
  );
}
