const modules = import.meta.glob("./*.html", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const bySlug: Record<string, string> = {};
for (const [file, html] of Object.entries(modules)) {
  const slug = file.split("/").pop()?.replace(/\.html$/, "");
  if (slug) bySlug[slug] = html;
}

export function getOperatingEssayHtml(slug: string): string | undefined {
  return bySlug[slug];
}
