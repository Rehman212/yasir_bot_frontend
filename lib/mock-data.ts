export const integrations = [
  "WordPress",
  "WooCommerce",
  "Google Sheets",
  "Excel",
  "CSV",
  "Yoast SEO",
  "Rank Math",
];

export const howItWorksSteps = [
  {
    title: "Connect WordPress",
    description:
      "Securely link your site with an application password—no plugin required.",
  },
  {
    title: "Upload your spreadsheet",
    description:
      "Import Excel, CSV, or Google Sheets with titles, content, images, and SEO fields.",
  },
  {
    title: "Review your articles",
    description:
      "Validate data, map columns, edit drafts, and catch duplicates before publishing.",
  },
  {
    title: "Publish or schedule",
    description:
      "Publish immediately, save drafts, or schedule weeks of content in one click.",
  },
];

export const features = [
  {
    title: "Bulk article publishing",
    description: "Push dozens or hundreds of posts to WordPress in a single run.",
  },
  {
    title: "Excel and CSV importing",
    description: "Upload spreadsheets with flexible column mapping for any workflow.",
  },
  {
    title: "Google Sheets integration",
    description: "Connect live sheets and keep your content pipeline in sync.",
  },
  {
    title: "Automatic featured images",
    description: "Upload image URLs or files and attach them as featured media.",
  },
  {
    title: "Categories and tags",
    description: "Map taxonomy from your sheet or apply reusable defaults.",
  },
  {
    title: "Post scheduling",
    description: "Use sheet dates or interval publishing across timezones.",
  },
  {
    title: "SEO metadata",
    description: "Send titles and meta descriptions to Yoast and Rank Math fields.",
  },
  {
    title: "Duplicate prevention",
    description: "Detect matching titles and slugs before anything goes live.",
  },
  {
    title: "Failed-post retries",
    description: "Retry failed jobs with clear error details and safe resume.",
  },
  {
    title: "Multiple WordPress sites",
    description: "Manage agencies and client sites from one dashboard.",
  },
  {
    title: "Publishing history",
    description: "Track every import batch, status change, and WordPress URL.",
  },
  {
    title: "Real-time progress",
    description: "Watch the queue move from waiting to published as posts go live.",
  },
];

export const benefits = [
  {
    title: "Save hours of manual work",
    description: "Replace copy-paste publishing with a guided import flow.",
  },
  {
    title: "Schedule weeks of content",
    description: "Fill your calendar once and let SheetPress publish on time.",
  },
  {
    title: "Manage multiple websites",
    description: "Switch between sites without juggling logins or plugins.",
  },
  {
    title: "Reduce publishing mistakes",
    description: "Validation catches missing fields, bad dates, and broken images.",
  },
  {
    title: "Track every article",
    description: "Know what published, what failed, and what still needs attention.",
  },
];

export const pricingPlans = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "Try the workflow on a single site.",
    articles: "10 articles / month",
    websites: "1 website",
    storage: "100 MB media",
    team: "1 member",
    seo: "Basic SEO fields",
    support: "Community support",
    featured: false,
  },
  {
    name: "Starter",
    price: { monthly: 19, annual: 15 },
    description: "For solo creators publishing regularly.",
    articles: "100 articles / month",
    websites: "2 websites",
    storage: "2 GB media",
    team: "1 member",
    seo: "Yoast & Rank Math",
    support: "Email support",
    featured: false,
  },
  {
    name: "Professional",
    price: { monthly: 49, annual: 39 },
    description: "For serious content teams and freelancers.",
    articles: "1,000 articles / month",
    websites: "10 websites",
    storage: "20 GB media",
    team: "5 members",
    seo: "Full SEO mapping",
    support: "Priority support",
    featured: true,
  },
  {
    name: "Agency",
    price: { monthly: 129, annual: 99 },
    description: "For agencies managing many client sites.",
    articles: "Unlimited articles",
    websites: "Unlimited websites",
    storage: "100 GB media",
    team: "Unlimited members",
    seo: "Advanced SEO + templates",
    support: "Dedicated success",
    featured: false,
  },
];

