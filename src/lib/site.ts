import raw from "@/seo/pages.json";

export type PageType = "website" | "article";

export interface PageMeta {
  id: string;
  path: string;
  title: string;
  description: string;
  type: PageType;
  essay?: string;
  backHref?: string;
  backLabel?: string;
}

export const SITE_ORIGIN = raw.origin;
export const SITE_NAME = raw.siteName;
export const pages = raw.pages as PageMeta[];

export function getPage(id: string): PageMeta {
  const page = pages.find((entry) => entry.id === id);
  if (!page) {
    throw new Error(`Missing page meta: ${id}`);
  }
  return page;
}

export function canonicalUrl(path: string): string {
  if (path === "/" || path === "") return `${SITE_ORIGIN}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
}
