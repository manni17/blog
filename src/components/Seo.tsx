import { useEffect } from "react";
import { SITE_NAME, canonicalUrl, type PageType } from "@/lib/site";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  type?: PageType;
  noindex?: boolean;
  published?: string;
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    element.dataset.seo = "1";
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function removeMeta(attribute: "name" | "property", key: string) {
  document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove();
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    element.dataset.seo = "1";
    document.head.appendChild(element);
  }
  element.href = href;
}

function upsertJsonLd(payload: string | null) {
  const existing = document.head.querySelector<HTMLScriptElement>('script[data-seo="jsonld"]');
  if (!payload) {
    existing?.remove();
    return;
  }
  const script = existing ?? document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.seo = "jsonld";
  script.textContent = payload;
  if (!existing) document.head.appendChild(script);
}

const Seo = ({ title, description, path, type = "website", noindex = false, published }: SeoProps) => {
  useEffect(() => {
    document.title = title;
    const url = canonicalUrl(path);
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("name", "twitter:card", "summary");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:url", url);

    if (published && type === "article") {
      const timestamp = `${published}T00:00:00Z`;
      upsertMeta("property", "article:published_time", timestamp);
      upsertMeta("property", "article:modified_time", timestamp);
      upsertJsonLd(
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          datePublished: published,
          dateModified: published,
          mainEntityOfPage: url,
          author: { "@type": "Person", name: "Muhanad Abdelrahim" },
        }),
      );
    } else {
      removeMeta("property", "article:published_time");
      removeMeta("property", "article:modified_time");
      upsertJsonLd(null);
    }

    if (noindex) {
      upsertMeta("name", "robots", "noindex, nofollow");
      document.head.querySelector('link[rel="canonical"]')?.remove();
    } else {
      removeMeta("name", "robots");
      upsertCanonical(url);
    }
  }, [title, description, path, type, noindex, published]);

  return null;
};

export default Seo;
