import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/primitives";
import { blogPosts } from "@/lib/mock-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  return { title: post?.title ?? "Blog" };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <PageHero title={post.title} description={post.excerpt} />
      <article className="mx-auto max-w-3xl space-y-4 px-4 py-16 text-base leading-relaxed text-muted sm:px-6">
        <p className="text-sm font-semibold text-brand">{post.date}</p>
        <p>
          This guide walks through a practical SheetPress workflow for mapping
          spreadsheet columns, validating content, and publishing to WordPress
          with fewer manual steps.
        </p>
        <p>
          Start by connecting your site with an application password, upload a
          sample sheet, preview each article, then choose whether to publish
          immediately or schedule across your content calendar.
        </p>
      </article>
    </>
  );
}
