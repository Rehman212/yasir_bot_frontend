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
  usersApi,
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

const intervalOptions = [
  [0, "Instant (default)"],
  [10, "10 seconds"],
  [20, "20 seconds"],
  [30, "30 seconds"],
  [60, "1 minute"],
  [120, "2 minutes"],
  [300, "5 minutes"],
] as const;

type PublishProgress = {
  active: boolean;
  done: boolean;
  completed: number;
  total: number;
  succeeded: number;
  failed: number;
  currentTitle: string;
  waitingSeconds: number;
};

const emptyProgress: PublishProgress = {
  active: false,
  done: false,
  completed: 0,
  total: 0,
  succeeded: 0,
  failed: 0,
  currentTitle: "",
  waitingSeconds: 0,
};

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
  const [publishIntervalSeconds, setPublishIntervalSeconds] = useState(0);
  const [publishProgress, setPublishProgress] =
    useState<PublishProgress>(emptyProgress);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    Promise.all([sitesApi.list(), usersApi.me()])
      .then(([sitesRes, userRes]) => {
        setSites(sitesRes.data);
        if (sitesRes.data[0]) setSiteId(sitesRes.data[0].id);
        setPublishIntervalSeconds(
          Math.max(
            0,
            Number(userRes.data.preferences?.publishIntervalSeconds) || 0,
          ),
        );
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
      if (res.data.articles?.length) {
        setArticles(res.data.articles);
      } else {
        const list = await articlesApi.list({ siteId });
        setArticles(list.data.slice(0, res.data.imported));
      }
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
        const total = articles.length;
        let ok = 0;
        let fail = 0;
        setPublishProgress({
          ...emptyProgress,
          active: true,
          total,
        });

        for (let index = 0; index < articles.length; index += 1) {
          const article = articles[index];
          setPublishProgress((current) => ({
            ...current,
            currentTitle: article.title,
            waitingSeconds: 0,
          }));
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

          setPublishProgress((current) => ({
            ...current,
            completed: index + 1,
            succeeded: ok,
            failed: fail,
          }));

          const hasNext = index < articles.length - 1;
          if (hasNext && publishIntervalSeconds > 0) {
            for (
              let remaining = publishIntervalSeconds;
              remaining > 0;
              remaining -= 1
            ) {
              setPublishProgress((current) => ({
                ...current,
                waitingSeconds: remaining,
              }));
              await new Promise((resolve) => window.setTimeout(resolve, 1000));
            }
          }
        }
        setPublishProgress((current) => ({
          ...current,
          active: false,
          done: true,
          currentTitle: "",
          waitingSeconds: 0,
        }));
        setMessage(
          `WordPress push done: ${ok} succeeded${fail ? `, ${fail} failed` : ""}.`,
        );
        return;
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
            {publishMode !== "keep" ? (
              <Select
                label="Time between each WordPress post"
                value={String(publishIntervalSeconds)}
                disabled={publishProgress.active}
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
            ) : null}
            <p className="text-muted">
              Sheet column <strong>Post Status</strong> can be{" "}
              <code>draft</code>, <code>publish</code>, or <code>scheduled</code>
              . You can also open each article later and click Publish.
            </p>
            {publishProgress.active || publishProgress.done ? (
              <div className="space-y-3 rounded-xl border border-border bg-surface-muted p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {publishProgress.done
                        ? "Publishing complete"
                        : "Publishing to WordPress"}
                    </p>
                    <p className="text-xs text-muted">
                      {publishProgress.completed} of {publishProgress.total} posts
                      processed
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-brand">
                    {publishProgress.total
                      ? Math.round(
                          (publishProgress.completed /
                            publishProgress.total) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-500"
                    style={{
                      width: `${
                        publishProgress.total
                          ? (publishProgress.completed /
                              publishProgress.total) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                {!publishProgress.done ? (
                  <div className="rounded-lg bg-white px-3 py-2">
                    <p className="truncate text-sm font-medium">
                      {publishProgress.currentTitle || "Preparing first post…"}
                    </p>
                    <p className="text-xs text-muted">
                      {publishProgress.waitingSeconds > 0
                        ? `Next post in ${publishProgress.waitingSeconds} seconds`
                        : "Uploading content, media, and SEO fields…"}
                    </p>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="text-success">
                    {publishProgress.succeeded} succeeded
                  </span>
                  <span
                    className={
                      publishProgress.failed ? "text-danger" : "text-muted"
                    }
                  >
                    {publishProgress.failed} failed
                  </span>
                </div>
              </div>
            ) : null}
            {message ? <p className="text-brand">{message}</p> : null}
            {publishProgress.done ? (
              <Button href="/articles" type="button" variant="secondary">
                View all articles
              </Button>
            ) : null}
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
            !publishProgress.done && (
              <Button type="button" disabled={loading} onClick={onContinue}>
                {loading
                  ? "Publishing…"
                  : publishMode === "keep"
                    ? "Finish"
                    : "Start publishing"}
              </Button>
            )
          )}
        </div>
      </Card>
    </div>
  );
}
