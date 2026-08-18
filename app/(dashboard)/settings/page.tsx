"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/primitives";
import {
  ApiError,
  getAccessToken,
  usersApi,
  type UserPreferences,
} from "@/lib/api";

const intervalOptions = [
  [0, "Instant (default)"],
  [10, "10 seconds between posts"],
  [20, "20 seconds between posts"],
  [30, "30 seconds between posts"],
  [60, "1 minute between posts"],
  [120, "2 minutes between posts"],
  [300, "5 minutes between posts"],
] as const;

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
      <div>
        <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Profile, publishing defaults, notifications, and security controls.
        </p>
      </div>

      {loading ? <p className="text-sm text-muted">Loading settings…</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {message ? <p className="text-sm text-brand">{message}</p> : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">Profile settings</h2>
          <Input
            label="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input label="Email" type="email" value={email} readOnly />
          <Button type="button" disabled={saving || loading} onClick={saveProfile}>
            Save profile
          </Button>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">Publishing settings</h2>
          <Select
            label="Default timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
          >
            <option value="PKT">PKT (UTC+5)</option>
            <option value="UTC">UTC</option>
            <option value="EST">EST</option>
          </Select>
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

        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">Security settings</h2>
          <p className="text-sm text-muted">Active sessions · Change password · 2FA · Login history</p>
          <Button variant="secondary" type="button">
            Enable two-factor authentication
          </Button>
          <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm">
            <p className="font-medium">Current session · Chrome on Windows</p>
            <p className="text-muted">Last active just now</p>
          </div>
          <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm">
            <p className="font-medium">Login history</p>
            <p className="text-muted">Aug 17, 09:10 · Successful login</p>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">Subscription settings</h2>
          <p className="text-sm text-muted">
            View your current plan, article usage, and website limits.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button href="/subscription">Manage subscription</Button>
            <Button variant="secondary" href="/pricing">
              Upgrade or downgrade
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
