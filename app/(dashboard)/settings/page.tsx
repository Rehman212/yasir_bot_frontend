"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  KeyRound,
  Search,
  Shield,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge, Card } from "@/components/ui/primitives";
import { TimezonePicker } from "@/components/ui/timezone-picker";
import {
  ApiError,
  getAccessToken,
  usersApi,
  type UserPreferences,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const intervalOptions = [
  [0, "Instant (default)"],
  [10, "10 seconds between posts"],
  [20, "20 seconds between posts"],
  [30, "30 seconds between posts"],
  [60, "1 minute between posts"],
  [120, "2 minutes between posts"],
  [300, "5 minutes between posts"],
] as const;

type SectionId = "profile" | "publishing" | "security" | "subscription";

const SECTIONS: {
  id: SectionId;
  label: string;
  hint: string;
  icon: typeof UserRound;
  keywords: string[];
}[] = [
  {
    id: "profile",
    label: "Profile",
    hint: "Name and email",
    icon: UserRound,
    keywords: ["profile", "name", "email", "account"],
  },
  {
    id: "publishing",
    label: "Publishing",
    hint: "Timezone, defaults, retries",
    icon: Bell,
    keywords: [
      "publish",
      "timezone",
      "pkt",
      "interval",
      "retry",
      "notification",
      "draft",
      "schedule",
    ],
  },
  {
    id: "security",
    label: "Security",
    hint: "Sessions and 2FA",
    icon: Shield,
    keywords: ["security", "password", "2fa", "session", "login"],
  },
  {
    id: "subscription",
    label: "Subscription",
    hint: "Plan and billing",
    icon: KeyRound,
    keywords: ["subscription", "plan", "billing", "upgrade", "usage"],
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [timezone, setTimezone] = useState("PKT");
  const [defaultStatus, setDefaultStatus] = useState<
    "draft" | "publish" | "schedule"
  >("draft");
  const [publishIntervalSeconds, setPublishIntervalSeconds] = useState(0);
  const [retryLimit, setRetryLimit] = useState(3);
  const [emailFailedPosts, setEmailFailedPosts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<SectionId>("profile");

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    usersApi
      .me()
      .then(({ data }) => {
        const prefs = data.preferences || {};
        setName(data.name || "");
        setEmail(data.email || "");
        setPreferences(prefs);
        setTimezone(String(prefs.timezone || "PKT"));
        setDefaultStatus(
          (prefs.defaultArticleStatus as "draft" | "publish" | "schedule") ||
            "draft",
        );
        setPublishIntervalSeconds(
          Math.max(0, Number(prefs.publishIntervalSeconds) || 0),
        );
        setRetryLimit(Math.max(0, Number(prefs.retryLimit) || 3));
        setEmailFailedPosts(prefs.emailFailedPosts !== false);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load settings"),
      )
      .finally(() => setLoading(false));
  }, [router]);

  const visibleSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.hint.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.includes(q) || q.includes(k)),
    );
  }, [query]);

  useEffect(() => {
    if (visibleSections.length && !visibleSections.some((s) => s.id === active)) {
      setActive(visibleSections[0].id);
    }
  }, [visibleSections, active]);

  async function saveProfile() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await usersApi.updateProfile({ name: name.trim() });
      setMessage("Profile saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Profile save failed");
    } finally {
      setSaving(false);
    }
  }

  async function savePublishingDefaults() {
    setSaving(true);
    setError("");
    setMessage("");
    const next: UserPreferences = {
      ...preferences,
      timezone,
      defaultArticleStatus: defaultStatus,
      publishIntervalSeconds,
      retryLimit,
      emailFailedPosts,
    };
    try {
      const res = await usersApi.updatePreferences(next);
      setPreferences(res.data.preferences);
      setMessage(
        publishIntervalSeconds === 0
          ? "Publishing defaults saved. Imported posts will publish instantly."
          : `Publishing defaults saved. Posts will publish every ${publishIntervalSeconds} seconds.`,
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Publishing settings save failed",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted">
            Profile, publishing defaults, security, and subscription shortcuts.
          </p>
        </div>
      </div>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search settings (timezone, password, plan…)"
          className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-3 text-sm shadow-sm outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-[var(--ring)]"
        />
      </div>

      {loading ? <p className="text-sm text-muted">Loading settings…</p> : null}
      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-xl border border-brand/20 bg-brand-soft px-4 py-3 text-sm text-brand">
          {message}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Card className="h-fit p-2 lg:sticky lg:top-24">
          <nav className="space-y-1">
            {visibleSections.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted">No matching sections.</p>
            ) : (
              visibleSections.map((section) => {
                const Icon = section.icon;
                const on = active === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActive(section.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition",
                      on
                        ? "bg-brand text-white shadow-md shadow-brand/20"
                        : "text-foreground hover:bg-surface-muted",
                    )}
                  >
                    <Icon
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        on ? "text-white" : "text-muted",
                      )}
                    />
                    <span>
                      <span className="block text-sm font-semibold">
                        {section.label}
                      </span>
                      <span
                        className={cn(
                          "block text-xs",
                          on ? "text-white/80" : "text-muted",
                        )}
                      >
                        {section.hint}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </nav>
        </Card>

        <div className="space-y-5">
          {active === "profile" && visibleSections.some((s) => s.id === "profile") ? (
            <Card className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
                  Profile settings
                </h2>
                <Badge tone="brand">Account</Badge>
              </div>
              <Input
                label="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <Input label="Email" type="email" value={email} readOnly />
              <Button
                type="button"
                disabled={saving || loading}
                onClick={saveProfile}
              >
                Save profile
              </Button>
            </Card>
          ) : null}

          {active === "publishing" &&
          visibleSections.some((s) => s.id === "publishing") ? (
            <Card className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
                  Publishing settings
                </h2>
                <Badge tone="accent">Defaults</Badge>
              </div>

              <TimezonePicker value={timezone} onChange={setTimezone} />

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Default article status"
                  value={defaultStatus}
                  onChange={(event) =>
                    setDefaultStatus(
                      event.target.value as "draft" | "publish" | "schedule",
                    )
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="publish">Publish</option>
                  <option value="schedule">Schedule</option>
                </Select>
                <Select
                  label="Article publishing interval"
                  value={String(publishIntervalSeconds)}
                  onChange={(event) =>
                    setPublishIntervalSeconds(Number(event.target.value))
                  }
                >
                  {intervalOptions.map(([seconds, label]) => (
                    <option key={seconds} value={seconds}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <p className="text-xs text-muted">
                Used when “Publish all to WordPress” is selected after an import.
                Instant publishes continuously; other options wait between posts.
              </p>
              <Input
                label="Retry limit"
                type="number"
                min={0}
                max={10}
                value={retryLimit}
                onChange={(event) => setRetryLimit(Number(event.target.value))}
              />
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={emailFailedPosts}
                  onChange={(event) => setEmailFailedPosts(event.target.checked)}
                  className="rounded border-border"
                />
                Email notifications for failed posts
              </label>
              <Button
                type="button"
                disabled={saving || loading}
                onClick={savePublishingDefaults}
              >
                {saving ? "Saving…" : "Save publishing defaults"}
              </Button>
            </Card>
          ) : null}

          {active === "security" &&
          visibleSections.some((s) => s.id === "security") ? (
            <Card className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
                  Security settings
                </h2>
                <Badge tone="warning">Protected</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-surface-muted/60 p-4">
                  <p className="text-sm font-semibold">Current session</p>
                  <p className="mt-1 text-sm text-muted">Chrome on Windows</p>
                  <p className="mt-2 text-xs text-muted">Last active just now</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-surface-muted/60 p-4">
                  <p className="text-sm font-semibold">Login history</p>
                  <p className="mt-1 text-sm text-muted">
                    Recent successful sign-ins appear here.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" type="button" disabled>
                  Change password
                </Button>
                <Button variant="secondary" type="button" disabled>
                  Enable two-factor authentication
                </Button>
              </div>
            </Card>
          ) : null}

          {active === "subscription" &&
          visibleSections.some((s) => s.id === "subscription") ? (
            <Card className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
                  Subscription settings
                </h2>
                <Badge tone="brand">Billing</Badge>
              </div>
              <p className="text-sm text-muted">
                View your current plan, article usage, and website limits on the
                subscription page.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button href="/subscription">Manage subscription</Button>
                <Button variant="secondary" href="/pricing">
                  Upgrade or downgrade
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
