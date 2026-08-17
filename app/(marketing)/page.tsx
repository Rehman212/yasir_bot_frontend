import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Layers3,
  Play,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, SectionHeading } from "@/components/ui/primitives";
import { DownloadSampleSheetButton } from "@/components/download-sample-sheet-button";
import {
  benefits,
  faqs,
  features,
  howItWorksSteps,
  integrations,
  pricingPlans,
  sampleSheetRows,
  testimonials,
} from "@/lib/mock-data";

function HeroVisual() {
  return (
    <div className="relative animate-float">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand/15 via-accent/10 to-transparent blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-border bg-surface-muted px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e07a5f]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f2cc8f]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#81b29a]" />
          </div>
          <p className="text-xs font-medium text-muted">Publishing queue</p>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-surface-muted p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Spreadsheet import
              </p>
              <div className="mt-3 space-y-2">
                {["Title", "Content", "Image", "Category", "Publish Date"].map(
                  (col, i) => (
                    <div
                      key={col}
                      className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs shadow-sm"
                    >
                      <span className="font-medium text-foreground">{col}</span>
                      <span className="text-brand">
                        {["A", "B", "C", "D", "E"][i]}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold">Batch progress</p>
                <span className="text-xs font-semibold text-accent">78%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-brand-soft">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-brand to-accent" />
              </div>
              <p className="mt-2 text-xs text-muted">
                39 of 50 articles published to WordPress
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { title: "SEO Guide", status: "Published", tone: "text-success" },
              { title: "Content Calendar", status: "Scheduled", tone: "text-brand" },
              { title: "Image Optimization", status: "Retrying", tone: "text-warning" },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-surface-muted p-3"
              >
                <p className="text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                <p className={`mt-1 text-xs font-medium ${item.tone}`}>
                  {item.status}
                </p>
              </div>
            ))}
            <div className="rounded-xl bg-brand p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                Connected
              </p>
              <p className="mt-1 text-sm font-semibold">blog.growthlab.com</p>
              <p className="mt-2 text-xs text-white/75">
                WordPress · Yoast SEO · Media library synced
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-mesh">
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
          <div className="animate-fade-up">
            <p className="font-[family-name:var(--font-sora)] text-4xl font-semibold tracking-tight text-brand sm:text-5xl">
              SheetPress
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-sora)] text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
              Publish WordPress Articles Automatically From a Spreadsheet
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Upload your articles, connect WordPress, and publish or schedule
              all your content in a few clicks.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/signup" size="lg">
                Start Posting Free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/how-it-works" variant="secondary" size="lg">
                <Play className="h-4 w-4" />
                Watch Demo
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                No plugin required
              </span>
              <span className="inline-flex items-center gap-2">
                <Timer className="h-4 w-4 text-accent" />
                Schedule in minutes
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                SEO fields supported
              </span>
            </div>
          </div>
          <div className="animate-fade-up delay-200">
            <HeroVisual />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white/70 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            Trusted platforms
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {integrations.map((item) => (
              <span
                key={item}
                className="rounded-full border border-border bg-surface-muted px-4 py-2 text-sm font-medium text-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="How it works"
            title="From spreadsheet to WordPress in four steps"
            description="A clear publishing workflow designed for freelancers, content teams, and agencies."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {howItWorksSteps.map((step, index) => (
              <div
                key={step.title}
                className="animate-fade-up rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-sm)]"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-sm font-bold text-brand">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-border bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Features"
            title="Everything you need to publish at scale"
            description="Import, validate, schedule, and monitor every article without leaving the dashboard."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-surface-muted/70 p-5 transition hover:border-brand/30 hover:bg-white hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
                  <Layers3 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Spreadsheet example"
            title="See how your sheet should look"
            description="Map columns once, then reuse the same structure for every import batch."
          />
          <Card className="mt-10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-brand text-white">
                  <tr>
                    {["Title", "Content", "Image", "Category", "Publish Date"].map(
                      (heading) => (
                        <th key={heading} className="px-4 py-3 font-semibold">
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sampleSheetRows.map((row) => (
                    <tr key={row.title} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{row.title}</td>
                      <td className="px-4 py-3 text-muted">{row.content}</td>
                      <td className="px-4 py-3 text-muted">{row.image}</td>
                      <td className="px-4 py-3 text-muted">{row.category}</td>
                      <td className="px-4 py-3 text-muted">{row.publishDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-muted px-4 py-4">
              <p className="text-sm text-muted">
                Includes sample SEO fields, tags, and featured image URLs.
              </p>
              <DownloadSampleSheetButton />
            </div>
          </Card>
        </div>
      </section>

      <section className="border-y border-border bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Dashboard preview"
            title="A publishing command center"
            description="Review imports, manage the queue, and keep your content calendar full."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Imported articles",
                detail: "286 ready for review",
                icon: Layers3,
              },
              {
                title: "Publishing queue",
                detail: "12 processing now",
                icon: Timer,
              },
              {
                title: "Content calendar",
                detail: "38 scheduled posts",
                icon: CalendarDays,
              },
              {
                title: "Failed posts",
                detail: "7 need attention",
                icon: ShieldCheck,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-surface-muted p-5"
              >
                <item.icon className="h-5 w-5 text-brand" />
                <h3 className="mt-4 font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Benefits"
            title="Built for reliable content operations"
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-sm)]"
              >
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <h3 className="mt-3 font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-y border-border bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Pricing"
            title="Plans that grow with your publishing volume"
            description="Start free, then scale websites, articles, and team seats as you need them."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-2xl border p-6 ${
                  plan.featured
                    ? "border-brand bg-brand text-white shadow-[var(--shadow-lg)]"
                    : "border-border bg-surface-muted"
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-wide opacity-80">
                  {plan.name}
                </p>
                <p className="mt-3 font-[family-name:var(--font-sora)] text-4xl font-semibold">
                  ${plan.price.monthly}
                  <span className="text-base font-medium opacity-70">/mo</span>
                </p>
                <p
                  className={`mt-2 text-sm ${plan.featured ? "text-white/80" : "text-muted"}`}
                >
                  {plan.description}
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {[
                    plan.articles,
                    plan.websites,
                    plan.storage,
                    plan.team,
                    plan.seo,
                    plan.support,
                  ].map((line) => (
                    <li key={line} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  href="/signup"
                  className="mt-8"
                  variant={plan.featured ? "secondary" : "primary"}
                >
                  Choose {plan.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Testimonials"
            title="Teams that replaced manual publishing"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <blockquote
                key={item.name}
                className="rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-sm)]"
              >
                <p className="text-sm leading-relaxed text-foreground">
                  “{item.quote}”
                </p>
                <footer className="mt-5">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted">{item.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="faqs" className="border-y border-border bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="FAQs"
            title="Answers before you connect your first site"
          />
          <div className="mt-10 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-border bg-surface-muted px-5 py-4"
              >
                <summary className="cursor-pointer list-none font-semibold text-foreground">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Ready to automate your WordPress publishing?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Create a free account, connect a site, and publish your first
            spreadsheet batch today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/signup" size="lg">
              Create Free Account
            </Button>
            <Button href="/how-it-works" variant="secondary" size="lg">
              View Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
