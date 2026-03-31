import { marked } from "marked";

export interface BlogFrontmatter {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
  cover?: string;
}

export type BlogCustomLayout = "plg2-essay";

export interface BlogPost extends BlogFrontmatter {
  html: string;
  readingTimeMinutes: number;
  customLayout?: BlogCustomLayout;
}

const CUSTOM_BLOG_POSTS: BlogPost[] = [
  {
    title: "We Stopped Teaching. We Started Doing. — Steller PLG 2.0",
    slug: "plg-2-we-stopped-teaching-we-started-doing",
    date: "2026-03-31",
    excerpt:
      "PLG used to mean reducing friction. The real unlock is removing the work entirely — how we applied that to Steller onboarding.",
    tags: ["PLG", "onboarding", "essay", "product"],
    html: "",
    readingTimeMinutes: 14,
    customLayout: "plg2-essay",
  },
];

const markdownFiles = import.meta.glob("../content/posts/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function parseFrontmatter(raw: string): { frontmatter: BlogFrontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("Invalid post format: missing frontmatter block.");
  }

  const frontmatterRaw = match[1];
  const body = match[2].trim();

  const fields: Record<string, string> = {};
  for (const line of frontmatterRaw.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line
      .slice(idx + 1)
      .trim()
      .replace(/^"(.*)"$/, "$1")
      .replace(/^'(.*)'$/, "$1");
    fields[key] = value;
  }

  const tags = fields.tags
    ? fields.tags
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .split(",")
        .map((tag) => tag.trim().replace(/^"(.*)"$/, "$1"))
        .filter(Boolean)
    : [];

  const frontmatter: BlogFrontmatter = {
    title: fields.title || "Untitled",
    slug: fields.slug || "",
    date: fields.date || "",
    excerpt: fields.excerpt || "",
    tags,
    cover: fields.cover || undefined,
  };

  if (!frontmatter.slug) {
    throw new Error(`Invalid post format: missing slug in "${frontmatter.title}".`);
  }

  return { frontmatter, body };
}

function estimateReadingTime(markdown: string): number {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function parsePost(raw: string): BlogPost {
  const { frontmatter, body } = parseFrontmatter(raw);

  return {
    ...frontmatter,
    html: marked.parse(body) as string,
    readingTimeMinutes: estimateReadingTime(body),
  };
}

export function getAllBlogPosts(): BlogPost[] {
  const fromMarkdown = Object.entries(markdownFiles)
    .filter(([path]) => !path.includes("_template"))
    .map(([, raw]) => parsePost(raw));

  return [...fromMarkdown, ...CUSTOM_BLOG_POSTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getAllBlogPosts().find((post) => post.slug === slug);
}
