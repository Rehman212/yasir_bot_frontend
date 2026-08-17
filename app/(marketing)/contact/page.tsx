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
        title="Contact support"
        description="Questions about setup, billing, or enterprise workflows? Send a message and we will respond quickly."
      />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-semibold text-foreground">Support email</h2>
          <p className="mt-2 text-sm text-muted">{brand.supportEmail}</p>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            Typical response time is under one business day on paid plans.
            Include your account email and website URL for faster help.
          </p>
          <div className="mt-6 rounded-xl bg-brand-soft p-4 text-sm text-brand">
            Form status: ready — messages are accepted 24/7.
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
