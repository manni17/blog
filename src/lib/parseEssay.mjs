import { injectEssayEnd } from "./essaySeries.mjs";

function decodeEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function linkAttrs(raw) {
  const rel = /rel=["']([^"']+)["']/i.exec(raw)?.[1];
  const href = /href=["']([^"']+)["']/i.exec(raw)?.[1];
  if (!rel || !href) return null;
  if (rel !== "stylesheet" && rel !== "preconnect") return null;
  return { rel, href: decodeEntities(href) };
}

export function parseEssayHtml(html) {
  const prepared = injectEssayEnd(html);
  const css = [...prepared.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]).join("\n");
  const links = [...prepared.matchAll(/<link\b([^>]*)>/gi)]
    .map((match) => linkAttrs(match[1]))
    .filter(Boolean);

  const bodyMatch = prepared.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : prepared;
  const bodyHtml = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").trim();

  return { css, links, bodyHtml };
}
