export function formatPostDate(iso) {
  const [year, month, day] = String(iso).split("-").map(Number);
  if (!year || !month || !day) return String(iso);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function publishLine(date, readingTimeMinutes) {
  return `${formatPostDate(date)} · ${readingTimeMinutes} min read`;
}

export function articleTimestamp(iso) {
  return `${iso}T00:00:00Z`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function injectEssayPublishLine(html, line) {
  if (!line || html.includes('class="o-published"')) return html;
  const issue = html.indexOf('class="o-issue"');
  if (issue === -1) return html;
  const close = html.indexOf("</div>", issue);
  if (close === -1) return html;
  const insertAt = close + "</div>".length;
  return `${html.slice(0, insertAt)}\n    <div class="o-published">${escapeHtml(line)}</div>${html.slice(insertAt)}`;
}

export function injectHomePublishLines(html, linesByPath) {
  let next = html;
  for (const [href, line] of Object.entries(linesByPath)) {
    const marker = `href="${href}"`;
    const start = next.indexOf(marker);
    if (start === -1) continue;
    const issue = next.indexOf('class="ec-issue"', start);
    if (issue === -1) continue;
    const close = next.indexOf("</div>", issue);
    if (close === -1) continue;
    const insertAt = close + "</div>".length;
    if (next.slice(insertAt, insertAt + 120).includes('class="ec-when"')) continue;
    next = `${next.slice(0, insertAt)}\n        <div class="ec-when">${escapeHtml(line)}</div>${next.slice(insertAt)}`;
  }
  return next;
}
