// Generates crawlable pages and sitemap.xml from each problem's meta.js.
//
// The app itself is a single-page app that routes problems by URL hash (`/#slug`).
// Search engines do not index hash fragments as separate pages, so this script writes
// one static page per problem at `/problems/<slug>/` (served directly by Firebase
// Hosting before the SPA rewrite) and lists those canonical URLs in sitemap.xml.
//
// Only our own metadata is published here (number, title, tags, and the one-line
// description we authored). No LeetCode statement text or examples are used.

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const SITE = "https://visualizer.pro";
const TODAY = new Date().toISOString().slice(0, 10);

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

async function loadProblems() {
  const srcRoot = path.join(ROOT, "src", "problems");
  const entries = fs
    .readdirSync(srcRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(srcRoot, d.name, "meta.js"))
    .filter((file) => fs.existsSync(file));

  const bySlug = new Map();
  for (const file of entries) {
    const mod = await import(pathToFileURL(file).href);
    const meta = mod?.meta;
    if (!meta?.number || !meta?.title) continue;
    const slug = meta.slug || String(meta.title).toLowerCase().replace(/\s+/g, "-");
    if (!/^[a-z0-9-]+$/.test(slug)) {
      console.warn(`skip: unsafe slug "${slug}" in ${file}`);
      continue;
    }
    // The app resolves a hash to the first matching slug, so only one page per slug.
    if (bySlug.has(slug)) {
      console.warn(`skip: duplicate slug "${slug}" in ${file}`);
      continue;
    }
    bySlug.set(slug, { ...meta, slug });
  }
  return [...bySlug.values()].sort((a, b) =>
    String(a.slug).localeCompare(String(b.slug)),
  );
}

function problemPage(p) {
  const title = `${p.number}. ${p.title} | Visualizer Pro`;
  const description = p.description || `Step-by-step visualisation of ${p.title}.`;
  const url = `${SITE}/problems/${p.slug}/`;
  const tags = (p.tags || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(url)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:image" content="${SITE}/og-image-v2.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <style>
    :root { color-scheme: light dark; --fg: #0f172a; --muted: #475569; --accent: ${escapeHtml(p.accent || "#2563eb")}; --bg: #ffffff; }
    @media (prefers-color-scheme: dark) { :root { --fg: #e2e8f0; --muted: #94a3b8; --bg: #0b1120; } }
    body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.6 system-ui, -apple-system, Segoe UI, sans-serif; }
    main { max-width: 720px; margin: 0 auto; padding: 32px 16px; }
    h1 { font-size: 1.75rem; margin: 0 0 8px; }
    .meta { color: var(--muted); margin: 0 0 16px; }
    .tags { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 24px; }
    .tags li { border: 1px solid var(--accent); border-radius: 999px; padding: 2px 10px; font-size: 0.85rem; }
    .cta { display: inline-block; background: var(--accent); color: #fff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    footer { margin-top: 32px; font-size: 0.9rem; color: var(--muted); }
    footer a { color: inherit; }
  </style>
</head>
<body>
  <main>
    <p class="meta">Problem ${escapeHtml(p.number)} &middot; ${escapeHtml(p.difficulty || "")}</p>
    <h1>${escapeHtml(p.title)}</h1>
    <p>${escapeHtml(description)}</p>
    ${tags ? `<ul class="tags">${tags}</ul>` : ""}
    <p><a class="cta" href="/#${escapeHtml(p.slug)}">Open the interactive visualisation</a></p>
    <footer>
      <a href="/">All problems</a> &middot; <a href="/privacy.html">Privacy</a> &middot; <a href="/terms.html">Terms</a>
    </footer>
  </main>
</body>
</html>
`;
}

function sitemap(problems) {
  const urls = [
    { loc: `${SITE}/`, changefreq: "weekly", priority: "1.0" },
    { loc: `${SITE}/privacy.html`, changefreq: "yearly", priority: "0.3" },
    { loc: `${SITE}/terms.html`, changefreq: "yearly", priority: "0.3" },
    ...problems.map((p) => ({
      loc: `${SITE}/problems/${p.slug}/`,
      changefreq: "monthly",
      priority: "0.7",
    })),
  ];
  const body = urls
    .map(
      (u) =>
        `  <url><loc>${escapeHtml(u.loc)}</loc><lastmod>${TODAY}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

const problems = await loadProblems();
const pagesRoot = path.join(PUBLIC, "problems");
// Never delete committed pages: this run may load fewer problems than the site has, and removing the folder
// first previously wiped thousands of committed pages. Existing pages are overwritten, never removed.
for (const p of problems) {
  const dir = path.join(pagesRoot, p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), problemPage(p));
}
fs.writeFileSync(path.join(PUBLIC, "sitemap.xml"), sitemap(problems));
console.log(`wrote ${problems.length} problem pages and public/sitemap.xml (${problems.length + 3} URLs)`);
