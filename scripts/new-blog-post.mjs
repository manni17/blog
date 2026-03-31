#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const title = process.argv.slice(2).join(" ").trim();

if (!title) {
  console.error('Usage: npm run blog:new -- "My New Post Title"');
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, "")
  .trim()
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-");

const fileName = `${date}-${slug}.md`;
const postsDir = path.resolve(process.cwd(), "src/content/posts");
const filePath = path.join(postsDir, fileName);

if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

if (fs.existsSync(filePath)) {
  console.error(`Post already exists: ${filePath}`);
  process.exit(1);
}

const template = `---
title: "${title}"
slug: "${slug}"
date: "${date}"
excerpt: "Add one sentence summary."
tags: ["blog"]
cover: "/images/blog/${slug}.jpg"
---

Write your post in Markdown.
`;

fs.writeFileSync(filePath, template, "utf8");
console.log(`Created ${filePath}`);
