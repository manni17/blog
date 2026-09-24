const CONTACT_HEADING = "Partnerships, business development, and growth.";
const CONTACT_BODY =
  "Muhanad Abdelrahim is the founder of Steller Technology. He is based in Mississauga, Ontario, and is currently available for partnerships, business development, and growth roles in fintech, SaaS, and telecom.";

/** The Steller Story. This loop is only these three essays. */
export const ESSAY_SERIES = [
  {
    id: "rubble",
    path: "/blog/microservices-to-fat-controllers-agentic-pivot",
    issue: "Issue 01 · The Steller Story",
    title: "Built From the Rubble",
    dek: "Start with the failure that forced the redesign.",
  },
  {
    id: "completeStory",
    path: "/blog/the-complete-story",
    issue: "Issue 03 · The complete account",
    title: "The Complete Story",
    dek: "Why the rebuild was a redesign, not a rescue.",
  },
  {
    id: "plg",
    path: "/blog/plg-2-we-stopped-teaching-we-started-doing",
    issue: "Issue 02 · PLG 2.0",
    title: "We Stopped Teaching. We Started Doing.",
    dek: "How the 60-second path removes the onboarding work.",
  },
];

/**
 * Operating notes. A second series with its own loop.
 * Reading order: the file an agent reads first, the handover that file can
 * actually support, what zero full-time developers requires, where fat
 * controllers stop, why named jobs beat invisible events, then the partner
 * path (failure, 202, idempotency, doing the work), and the published cost last.
 */
export const OPERATING_NOTES = [
  {
    id: "agentsMd",
    path: "/blog/what-belongs-in-agents-md",
    issue: "Note 01 · Operating notes",
    title: "What Belongs in AGENTS.md",
    dek: "Router, hard rules, and the locks an agent is not allowed to relax.",
    lane: "Agentic",
  },
  {
    id: "handover",
    path: "/blog/the-agent-handover-protocol",
    issue: "Note 02 · Operating notes",
    title: "The Agent Handover Protocol",
    dek: "What the hardening week named, and what can still be quoted.",
    lane: "Agentic",
  },
  {
    id: "zeroFte",
    path: "/blog/what-zero-full-time-developers-actually-requires",
    issue: "Note 03 · Operating notes",
    title: "What Zero Full-Time Developers Actually Requires",
    dek: "The architecture, the docs, and the human approval that remain.",
    lane: "Agentic",
  },
  {
    id: "fatStop",
    path: "/blog/when-fat-controllers-stop-working",
    issue: "Note 04 · Operating notes",
    title: "When Fat Controllers Stop Working",
    dek: "The exit conditions the rubble essay already stated.",
    lane: "Agentic",
  },
  {
    id: "explicitJobs",
    path: "/blog/why-explicit-jobs-beat-invisible-events-for-ai",
    issue: "Note 05 · Operating notes",
    title: "Why Explicit Jobs Beat Invisible Events for AI",
    dek: "Named Hangfire work, and the Bamboo locks around it.",
    lane: "Agentic",
  },
  {
    id: "failureFirst",
    path: "/blog/the-failure-first-onboarding",
    issue: "Note 06 · Operating notes",
    title: "The Failure-First Onboarding",
    dek: "The three failures both essays surface, cited in each essay's order.",
    lane: "Partnership / PLG",
  },
  {
    id: "accepted202",
    path: "/blog/202-accepted-is-a-product-decision",
    issue: "Note 07 · Operating notes",
    title: "202 Accepted Is a Product Decision",
    dek: "Accepted is the value signal. The PIN comes later.",
    lane: "Partnership / PLG",
  },
  {
    id: "idempotency",
    path: "/blog/idempotency-for-gift-card-apis",
    issue: "Note 08 · Operating notes",
    title: "Idempotency for Gift Card APIs",
    dek: "referenceId for partners, and a separate vendor Idempotency-Key.",
    lane: "Partnership / PLG",
  },
  {
    id: "customerWork",
    path: "/blog/doing-the-customers-work-before-they-ask",
    issue: "Note 09 · Operating notes",
    title: "Doing the Customer’s Work Before They Ask",
    dek: "The published career through-line, and the 60-second path it became.",
    lane: "Partnership / PLG",
  },
  {
    id: "economics",
    path: "/blog/the-economics-of-agent-operated-software",
    issue: "Note 10 · Operating notes",
    title: "The Economics of Agent-Operated Software",
    dek: "The published spend, labeled as published, and what was not disclosed.",
    lane: "Agentic",
  },
];

const SERIES_GROUPS = [ESSAY_SERIES, OPERATING_NOTES];

export function seriesContaining(id) {
  return SERIES_GROUPS.find((series) => series.some((essay) => essay.id === id)) ?? null;
}

