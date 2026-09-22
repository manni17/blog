import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { parseEssayHtml } from "../src/lib/parseEssay.mjs";

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

function formatPostDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

function essayDocument(page) {
  const source = fs.readFileSync(path.join(root, page.essay), "utf8");
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
        <p class="post-excerpt" style="max-width:36rem;margin-bottom:2rem">Architecture, product-led onboarding, and the complete Steller story.</p>
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
    let html = applySeo(template, page);
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
  const meta = knownMeta(urlPath) || {
    path: urlPath,
    title: post.title,
    description: post.excerpt,
    type: "article",
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
assertFile("404.html", ["Page not found", 'content="noindex, nofollow"']);
if (!fs.existsSync(path.join(dist, "favicon.svg"))) {
  throw new Error("favicon.svg was not copied to dist.");
}
if (!fs.existsSync(path.join(dist, "sitemap.xml")) || !fs.existsSync(path.join(dist, "robots.txt"))) {
  throw new Error("robots.txt or sitemap.xml missing from dist.");
}

console.log(`Prerendered ${renderedPaths.size} routes plus 404.html`);
