import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { OPERATING_NOTES, seriesContaining } from "../src/lib/essaySeries.mjs";
import { parseEssayHtml } from "../src/lib/parseEssay.mjs";
import {
  articleTimestamp,
  formatPostDate,
  injectEssayPublishLine,
  injectHomePublishLines,
  publishLine,
} from "../src/lib/publishDates.mjs";

const root = process.cwd();
const dist = path.join(root, "dist");
const seo = JSON.parse(fs.readFileSync(path.join(root, "src/seo/pages.json"), "utf8"));
const customPosts = JSON.parse(fs.readFileSync(path.join(root, "src/content/custom-posts.json"), "utf8"));
const { origin, siteName, pages } = seo;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function canonicalUrl(urlPath) {
  if (urlPath === "/" || urlPath === "") return `${origin}/`;
  return `${origin}${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}`;
}

function seoBlock(meta, { noindex = false } = {}) {
  const url = canonicalUrl(meta.path);
  const lines = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
    `<meta property="og:type" content="${escapeHtml(meta.type || "website")}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:url" content="${escapeHtml(url)}" />`,
  ];
  if (meta.published && (meta.type || "website") === "article") {
    const timestamp = articleTimestamp(meta.published);
    lines.push(`<meta property="article:published_time" content="${escapeHtml(timestamp)}" />`);
    lines.push(`<meta property="article:modified_time" content="${escapeHtml(timestamp)}" />`);
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: meta.title,
      description: meta.description,
      datePublished: meta.published,
      dateModified: meta.published,
      mainEntityOfPage: url,
      author: { "@type": "Person", name: "Muhanad Abdelrahim" },
    };
    lines.push(`<script type="application/ld+json">${JSON.stringify(jsonLd).replaceAll("<", "\\u003c")}</script>`);
  }
  if (noindex) {
    lines.push(`<meta name="robots" content="noindex, nofollow" />`);
  } else {
    lines.push(`<link rel="canonical" href="${escapeHtml(url)}" />`);
  }
  return lines.join("\n    ");
}

function applySeo(template, meta, options) {
  const block = seoBlock(meta, options);
  if (!/<!--seo-->[\s\S]*?<!--\/seo-->/.test(template)) {
    throw new Error("index.html is missing the <!--seo--> block.");
  }
  return template.replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, `<!--seo-->\n    ${block}\n    <!--/seo-->`);
}

