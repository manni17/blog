import { marked } from "marked";
import customPostData from "@/content/custom-posts.json";

export interface BlogFrontmatter {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
  cover?: string;
}

export type BlogCustomLayout = "plg2-essay" | "complete-story" | "operating-note";

export interface BlogPost extends BlogFrontmatter {
  html: string;
  readingTimeMinutes: number;
  customLayout?: BlogCustomLayout;
}

const CUSTOM_BLOG_POSTS: BlogPost[] = customPostData.map((post) => ({
  title: post.title,
  slug: post.slug,
  date: post.date,
  excerpt: post.excerpt,
  tags: post.tags,
  html: "",
  readingTimeMinutes: post.readingTimeMinutes,
  customLayout: post.customLayout as BlogCustomLayout,
}));

const markdownFiles = import.meta.glob("../content/posts/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function parseFrontmatter(raw: string): {
  frontmatter: BlogFrontmatter;
  body: string;
  readingTime?: string;
} {
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

  return { frontmatter, body, readingTime: fields.readingTime };
}

function estimateReadingTime(markdown: string): number {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function parsePost(raw: string): BlogPost {
  const { frontmatter, body, readingTime: readingTimeRaw } = parseFrontmatter(raw);

  const readingTime = Number(readingTimeRaw);

  return {
    ...frontmatter,
    html: marked.parse(body) as string,
    readingTimeMinutes: Number.isFinite(readingTime) && readingTime > 0 ? readingTime : estimateReadingTime(body),
  };
}

export function formatPostDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
