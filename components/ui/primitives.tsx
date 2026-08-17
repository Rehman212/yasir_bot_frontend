import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "brand" | "accent";
  className?: string;
}) {
  const tones = {
    neutral: "bg-surface-muted text-muted border-border",
    success: "bg-success-soft text-success border-success/20",
    warning: "bg-warning-soft text-warning border-warning/20",
    danger: "bg-danger-soft text-danger border-danger/20",
    brand: "bg-brand-soft text-brand border-brand/20",
    accent: "bg-accent-soft text-accent border-accent/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "max-w-2xl space-y-3",
        align === "center" ? "mx-auto text-center" : "text-left",
      )}
    >
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-relaxed text-muted sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function PageHero({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="border-b border-border bg-mesh">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h1 className="font-[family-name:var(--font-sora)] max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          {description}
        </p>
      </div>
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, " ");
  const map: Record<string, "neutral" | "success" | "warning" | "danger" | "brand" | "accent"> = {
    Connected: "success",
    "Needs reconnect": "warning",
    Disconnected: "warning",
    Published: "success",
    Scheduled: "brand",
    Failed: "danger",
    Draft: "neutral",
    Queued: "accent",
    Waiting: "neutral",
    Processing: "brand",
    Completed: "success",
    Cancelled: "neutral",
    Uploaded: "success",
    Linked: "accent",
    Validating: "brand",
    Pending: "neutral",
  };

  return (
    <Badge tone={map[status] ?? map[normalized] ?? "neutral"}>
      {normalized}
    </Badge>
  );
}
