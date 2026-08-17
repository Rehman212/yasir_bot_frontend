/** Generates and downloads a sample CSV template for SheetPress imports. */
export function downloadSampleSheet(filename = "sheetpress-sample-articles.csv") {
  const headers = [
    "Title",
    "Content",
    "Excerpt",
    "Slug",
    "Featured Image",
    "Category",
    "Tags",
    "SEO Title",
    "Meta Description",
    "Focus Keyword",
    "Publish Date",
    "Post Status",
  ];

  const rows = [
    [
      "Complete SEO Guide for 2026",
      "Write your full article HTML or plain text here. Cover on-page SEO basics, keyword research, and internal linking.",
      "A practical SEO checklist for content teams.",
      "complete-seo-guide-2026",
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200",
      "SEO",
      "seo, ranking, content",
      "Complete SEO Guide for 2026 | SheetPress",
      "Learn how to research keywords, structure posts, and publish SEO-ready content at scale.",
      "seo guide",
      "2026-08-20",
      "draft",
    ],
    [
      "How to Build a Content Calendar",
      "Plan weekly themes, assign owners, and schedule publish dates so your pipeline stays full.",
      "Content calendar tips for agencies and solo creators.",
      "build-content-calendar",
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200",
      "Marketing",
      "calendar, planning, marketing",
      "How to Build a Content Calendar",
      "A simple framework for scheduling WordPress posts from spreadsheets.",
      "content calendar",
      "2026-08-22",
      "publish",
    ],
    [
      "WordPress Image Optimization",
      "Compress images, use modern formats, and attach featured media automatically when importing.",
      "Speed up WordPress with better media habits.",
      "wordpress-image-optimization",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200",
      "Performance",
      "wordpress, images, speed",
      "WordPress Image Optimization Tips",
      "Keep pages fast by optimizing featured images before you publish.",
      "image optimization",
      "2026-08-25",
      "draft",
    ],
  ];

  const escape = (value: string) => {
    if (/[",\n\r]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csv = [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