export const ESSAY_END_CSS = `
.end-next{display:block;background:#14110e;border:1px solid #3a3028;border-top:3px solid var(--rust);padding:2.75rem 2.5rem;margin:4rem -2.5rem 0;text-decoration:none;color:#E8E0D4}
a.end-next,a.end-next:hover,a.end-next:visited,a.end-next:focus{color:#E8E0D4;text-decoration:none}
.end-kicker{font-family:var(--mono);font-size:0.58rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--amber);margin-bottom:1rem}
.end-issue{font-family:var(--mono);font-size:0.58rem;letter-spacing:0.14em;text-transform:uppercase;color:#8a6a50;margin-bottom:0.65rem}
.end-title{font-family:var(--serif);font-size:clamp(1.85rem,3vw,2.45rem);font-weight:400;font-style:italic;line-height:1.12;color:#E8E0D4;margin:0 0 0.85rem}
.end-dek{font-family:var(--sans);font-size:0.92rem;line-height:1.6;color:#c4b8a8;max-width:36rem;margin:0 0 1.5rem}
.end-go{display:inline-block;background:var(--rust);color:#fff;font-family:var(--sans);font-size:0.85rem;font-weight:500;letter-spacing:0.02em;padding:0.85rem 1.5rem}
.end-also{margin:1.75rem 0 0;padding-top:1.15rem;border-top:1px solid var(--rule)}
.end-also-k{font-family:var(--mono);font-size:0.58rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--dust);margin-bottom:0.85rem}
.end-also ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0.85rem}
.end-also a{display:flex;flex-direction:column;gap:0.2rem;text-decoration:none;color:var(--rust)}
.end-also a:hover{text-decoration:none}
.end-also a:hover .end-also-title{text-decoration:underline}
.end-also-issue{font-family:var(--mono);font-size:0.58rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--rust)}
.end-also-title{font-family:var(--serif);font-size:1.2rem;font-weight:500;line-height:1.25;color:var(--ink);text-transform:none;letter-spacing:0}
.end-work{background:var(--white);border:1px solid var(--rule);border-left:3px solid var(--amber);padding:1.85rem 2.25rem;margin:2.25rem -2.5rem 0}
.end-work-k{font-family:var(--mono);font-size:0.58rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--amber);margin-bottom:0.7rem}
.end-work h3{font-family:var(--serif);font-style:italic;font-weight:400;font-size:1.45rem;line-height:1.2;color:var(--ink);margin:0 0 0.55rem}
.end-work p{font-family:var(--sans);font-size:0.82rem;line-height:1.65;color:var(--dust);margin:0 0 1rem;max-width:40rem}
.end-work-links{display:flex;flex-wrap:wrap;gap:0.75rem 1.5rem}
.end-work-links a{font-family:var(--mono);font-size:0.68rem;letter-spacing:0.04em;color:var(--ink);text-decoration:none;border-bottom:1px solid var(--amber);padding-bottom:0.1rem}
.end-work-links a:hover{color:var(--rust);text-decoration:none}
.chapter-dark .end-also,.ch-dark .end-also{border-top-color:#2a2520}
.chapter-dark .end-also-k,.ch-dark .end-also-k{color:#6a5a4a}
.chapter-dark .end-also-title,.ch-dark .end-also-title{color:#E8E0D4}
.chapter-dark .end-dek,.ch-dark .end-dek{color:#c4b8a8}
.chapter-dark .end-work h3,.ch-dark .end-work h3{color:var(--ink)}
.chapter-dark .end-work p,.ch-dark .end-work p{color:var(--dust)}
@media(max-width:860px){
  .end-next,.end-work{margin-left:0;margin-right:0;padding:1.75rem 1.25rem}
}
`;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderEssayEnd(id) {
  const series = seriesContaining(id);
  if (!series) {
    throw new Error(`Unknown essay end id: ${id}`);
  }
  const index = series.findIndex((essay) => essay.id === id);

  const next = series[(index + 1) % series.length];
  const others = series.filter((essay) => essay.id !== id)
    .map(
      (essay) => `<li><a href="${escapeHtml(essay.path)}"><span class="end-also-issue">${escapeHtml(essay.issue)}</span><span class="end-also-title">${escapeHtml(essay.title)}</span></a></li>`,
    )
    .join("");

  return `<section class="essay-end" aria-label="Continue reading">
  <a class="end-next r" href="${escapeHtml(next.path)}">
    <div class="end-kicker">Next in the series</div>
    <div class="end-issue">${escapeHtml(next.issue)}</div>
    <div class="end-title">${escapeHtml(next.title)}</div>
    <div class="end-dek">${escapeHtml(next.dek)}</div>
    <span class="end-go">Read the essay →</span>
  </a>
  <nav class="end-also" aria-label="Also in this series">
    <div class="end-also-k">Also in this series</div>
    <ul>${others}</ul>
  </nav>
</section>
<aside class="end-work r" aria-label="Work with me">
  <div class="end-work-k">Work with me</div>
  <h3>${escapeHtml(CONTACT_HEADING)}</h3>
  <p>${escapeHtml(CONTACT_BODY)}</p>
  <div class="end-work-links">
    <a href="mailto:hello@steler.org">hello@steler.org</a>
    <a href="https://linkedin.com/in/muhanad-mukashfi" rel="noopener noreferrer">linkedin.com/in/muhanad-mukashfi</a>
  </div>
</aside>`;
}

export function injectEssayEnd(html) {
  const match = html.match(/<!--essay-end:([a-zA-Z0-9_-]+)-->/);
  if (!match) return html;

  const block = renderEssayEnd(match[1]);
  const withBlock = html.replace(/<!--essay-end:([a-zA-Z0-9_-]+)-->/, block);
  const styleClose = withBlock.indexOf("</style>");
  if (styleClose === -1) {
    throw new Error("Essay HTML is missing a style block for end navigation.");
  }
  const css = `\n/* essay-end */\n${ESSAY_END_CSS}\n`;
  return withBlock.slice(0, styleClose) + css + withBlock.slice(styleClose);
}
