import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/primitives";
import { blogPosts } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Blog",
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        title="Blog"
        description="Practical guides on bulk WordPress publishing, SEO mapping, and spreadsheet workflows."
      />
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-16 sm:px-6 md:grid-cols-3">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-sm)]"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              {post.date}
            </p>
            <h2 className="mt-3 text-lg font-semibold text-foreground">
              <Link href={`/blog/${post.slug}`} className="hover:text-brand">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {post.excerpt}
            </p>
          </article>
        ))}
      </section>
    </>
  );
}