function applyRoot(template, inner) {
  const next = template.replace('<div id="root"></div>', `<div id="root">${inner}</div>`);
  if (next === template) throw new Error("Could not find #root in the built HTML.");
  return next;
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error("Invalid post format: missing frontmatter block.");
  const fields = {};
  for (const line of match[1].split("\n")) {
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
  const words = match[2].trim().split(/\s+/).filter(Boolean).length;
  return {
    title: fields.title || "Untitled",
    slug: fields.slug,
    date: fields.date || "",
    excerpt: fields.excerpt || "",
    tags,
    readingTimeMinutes: fields.readingTime ? Number(fields.readingTime) : Math.max(1, Math.ceil(words / 220)),
    html: marked.parse(match[2].trim()),
  };
}

function loadMarkdownPosts() {
  const dir = path.join(root, "src/content/posts");
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md") && !name.includes("_template"))
    .map((name) => parseFrontmatter(fs.readFileSync(path.join(dir, name), "utf8")));
}

function allPosts() {
  const custom = customPosts.map((post) => ({ ...post, html: "" }));
  return [...loadMarkdownPosts(), ...custom].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

function essayBySlug(slug) {
  return pages.find((page) => page.essay && page.path === `/blog/${slug}`);
}

function knownMeta(urlPath) {
  return pages.find((page) => page.path === urlPath);
}

function writeFile(urlPath, html) {
  const relative = urlPath === "/" ? "index.html" : path.join(urlPath.replace(/^\//, ""), "index.html");
  const file = path.join(dist, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  return file;
}

function essayHead(parsed) {
  const links = parsed.links
    .map(
      (link) =>
        `<link data-prerender="font" rel="${escapeHtml(link.rel)}" href="${escapeHtml(link.href)}" />`,
    )
    .join("\n    ");
  return `${links}\n    <style data-prerender="css">${parsed.css}</style>`;
}

function postForPath(urlPath) {
  const slug = urlPath.startsWith("/blog/") ? urlPath.slice("/blog/".length) : "";
  return slug ? posts.find((post) => post.slug === slug) : undefined;
}

function withPublishMeta(page) {
  const post = postForPath(page.path);
  return post?.date ? { ...page, published: post.date } : page;
}

function essaySource(page) {
  let source = fs.readFileSync(path.join(root, page.essay), "utf8");
  if (page.path === "/") {
    const lines = {};
    for (const post of posts) {
      if (post.customLayout !== "operating-note") continue;
      lines[`/blog/${post.slug}`] = publishLine(post.date, post.readingTimeMinutes);
    }
    source = injectHomePublishLines(source, lines);
  } else {
    const post = postForPath(page.path);
    if (post?.customLayout === "operating-note") {
      source = injectEssayPublishLine(source, publishLine(post.date, post.readingTimeMinutes));
    }
  }
  return source;
}

function essayDocument(page) {
  const source = essaySource(page);
  const parsed = parseEssayHtml(source);
  const back = page.backHref
    ? `<a class="essay-back" href="${escapeHtml(page.backHref)}">${escapeHtml(page.backLabel || "← Back")}</a>`
    : "";
  const inner = `<div class="essay-page">${back}<noscript><style>.r{opacity:1!important;transform:none!important}</style></noscript><main>${parsed.bodyHtml}</main></div>`;
  return { inner, head: essayHead(parsed) };
}

function blogIndex(posts) {
  const articles = posts
    .map((post) => {
      const tags = post.tags
        .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join("");
      return `<article>
            <div>${tags}</div>
            <h2 style="font-size:1.25rem;font-weight:600;margin:0.75rem 0 0"><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a></h2>
            <p class="post-meta">${escapeHtml(formatPostDate(post.date))} · ${post.readingTimeMinutes} min read</p>
            <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
            <a href="/blog/${escapeHtml(post.slug)}">Read post →</a>
          </article>`;
    })
    .join("\n");

  return `<div class="layout">
      <header class="site-header">
        <a class="site-brand" href="/blog">Steller Blog</a>
        <nav class="site-nav">
          <a href="/">Home</a>
          <a href="/blog">All posts</a>
          <a href="https://developers.steler.org">Developers</a>
        </nav>
      </header>
      <main class="site-main">
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted)">Steller</p>
        <h1 style="font-size:clamp(1.75rem, 4vw, 2.5rem);font-weight:700;margin:0.25rem 0 0.5rem">Essays &amp; field notes</h1>
        <p class="post-excerpt" style="max-width:36rem;margin-bottom:2rem">The Steller Story, and operating notes on agents, jobs, onboarding, and cost.</p>
        <div class="post-list">
          ${articles}
        </div>
      </main>
      <footer class="site-footer">
        <a href="https://github.com/manni17/blog">Source on GitHub</a>
        ·
        <a href="https://developers.steler.org">developers.steler.org</a>
      </footer>
    </div>`;
}

function markdownArticle(post) {
  return `<div class="layout">
      <header class="site-header">
        <a class="site-brand" href="/blog">Steller Blog</a>
        <nav class="site-nav">
          <a href="/">Home</a>
          <a href="/blog">All posts</a>
          <a href="https://developers.steler.org">Developers</a>
        </nav>
      </header>
      <main class="site-main">
        <a href="/blog" style="font-size:0.875rem;color:var(--muted)">← Back to blog</a>
        <h1 style="font-size:clamp(1.75rem, 4vw, 2.5rem);font-weight:700;margin:1rem 0 0.5rem">${escapeHtml(post.title)}</h1>
        <p class="post-meta">${escapeHtml(formatPostDate(post.date))} · ${post.readingTimeMinutes} min read</p>
        <div class="post-body">${post.html}</div>
      </main>
      <footer class="site-footer">
        <a href="https://github.com/manni17/blog">Source on GitHub</a>
        ·
        <a href="https://developers.steler.org">developers.steler.org</a>
      </footer>
    </div>`;
}

function notFoundDocument() {
  return `<div class="layout">
      <header class="site-header">
        <a class="site-brand" href="/blog">Steller Blog</a>
        <nav class="site-nav">
          <a href="/">Home</a>
          <a href="/blog">All posts</a>
          <a href="https://developers.steler.org">Developers</a>
        </nav>
      </header>
      <main class="site-main">
        <div class="not-found">
          <h1>Page not found</h1>
          <p>That address is not a page on this site.</p>
          <p><a href="/">Home</a> · <a href="/blog">Blog</a></p>
        </div>
      </main>
    </div>`;
}

function sitemap(entries) {
  const body = entries
    .map((entry) => `  <url><loc>${escapeHtml(canonicalUrl(entry.path))}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const posts = allPosts();
const renderedPaths = new Set();

for (const page of pages) {
  if (page.essay) {
    const essay = essayDocument(page);
    let html = applySeo(template, withPublishMeta(page));
    html = html.replace("</head>", `    ${essay.head}\n  </head>`);
    writeFile(page.path, applyRoot(html, essay.inner));
  } else if (page.path === "/blog") {
    writeFile(page.path, applyRoot(applySeo(template, page), blogIndex(posts)));
  }
  renderedPaths.add(page.path);
}

for (const post of posts) {
  const urlPath = `/blog/${post.slug}`;
  if (renderedPaths.has(urlPath) || essayBySlug(post.slug)) continue;
  const meta = {
    ...(knownMeta(urlPath) || {
      path: urlPath,
      title: post.title,
      description: post.excerpt,
      type: "article",
    }),
    published: post.date,
  };
  writeFile(urlPath, applyRoot(applySeo(template, meta), markdownArticle(post)));
  renderedPaths.add(urlPath);
}

const notFoundMeta = {
  path: "/404",
  title: "Page not found — Muhanad Abdelrahim",
  description: "That address is not a page on this site.",
  type: "website",
};
fs.writeFileSync(
  path.join(dist, "404.html"),
  applyRoot(applySeo(template, notFoundMeta, { noindex: true }), notFoundDocument()),
);

const sitemapEntries = [
  ...pages.map((page) => ({ path: page.path })),
  ...posts
    .filter((post) => !pages.some((page) => page.path === `/blog/${post.slug}`))
    .map((post) => ({ path: `/blog/${post.slug}` })),
];
const sitemapXml = sitemap(sitemapEntries);
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemapXml);
fs.writeFileSync(
  path.join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
);

function assertFile(relative, checks) {
  const file = path.join(dist, relative);
  const html = fs.readFileSync(file, "utf8");
  if (html.includes("<iframe")) {
    throw new Error(`${relative} still contains an iframe.`);
  }
  for (const check of checks) {
    if (!html.includes(check)) {
      throw new Error(`${relative} is missing expected content: ${check}`);
    }
  }
  return html;
}

assertFile("index.html", [
  "Mississauga, Ontario",
  "Zain Sudan",
  "Emirates Driving Company",
  "Rittal Technology",
  "hello@steler.org",
  "linkedin.com/in/muhanad-mukashfi",
  "<main>",
  'rel="canonical" href="https://muhanad.steler.org/"',
  'property="og:title"',
  'name="twitter:card"',
  'href="/blog/what-belongs-in-agents-md"',
  'href="/blog/the-economics-of-agent-operated-software"',
  "Partnership / PLG",
  "Operating notes",
]);
if (fs.readFileSync(path.join(dist, "index.html"), "utf8").includes("Toronto")) {
  throw new Error("Home page still mentions Toronto.");
}
assertFile("blog/index.html", ["Essays &amp; field notes", 'rel="canonical" href="https://muhanad.steler.org/blog"']);
assertFile("blog/the-complete-story/index.html", [
  "Mississauga",
  "Zain Sudan",
  "Emirates Driving Company",
  "Rittal Technology",
  "hello@steler.org",
  "linkedin.com/in/muhanad-mukashfi",
  "<main>",
  'rel="canonical" href="https://muhanad.steler.org/blog/the-complete-story"',
]);
assertFile("blog/plg-2-we-stopped-teaching-we-started-doing/index.html", [
  "We Stopped Teaching",
  "<main>",
  'rel="canonical" href="https://muhanad.steler.org/blog/plg-2-we-stopped-teaching-we-started-doing"',
]);
assertFile("blog/microservices-to-fat-controllers-agentic-pivot/index.html", [
  "Built From",
  "<main>",
  'rel="canonical" href="https://muhanad.steler.org/blog/microservices-to-fat-controllers-agentic-pivot"',
]);

function assertEssayEnd(relative, essayId) {
  const html = fs.readFileSync(path.join(dist, relative), "utf8");
  const start = html.indexOf('class="essay-end"');
  const finish = html.indexOf("</aside>", start);
  if (start === -1 || finish === -1) {
    throw new Error(`${relative} is missing the end-of-essay block.`);
  }
  const block = html.slice(start, finish);
  const nextLabel = block.indexOf("Next in the series");
  const alsoLabel = block.indexOf("Also in this series");
  const workLabel = block.indexOf("Work with me");
  if (!(nextLabel !== -1 && nextLabel < alsoLabel && alsoLabel < workLabel)) {
    throw new Error(`${relative} end block is not ordered Next, Also, Contact.`);
  }
  const series = seriesContaining(essayId);
  if (!series) throw new Error(`No essay series contains ${essayId}.`);
  const index = series.findIndex((essay) => essay.id === essayId);
  const next = series[(index + 1) % series.length];
  const current = series[index];
  if (!block.includes(`href="${next.path}"`) || !block.includes(next.dek)) {
    throw new Error(`${relative} does not point next at ${next.path}.`);
  }
  if (block.includes(`href="${current.path}"`)) {
    throw new Error(`${relative} end block links to itself.`);
  }
  for (const other of series) {
    if (other.id === essayId) continue;
    if (!block.includes(`href="${other.path}"`)) {
      throw new Error(`${relative} is missing a series link to ${other.path}.`);
    }
  }
  if (!block.includes("mailto:hello@steler.org") || !block.includes("https://linkedin.com/in/muhanad-mukashfi")) {
    throw new Error(`${relative} end block is missing contact links.`);
  }
}

assertEssayEnd("blog/microservices-to-fat-controllers-agentic-pivot/index.html", "rubble");
assertEssayEnd("blog/the-complete-story/index.html", "completeStory");
assertEssayEnd("blog/plg-2-we-stopped-teaching-we-started-doing/index.html", "plg");

for (const note of OPERATING_NOTES) {
  const relative = `blog/${note.path.replace(/^\/blog\//, "")}/index.html`;
  assertFile(relative, [
    note.title,
    "<main>",
    `rel="canonical" href="https://muhanad.steler.org${note.path}"`,
    note.lane,
    "hello@steler.org",
    "linkedin.com/in/muhanad-mukashfi",
    "Next in the series",
  ]);
  if (fs.readFileSync(path.join(dist, relative), "utf8").includes("Toronto")) {
    throw new Error(`${relative} mentions Toronto.`);
  }
  assertEssayEnd(relative, note.id);
}

const sitemapText = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
for (const note of OPERATING_NOTES) {
  if (!sitemapText.includes(`https://muhanad.steler.org${note.path}`)) {
    throw new Error(`Sitemap is missing ${note.path}.`);
  }
}
const blogIndexHtml = fs.readFileSync(path.join(dist, "blog/index.html"), "utf8");
for (const note of OPERATING_NOTES) {
  if (!blogIndexHtml.includes(note.title) || !blogIndexHtml.includes(note.lane)) {
    throw new Error(`Blog index is missing ${note.title} or its lane.`);
  }
}

const dateOrder = [
  ["/blog/the-complete-story", "September 22, 2026"],
  ["/blog/the-economics-of-agent-operated-software", "September 7, 2026"],
  ["/blog/doing-the-customers-work-before-they-ask", "August 22, 2026"],
  ["/blog/idempotency-for-gift-card-apis", "August 6, 2026"],
  ["/blog/202-accepted-is-a-product-decision", "July 21, 2026"],
  ["/blog/the-failure-first-onboarding", "July 5, 2026"],
  ["/blog/why-explicit-jobs-beat-invisible-events-for-ai", "June 19, 2026"],
  ["/blog/when-fat-controllers-stop-working", "June 3, 2026"],
  ["/blog/what-zero-full-time-developers-actually-requires", "May 18, 2026"],
  ["/blog/the-agent-handover-protocol", "May 2, 2026"],
  ["/blog/what-belongs-in-agents-md", "April 16, 2026"],
  ["/blog/plg-2-we-stopped-teaching-we-started-doing", "March 31, 2026"],
  ["/blog/microservices-to-fat-controllers-agentic-pivot", "March 30, 2026"],
];
let lastIndex = -1;
for (const [href, label] of dateOrder) {
  const at = blogIndexHtml.indexOf(`href="${href}"`);
  if (at === -1 || at <= lastIndex) {
    throw new Error(`Blog index is not newest-first at ${href}.`);
  }
  if (!blogIndexHtml.includes(label)) {
    throw new Error(`Blog index is missing ${label}.`);
  }
  lastIndex = at;
}
if (blogIndexHtml.includes("September 24, 2026")) {
  throw new Error("Blog index still shows September 24, 2026.");
}

const homeHtml = fs.readFileSync(path.join(dist, "index.html"), "utf8");
if (!homeHtml.includes("April 16, 2026 · 9 min read") || !homeHtml.includes("September 7, 2026 · 7 min read")) {
  throw new Error("Home writing cards are missing operating-note dates.");
}
if (homeHtml.includes("September 24, 2026")) {
  throw new Error("Home page still shows September 24, 2026.");
}

const agentsHtml = fs.readFileSync(path.join(dist, "blog/what-belongs-in-agents-md/index.html"), "utf8");
if (!agentsHtml.includes("April 16, 2026 · 9 min read")) {
  throw new Error("AGENTS.md essay is missing its publish line.");
}
if (!agentsHtml.includes('property="article:published_time" content="2026-04-16T00:00:00Z"')) {
  throw new Error("AGENTS.md essay is missing article:published_time.");
}
if (!agentsHtml.includes('"datePublished":"2026-04-16"') || !agentsHtml.includes('"dateModified":"2026-04-16"')) {
  throw new Error("AGENTS.md essay is missing JSON-LD dates.");
}
const storyHtml = fs.readFileSync(path.join(dist, "blog/the-complete-story/index.html"), "utf8");
if (!storyHtml.includes('"datePublished":"2026-09-22"') || storyHtml.includes("September 24, 2026")) {
  throw new Error("Complete Story date changed.");
}
const rubbleHtml = fs.readFileSync(path.join(dist, "blog/microservices-to-fat-controllers-agentic-pivot/index.html"), "utf8");
if (!rubbleHtml.includes('"datePublished":"2026-03-30"') || !rubbleHtml.includes("March 2026")) {
  throw new Error("Rubble date changed.");
}
if (sitemapText.includes("<lastmod>")) {
  throw new Error("Sitemap lastmod was not previously used and should stay absent.");
}

assertFile("404.html", ["Page not found", 'content="noindex, nofollow"']);
if (!fs.existsSync(path.join(dist, "favicon.svg"))) {
  throw new Error("favicon.svg was not copied to dist.");
}
if (!fs.existsSync(path.join(dist, "sitemap.xml")) || !fs.existsSync(path.join(dist, "robots.txt"))) {
  throw new Error("robots.txt or sitemap.xml missing from dist.");
}

console.log(`Prerendered ${renderedPaths.size} routes plus 404.html`);
