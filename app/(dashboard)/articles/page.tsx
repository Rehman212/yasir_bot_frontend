"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card, StatusBadge } from "@/components/ui/primitives";
import {
  articlesApi,
  sitesApi,
  type ArticleRow,
  type WpSite,
  getAccessToken,
} from "@/lib/api";

function prettyStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [sites, setSites] = useState<WpSite[]>([]);
  const [siteId, setSiteId] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await articlesApi.list({
        siteId: siteId || undefined,
        status: status || undefined,
        search: search || undefined,
      });
      setArticles(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load articles");
    }
  }

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    sitesApi.list().then((r) => setSites(r.data)).catch(() => undefined);
    load();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
            All Articles
          </h1>
          <p className="mt-1 text-sm text-muted">
            Filter, preview, publish, reschedule, retry, or delete imported posts.
          </p>
        </div>
        <Button href="/import">Import new batch</Button>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Card className="grid gap-3 p-4 md:grid-cols-5">
        <Select
          label="Website"
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
        >
          <option value="">All websites</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {["PUBLISHED", "SCHEDULED", "FAILED", "DRAFT", "QUEUED"].map((s) => (
            <option key={s} value={s}>
              {prettyStatus(s)}
            </option>
          ))}
        </Select>
        <Input label="Category" placeholder="Optional" disabled />
        <Input label="Date" type="date" disabled />
        <Input
          label="Search by title"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      <div className="flex justify-end">
        <Button type="button" variant="secondary" onClick={load}>
          Apply filters
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted text-muted">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" />
                </th>
                {[
                  "Article title",
                  "Website",
                  "Category",
                  "Publish date",
                  "Status",
                  "WordPress URL",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted" colSpan={8}>
                    No articles yet. Import a spreadsheet to get started.
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <input type="checkbox" />
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/articles/${article.id}`}
                        className="hover:text-brand"
                      >
                        {article.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {article.site?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {article.category || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {article.publishAt
                        ? new Date(article.publishAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={prettyStatus(article.status)} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {article.wpUrl ? (
                        <a
                          href={article.wpUrl}
                          className="text-brand hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          type="button"
                          href={`/articles/${article.id}`}
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
