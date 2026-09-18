"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card, StatusBadge } from "@/components/ui/primitives";
import {
  APP_FEATURES,
  ApiError,
  adminApi,
  getAccessToken,
  usersApi,
  type AdminUser,
  type UserProfile,
} from "@/lib/api";

const FEATURE_LABELS: Record<string, string> = {
  sites: "Websites",
  import: "Import Articles",
  articles: "All Articles",
  queue: "Publishing Queue",
  calendar: "Content Calendar",
  media: "Media",
  templates: "Templates",
  activity: "Activity Logs",
  subscription: "Subscription",
  settings: "Settings",
};

export default function AdminPage() {
  const router = useRouter();
  const [me, setMe] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [denied, setDenied] = useState<string[]>([]);

  const [companyName, setCompanyName] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [companyDisplay, setCompanyDisplay] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [promoPopupEnabled, setPromoPopupEnabled] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  async function load() {
    const res = await adminApi.listUsers();
    setUsers(res.data);
  }

  async function loadSiteSettings() {
    const res = await adminApi.getSiteSettings();
    setCompanyName(res.data.companyName);
    setCompanyUrl(res.data.companyUrl);
    setCompanyDisplay(res.data.companyDisplay);
    setWhatsappNumber(res.data.whatsappNumber);
    setPromoPopupEnabled(res.data.promoPopupEnabled);
  }

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    usersApi
      .me()
      .then((res) => {
        setMe(res.data);
        if (res.data.role !== "ADMIN") {
          router.replace("/dashboard");
        }
      })
      .catch(() => router.replace("/login"));
    load().catch((err) => setError(err.message || "Failed to load users"));
    loadSiteSettings().catch((err) =>
      setError(err.message || "Failed to load site settings"),
    );
  }, [router]);

  async function saveSiteSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setError("");
    setMessage("");
    try {
      await adminApi.updateSiteSettings({
        companyName,
        companyUrl,
        companyDisplay,
        whatsappNumber,
        promoPopupEnabled,
      });
      setMessage("Site settings saved. Footer, contact, and popup updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  }
  function toggleDenied(feature: string) {
    setDenied((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature],
    );
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await adminApi.createUser({
        name,
        email,
        password,
        role,
        deniedFeatures: role === "ADMIN" ? [] : denied,
      });
      setName("");
      setEmail("");
      setPassword("");
      setRole("USER");
      setDenied([]);
      setMessage("User created.");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }

  async function setUserRole(id: string, next: "USER" | "ADMIN") {
    setError("");
    try {
      await adminApi.updateRole(id, next);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Role update failed");
    }
  }

  async function savePermissions(user: AdminUser, nextDenied: string[]) {
    setError("");
    try {
      await adminApi.updatePermissions(user.id, nextDenied);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Permission update failed",
      );
    }
  }

  if (me && me.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
          Admin
        </h1>
        <p className="mt-1 text-sm text-muted">
          Create users, promote admins, and deny menu features per user.
        </p>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {message ? <p className="text-sm text-brand">{message}</p> : null}

      <Card className="space-y-4 p-6">
        <div>
          <h2 className="font-semibold">Website branding & popup</h2>
          <p className="mt-1 text-sm text-muted">
            Controls the promo popup, footer “Built by” link, WhatsApp number,
            and Contact page — updates the whole public site.
          </p>
        </div>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={saveSiteSettings}>
          <label className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted px-4 py-3 md:col-span-2">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={promoPopupEnabled}
              onChange={(e) => setPromoPopupEnabled(e.target.checked)}
            />
            <span className="text-sm font-medium">
              Enable promo popup on public pages
            </span>
          </label>
          <Input
            label="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
          <Input
            label="Display text (footer / popup)"
            value={companyDisplay}
            onChange={(e) => setCompanyDisplay(e.target.value)}
            placeholder="Socialvelocityy.com"
            required
          />
          <Input
            label="Company website URL"
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            placeholder="https://socialvelocityy.com"
            required
          />
          <Input
            label="WhatsApp number"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="+923156679495"
            required
          />
          <div className="md:col-span-2">
            <Button type="submit" disabled={savingSettings}>
              {savingSettings ? "Saving…" : "Save site settings"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Add user</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={createUser}>
          <Input
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </Select>

          {role === "USER" ? (
            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium">Deny access to</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {APP_FEATURES.map((feature) => (
                  <label
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted"
                  >
                    <input
                      type="checkbox"
                      checked={denied.includes(feature)}
                      onChange={() => toggleDenied(feature)}
                    />
                    {FEATURE_LABELS[feature] || feature}
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="md:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create user"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold">Users</h2>
        </div>
        <div className="divide-y divide-border">
          {users.map((user) => (
            <div key={user.id} className="space-y-3 px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {user.name}{" "}
                    <StatusBadge
                      status={user.role === "ADMIN" ? "CONNECTED" : "PENDING"}
                    />
                  </p>
                  <p className="text-sm text-muted">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.role === "ADMIN" ? (
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => setUserRole(user.id, "USER")}
                    >
                      Demote to user
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setUserRole(user.id, "ADMIN")}
                    >
                      Make admin
                    </Button>
                  )}
                </div>
              </div>

              {user.role !== "ADMIN" ? (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                    Denied features
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {APP_FEATURES.map((feature) => {
                      const checked = (user.deniedFeatures || []).includes(
                        feature,
                      );
                      return (
                        <label
                          key={feature}
                          className="flex items-center gap-2 text-sm text-muted"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const current = user.deniedFeatures || [];
                              const next = checked
                                ? current.filter((f) => f !== feature)
                                : [...current, feature];
                              savePermissions(user, next);
                            }}
                          />
                          {FEATURE_LABELS[feature] || feature}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted">
                  Admins have full access to every option.
                </p>
              )}
            </div>
          ))}
          {users.length === 0 ? (
            <p className="px-6 py-8 text-sm text-muted">No users yet.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
