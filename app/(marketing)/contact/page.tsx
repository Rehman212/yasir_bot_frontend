import type { Metadata } from "next";
import { PageHero } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact us"
        description="Questions about SheetPress, custom software, or enterprise workflows? Reach out and we will respond quickly."
      />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-sm)]">
            <h2 className="text-lg font-semibold text-foreground">
              Built by {brand.company.name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Need custom software, automation, or a SaaS product like
              SheetPress? Contact{" "}
              <a
                href={brand.company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand hover:underline"
              >
                {brand.company.displayUrl}
              </a>
              .
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <p>
                <span className="font-medium text-foreground">Website: </span>
                <a
                  href={brand.company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  {brand.company.displayUrl}
                </a>
              </p>
              <p>
                <span className="font-medium text-foreground">WhatsApp: </span>
                <a
                  href={brand.company.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  {brand.company.whatsapp}
                </a>
              </p>
              <p>
                <span className="font-medium text-foreground">Email: </span>
                <span className="text-muted">{brand.supportEmail}</span>
              </p>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button href={brand.company.whatsappLink} target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </Button>
              <Button
                href={brand.company.url}
                variant="secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit {brand.company.displayUrl}
              </Button>
            </div>
          </div>
          <div className="rounded-xl bg-brand-soft p-4 text-sm text-brand">
            Typical response time is under one business day. Include your
            account email and website URL for faster help.
          </div>
        </div>
        <form className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-sm)]">
          <Input label="Name" placeholder="Your full name" required />
          <Input label="Email" type="email" placeholder="you@company.com" required />
          <Input label="Subject" placeholder="How can we help?" required />
          <Textarea label="Message" placeholder="Tell us what you need…" required />
          <Button type="submit">Send message</Button>
        </form>
      </section>
    </>
  );
}
