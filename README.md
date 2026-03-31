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

Edit the file under `src/content/posts/`. Full-document essays (standalone HTML + inline JS) can be added like `src/pages/plg2-essay.html` and registered in `src/lib/blog.ts` as `customLayout: "plg2-essay"`.

## Deploy

This app is **not** part of the Steller monorepo commit tree. On the VPS, clone or pull this repo next to Steller (e.g. `/opt/steller-v2/blog`), then from the Steller repo root:

```bash
docker compose build --no-cache steller-blog
docker compose up -d steller-blog
```

See `docs/MUHANAD_BLOG_PUBLISHING_RUNBOOK.md` in [steller-v2](https://github.com/manni17/steller-v2) for nginx and CI notes.
