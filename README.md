# blog

Reflections and essays from building [Steller](https://developers.steler.org).

**Repository:** [github.com/manni17/blog](https://github.com/manni17/blog)  
**Live (when deployed):** [muhanad.steler.org](https://muhanad.steler.org) — separate from the developer docs site.

## Local dev

```bash
npm install
npm run dev
```

- Listing: `/blog`
- Post: `/blog/<slug>`

## New post

```bash
npm run blog:new -- "Your title"
```

Edit the file under `src/content/posts/`. Full-document essays (standalone HTML) can be added like `src/pages/plg2-essay.html` and registered as a custom layout. Scroll progress, chapter labels, and reveal-on-scroll run in the page shell. Inline `<script>` tags in an essay file are not executed.

`npm run build` prerenders `/`, `/blog`, and each essay to static HTML so the text is in the document, not an iframe. Per-route titles, descriptions, Open Graph, Twitter cards, and canonical URLs are in that HTML. `robots.txt` and `sitemap.xml` are copied to the build.

If nginx uses `try_files $uri $uri/ /index.html`, those prerendered files are what crawlers receive on a direct load. Unknown URLs still fall through to `index.html` with HTTP 200, and the app then shows a client 404. Missing assets can do the same. A real 404 for unknown paths needs a server change this repo does not deploy, for example `try_files $uri $uri/ =404;` once every public route has a file, or `error_page 404 /404.html;` using the generated `404.html`. Social previews do not run JavaScript, so they only see the file the server actually returns.

## Deploy

This app is **not** part of the Steller monorepo commit tree. On the VPS, clone or pull this repo next to Steller (e.g. `/opt/steller-v2/blog`), then from the Steller repo root:

```bash
docker compose build --no-cache steller-blog
docker compose up -d steller-blog
```

See `docs/MUHANAD_BLOG_PUBLISHING_RUNBOOK.md` in [steller-v2](https://github.com/manni17/steller-v2) for nginx and CI notes.