export const testimonials = [
  {
    quote:
      "We scheduled a month of SEO content in one afternoon. The queue and retries alone were worth it.",
    name: "Amina R.",
    role: "Content Lead, GrowthLab",
  },
  {
    quote:
      "Client sites used to take hours. Now we map a sheet once and publish across multiple WordPress installs.",
    name: "Daniel K.",
    role: "Agency Owner, Northline Digital",
  },
  {
    quote:
      "Featured images and Rank Math fields finally come through cleanly. No more post-publish cleanup.",
    name: "Sara M.",
    role: "Freelance SEO Writer",
  },
];

export const faqs = [
  {
    question: "Do I need to install a WordPress plugin?",
    answer:
      "No. SheetPress connects with your WordPress URL, username, and an application password.",
  },
  {
    question: "Does it support featured images?",
    answer:
      "Yes. Provide image URLs or upload media, and SheetPress attaches featured images automatically.",
  },
  {
    question: "Can I schedule posts?",
    answer:
      "Yes. Use publish dates from your sheet, or set interval publishing with a timezone.",
  },
  {
    question: "Does it support Yoast and Rank Math?",
    answer:
      "Yes. Map SEO title and meta description columns to popular SEO plugin fields.",
  },
  {
    question: "Can I connect multiple websites?",
    answer:
      "Yes. Higher plans unlock multiple WordPress sites from one account.",
  },
  {
    question: "What happens when an article fails?",
    answer:
      "Failed jobs stay in the queue with error details. You can retry or fix and republish.",
  },
  {
    question: "Is my WordPress password secure?",
    answer:
      "We recommend application passwords. Credentials are encrypted and never stored in plain text.",
  },
];

export const sampleSheetRows = [
  {
    title: "SEO Guide",
    content: "Article content…",
    image: "image.jpg",
    category: "SEO",
    publishDate: "20-Aug-2026",
  },
  {
    title: "Content Calendar Tips",
    content: "Article content…",
    image: "calendar.png",
    category: "Marketing",
    publishDate: "22-Aug-2026",
  },
  {
    title: "WordPress Performance",
    content: "Article content…",
    image: "speed.webp",
    category: "Development",
    publishDate: "25-Aug-2026",
  },
];

export const dashboardStats = [
  { label: "Connected websites", value: "4" },
  { label: "Imported articles", value: "286" },
  { label: "Published", value: "214" },
  { label: "Scheduled", value: "38" },
  { label: "Failed", value: "7" },
  { label: "Monthly usage", value: "86 / 1,000" },
];

export const sites = [
  {
    id: "1",
    name: "Growth Lab Blog",
    domain: "blog.growthlab.com",
    status: "Connected" as const,
    published: 128,
    lastConnected: "2 hours ago",
  },
  {
    id: "2",
    name: "Northline Agency",
    domain: "northline.digital",
    status: "Connected" as const,
    published: 64,
    lastConnected: "Yesterday",
  },
  {
    id: "3",
    name: "Client — Bluepeak",
    domain: "bluepeak.io",
    status: "Needs reconnect" as const,
    published: 22,
    lastConnected: "12 days ago",
  },
];

