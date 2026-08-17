"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
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
import { DownloadSampleSheetButton } from "@/components/download-sample-sheet-button";

const steps = [
  "Select website",
  "Upload file",
  "Validate",
  "Preview",
  "Confirm",
];

export default function ImportPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [sites, setSites] = useState<WpSite[]>([]);
  const [siteId, setSiteId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imported, setImported] = useState(0);
  const [errors, setErrors] = useState<Array<{ row: number; message: string }>>(
    [],
  );
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [publishMode, setPublishMode] = useState<
    "keep" | "draft_wp" | "publish_wp"
  >("keep");
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
        setSites(res.data);
        if (res.data[0]) setSiteId(res.data[0].id);
      })
      .catch((err) => setError(err.message || "Failed to load sites"));
  }, [router]);

  async function runImport() {
    if (!siteId) {
      setError("Select a website first.");
      return false;
    }
    if (!file) {
      setError("Choose a CSV or Excel file.");
      return false;
    }
    setLoading(true);
    setError("");
    try {
      const res = await importsApi.upload(siteId, file);
      setImported(res.data.imported);
      setErrors(res.data.errors || []);
      const list = await articlesApi.list({ siteId });
      setArticles(list.data.slice(0, 20));
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Import failed");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function onContinue() {
    if (step === 1) {
      const ok = await runImport();
      if (!ok) return;
    }
    if (step === 4) {
      await finishImport();
      return;
    }
    setStep((s) => s + 1);
  }

  async function finishImport() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      if (publishMode === "draft_wp" || publishMode === "publish_wp") {
        let ok = 0;
        let fail = 0;
        for (const article of articles) {
          try {
            if (publishMode === "draft_wp") {
              await publishingApi.draft(article.id);
            } else {
              await publishingApi.publish(article.id);
            }
            ok += 1;
          } catch {
            fail += 1;
          }
        }
        setMessage(
          `WordPress push done: ${ok} succeeded${fail ? `, ${fail} failed` : ""}.`,
        );
      }
      router.push("/articles");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Finish failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
            Import Articles
          </h1>
          <p className="mt-1 text-sm text-muted">
            Upload Excel or CSV and create draft articles for your WordPress site.
          </p>
        </div>
        <DownloadSampleSheetButton label="Download sample sheet" />
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
            {sites.length === 0 ? (
              <p className="text-sm text-muted">
                No sites yet.{" "}
                <a href="/sites/new" className="font-medium text-brand">
                  Add a WordPress site
                </a>{" "}
                first.
              </p>
            ) : (
              <Select
                label="Select website"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status})
                  </option>
                ))}
              </Select>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Input
              type="file"
              label="Choose CSV or Excel file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="flex flex-wrap items-center gap-3">
              <DownloadSampleSheetButton />
              <p className="text-sm text-muted">
                Includes Focus Keyword, LSI Keywords, SEO Title, Meta Description.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Imported articles", String(imported), "Completed"],
              ["Row errors", String(errors.length), errors.length ? "Failed" : "Completed"],
              ["Selected site", sites.find((s) => s.id === siteId)?.name || "—", "Queued"],
            ].map(([label, value, status]) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-surface-muted p-4"
              >
                <p className="text-sm text-muted">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
                <div className="mt-2">
                  <StatusBadge status={status} />
                </div>
              </div>
            ))}
            {errors.length > 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 space-y-2 text-sm text-danger">
                {errors.slice(0, 5).map((e) => (
                  <p key={`${e.row}-${e.message}`}>
                    Row {e.row}: {e.message}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            {articles.length === 0 ? (
              <p className="text-sm text-muted">No articles imported yet.</p>
            ) : (
              articles.map((article) => (
                <div
                  key={article.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="text-xs text-muted">
                      {article.category || "Uncategorized"} · {article.status}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" href={`/articles/${article.id}`}>
                    Open
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-sm">
            <p>
              <span className="font-semibold">Articles imported:</span> {imported}
            </p>
            <p>
              <span className="font-semibold">Website:</span>{" "}
              {sites.find((s) => s.id === siteId)?.name || "—"}
            </p>
            <Select
              label="What should happen next?"
              value={publishMode}
              onChange={(e) =>
                setPublishMode(
                  e.target.value as "keep" | "draft_wp" | "publish_wp",
                )
              }
            >
              <option value="keep">
                Keep in SheetPress only (use sheet Post Status / Draft)
              </option>
              <option value="draft_wp">
                Push all to WordPress as drafts now
              </option>
              <option value="publish_wp">
                Publish all to WordPress now
              </option>
            </Select>
            <p className="text-muted">
              Sheet column <strong>Post Status</strong> can be{" "}
              <code>draft</code>, <code>publish</code>, or <code>scheduled</code>
              . You can also open each article later and click Publish.
            </p>
            {message ? <p className="text-brand">{message}</p> : null}
          </div>
        )}

        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

        <div className="mt-8 flex justify-between">
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
              {loading ? "Working…" : "Finish"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
