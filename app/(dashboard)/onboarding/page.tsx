"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { downloadSampleSheet } from "@/lib/download-sample-sheet";
import {
  ApiError,
  articlesApi,
  getAccessToken,
  importsApi,
  publishingApi,
  sitesApi,
  type ArticleRow,
  type WpSite,
} from "@/lib/api";

const steps = [
  "Welcome",
  "Connect WordPress",
  "Test connection",
  "Sample sheet",
  "Upload sheet",
  "Publish test",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [applicationPassword, setApplicationPassword] = useState("");
  const [site, setSite] = useState<WpSite | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    errors: number;
  } | null>(null);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    sitesApi
      .list()
      .then((res) => {
        if (res.data[0]) setSite(res.data[0]);
      })
      .catch(() => undefined);
  }, [router]);

  async function saveSite() {
    setError("");
    setMessage("");
    if (!name || !url || !username || !applicationPassword) {
      setError("Fill all WordPress connection fields.");
      return false;
    }
    setLoading(true);
    try {
      const res = await sitesApi.create({
        name,
        url,
        username,
        applicationPassword,
      });
      setSite(res.data);
      setMessage(
        res.data.status === "CONNECTED"
          ? "Site saved and connected."
          : "Site saved, but WordPress connection needs reconnect (check URL/credentials).",
      );
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save site");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function testSite() {
    if (!site?.id) {
      setError("Save a WordPress site first.");
      return false;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await sitesApi.test(site.id);
      const next = res.data.site ?? (res.data as WpSite);
      setSite(next);
      setMessage("Connection successful.");
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Connection failed");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function uploadSheet() {
    if (!site?.id) {
      setError("Connect a WordPress site first.");
      return false;
    }
    if (!file) {
      setError("Choose a CSV or Excel file to upload.");
      return false;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await importsApi.upload(site.id, file);
      setImportResult({
        imported: res.data.imported,
        errors: res.data.errors.length,
      });
      const list = await articlesApi.list({ siteId: site.id });
      setArticles(list.data);
      setMessage(`Imported ${res.data.imported} articles.`);
      return res.data.imported > 0;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Import failed");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function publishTest() {
    const first = articles[0];
    if (!first) {
      setError("Import articles first.");
      return false;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await publishingApi.draft(first.id);
      setMessage(`Draft created on WordPress for “${first.title}”.`);
      return true;
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Publish test failed — site may still be disconnected.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function onContinue() {
    setError("");
    if (step === 1) {
      const ok = await saveSite();
      if (!ok) return;
    }
    if (step === 2) {
      const ok = await testSite();
      if (!ok) return;
    }
    if (step === 4) {
      const ok = await uploadSheet();
      if (!ok) return;
    }
    if (step === 5) {
      await publishTest();
      router.push("/dashboard");
      return;
    }
    setStep((s) => Math.min(steps.length - 1, s + 1));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome to SheetPress
        </h1>
        <p className="mt-1 text-sm text-muted">
          Complete these steps to publish your first WordPress article.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(index)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold",
              index === step
                ? "border-brand bg-brand text-white"
                : index < step
                  ? "border-accent/30 bg-accent-soft text-accent"
                  : "border-border bg-white text-muted",
            )}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>

      <Card className="p-6">
        {step === 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Welcome</h2>
            <p className="text-sm leading-relaxed text-muted">
              SheetPress helps you upload spreadsheet content, map columns, and
              publish or schedule posts to WordPress without plugins.
            </p>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Connect first WordPress website</h2>
            <Input
              label="Website name"
              placeholder="Growth Lab Blog"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="WordPress URL"
              placeholder="https://blog.example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Input
              label="Username"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              label="Application password"
              type="password"
              value={applicationPassword}
              onChange={(e) => setApplicationPassword(e.target.value)}
            />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Test WordPress connection</h2>
            <p className="text-sm text-muted">
              We will verify authentication against your WordPress REST API.
            </p>
            {site ? (
              <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm">
                Testing: <span className="font-medium">{site.name}</span> ·{" "}
                {site.url} · status{" "}
                <span className="font-semibold">{site.status}</span>
              </div>
            ) : (
              <div className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
                No site saved yet. Go back and connect WordPress.
              </div>
            )}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Download sample sheet</h2>
            <p className="text-sm text-muted">
              Use our template with Title, Content, Image, Category, Tags, SEO,
              and Publish Date columns. Content cells support HTML for headings.
            </p>
            <Button
              variant="secondary"
              type="button"
              onClick={() => downloadSampleSheet()}
            >
              Download Sample Sheet
            </Button>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Upload first article sheet</h2>
            <p className="text-sm text-muted">
              Site: {site?.name || "None selected — connect a site first"}
            </p>
            <Input
              label="Upload Excel or CSV"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {importResult ? (
              <p className="text-sm text-brand">
                Last import: {importResult.imported} articles
                {importResult.errors
                  ? ` · ${importResult.errors} row errors`
                  : ""}
              </p>
            ) : null}
          </div>
        )}
        {step === 5 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Publish a test article</h2>
            <p className="text-sm text-muted">
              Continue will create a WordPress draft for your first imported
              article, then open the dashboard.
            </p>
            {articles[0] ? (
              <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm">
                Test article: <span className="font-medium">{articles[0].title}</span>
              </div>
            ) : (
              <div className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
                No imported articles found. Upload a sheet first.
              </div>
            )}
          </div>
        )}

        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-brand">{message}</p> : null}

        <div className="mt-8 flex justify-between gap-3">
          <Button
            variant="secondary"
            type="button"
            disabled={step === 0 || loading}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" disabled={loading} onClick={onContinue}>
              {loading ? "Working…" : "Continue"}
            </Button>
          ) : (
            <Button type="button" disabled={loading} onClick={onContinue}>
              {loading ? "Publishing…" : "Finish and open dashboard"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