export const articles = [
  {
    id: "a1",
    title: "Complete SEO Guide for 2026",
    website: "Growth Lab Blog",
    category: "SEO",
    publishDate: "20 Aug 2026",
    status: "Published" as const,
    url: "https://blog.growthlab.com/seo-guide",
  },
  {
    id: "a2",
    title: "How to Build a Content Calendar",
    website: "Growth Lab Blog",
    category: "Marketing",
    publishDate: "22 Aug 2026",
    status: "Scheduled" as const,
    url: "",
  },
  {
    id: "a3",
    title: "WordPress Image Optimization",
    website: "Northline Agency",
    category: "Performance",
    publishDate: "18 Aug 2026",
    status: "Failed" as const,
    url: "",
  },
  {
    id: "a4",
    title: "Agency Reporting Templates",
    website: "Northline Agency",
    category: "Business",
    publishDate: "—",
    status: "Draft" as const,
    url: "",
  },
  {
    id: "a5",
    title: "Rank Math Setup Checklist",
    website: "Client — Bluepeak",
    category: "SEO",
    publishDate: "25 Aug 2026",
    status: "Queued" as const,
    url: "",
  },
];

export const queueItems = [
  { id: "q1", title: "Rank Math Setup Checklist", status: "Waiting", site: "Bluepeak" },
  { id: "q2", title: "How to Build a Content Calendar", status: "Scheduled", site: "Growth Lab" },
  { id: "q3", title: "Internal Linking Framework", status: "Processing", site: "Growth Lab" },
  { id: "q4", title: "Complete SEO Guide for 2026", status: "Completed", site: "Growth Lab" },
  { id: "q5", title: "WordPress Image Optimization", status: "Failed", site: "Northline" },
  { id: "q6", title: "Old campaign draft", status: "Cancelled", site: "Northline" },
];

export const activityLogs = [
  { id: "l1", event: "Article imported", detail: "24 rows from august-batch.xlsx", time: "10 min ago" },
  { id: "l2", event: "Publishing started", detail: "Batch #184 on Growth Lab Blog", time: "25 min ago" },
  { id: "l3", event: "Post created", detail: "Complete SEO Guide for 2026", time: "32 min ago" },
  { id: "l4", event: "Image uploaded", detail: "featured-seo-guide.jpg", time: "33 min ago" },
  { id: "l5", event: "Post failed", detail: "WordPress Image Optimization — media timeout", time: "1 hour ago" },
  { id: "l6", event: "Connection changed", detail: "Northline Agency reconnected", time: "Yesterday" },
  { id: "l7", event: "Article retried", detail: "Agency Reporting Templates", time: "Yesterday" },
  { id: "l8", event: "Article edited", detail: "How to Build a Content Calendar", time: "2 days ago" },
];

export const mediaItems = [
  { id: "m1", name: "featured-seo-guide.jpg", status: "Uploaded", wpId: "8842", size: "420 KB" },
  { id: "m2", name: "calendar-cover.png", status: "Uploaded", wpId: "8843", size: "610 KB" },
  { id: "m3", name: "speed-audit.webp", status: "Failed", wpId: "—", size: "1.2 MB" },
  { id: "m4", name: "https://cdn.example.com/hero.jpg", status: "Linked", wpId: "8848", size: "URL" },
];

export const templates = [
  {
    id: "t1",
    name: "SEO Default",
    category: "SEO",
    tags: "seo, ranking",
    status: "Draft",
    frequency: "Every 2 hours",
  },
  {
    id: "t2",
    name: "Agency Client Posts",
    category: "Client Work",
    tags: "agency, updates",
    status: "Publish",
    frequency: "Daily 09:00",
  },
];

export const blogPosts = [
  {
    slug: "bulk-publish-wordpress-from-excel",
    title: "How to bulk publish WordPress posts from Excel",
    excerpt: "A practical workflow for mapping columns, validating data, and scheduling at scale.",
    date: "Aug 10, 2026",
  },
  {
    slug: "application-passwords-explained",
    title: "WordPress application passwords explained",
    excerpt: "Why application passwords are safer than sharing your main admin login.",
    date: "Aug 4, 2026",
  },
  {
    slug: "seo-fields-yoast-rankmath",
    title: "Mapping SEO fields for Yoast and Rank Math",
    excerpt: "Keep meta titles and descriptions consistent when importing from sheets.",
    date: "Jul 28, 2026",
  },
];
