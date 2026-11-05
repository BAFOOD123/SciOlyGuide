// Builds content/guides/*.md into a generated TS module of HTML + table of contents.
// Self-contained Markdown subset converter (headings, tables, lists, callouts,
// <details>, inline formatting, and ![caption](img:name) figures).
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..", "..");
const guidesDir = join(repo, "content", "guides");
const publicGuides = join(here, "..", "public", "guides");
const outFile = join(here, "..", "src", "lib", "guides.generated.ts");

// Image attributions (Wikimedia Commons). Keyed by img name.
let CREDITS = {};
{
  const cp = join(guidesDir, "credits.json");
  if (existsSync(cp)) {
    try { CREDITS = JSON.parse(readFileSync(cp, "utf8")); } catch { CREDITS = {}; }
  }
}
const LICENSE_LABEL = (l) => {
  const s = String(l || "").toLowerCase();
  if (s.startsWith("cc-by-sa")) return "CC BY-SA";
  if (s.startsWith("cc-by")) return "CC BY";
  if (s.startsWith("cc-zero") || s === "cc0") return "CC0";
  if (s.startsWith("pd") || s.includes("public domain")) return "Public domain";
  return "Wikimedia Commons";
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => esc(s).replace(/"/g, "&quot;");

// Which image keys have a real file published (public/guides/<key>.jpg).
function imageExists(name) {
  return existsSync(join(publicGuides, name + ".jpg")) || existsSync(join(publicGuides, name + ".png")) || existsSync(join(publicGuides, name + ".svg"));
}
function imageExt(name) {
  for (const e of ["jpg", "png", "svg"]) if (existsSync(join(publicGuides, name + "." + e))) return e;
  return null;
}

function inline(text) {
  // Tokenize inline code first so its contents are not further processed.
  const codes = [];
  text = text.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(`<code>${esc(c)}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });
  text = esc(text);
  // Images: ![alt](img:name) or ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\((img:[^)]+|[^)]+)\)/g, (_, alt, src) => figure(alt, src));
  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, href) => {
    const ext = /^https?:/.test(href);
    return `<a href="${escAttr(href)}"${ext ? ' target="_blank" rel="noreferrer"' : ""}>${t}</a>`;
  });
  // Bold then italic
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  // Restore code spans
  text = text.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)]);
  return text;
}

function figure(caption, src) {
  if (src.startsWith("img:")) {
    const name = src.slice(4);
    const ext = imageExt(name);
    if (ext) {
      const c = CREDITS[name];
      const credit = c
        ? ` <span class="guide-credit">· <a href="${escAttr(c.source)}" target="_blank" rel="noreferrer">${escAttr(c.author || "Wikimedia Commons")}, ${LICENSE_LABEL(c.license)}</a></span>`
        : "";
      return `<figure class="guide-figure"><img src="\${GUIDE_IMG}${name}.${ext}" alt="${escAttr(caption)}" loading="lazy" /><figcaption>${inline(caption)}${credit}</figcaption></figure>`;
    }
    // No image yet: a compact labelled note so the guide still reads well.
    return `<figure class="guide-figure guide-figure-missing"><div class="guide-figure-ph" role="img" aria-label="Diagram: ${escAttr(caption)}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="8.5" cy="9.5" r="1.8" stroke="currentColor" stroke-width="1.4"/><path d="M4 17l5-5 4 3 3-3 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${inline(caption)}</span></div></figure>`;
  }
  return `<figure class="guide-figure"><img src="${escAttr(src)}" alt="${escAttr(caption)}" loading="lazy" /><figcaption>${inline(caption)}</figcaption></figure>`;
}

function slugify(s) {
  return s.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9 ]/g, "").trim().replace(/\s+/g, "-");
}

function convert(md) {
  const lines = md.split("\n");
  const out = [];
  const toc = [];
  let i = 0;
  const flushList = () => {};
  while (i < lines.length) {
    let line = lines[i];
    // Raw HTML block (details/summary): pass through, inline-processing summary text.
    if (/^<details>/.test(line)) {
      out.push("<details>");
      // summary may be on the same line as <details> or on the next line
      const sameLine = line.match(/^<details>\s*<summary>([\s\S]*?)<\/summary>\s*$/);
      if (sameLine) {
        out.push(`<summary>${inline(sameLine[1])}</summary>`);
        i++;
      } else {
        i++;
        if (i < lines.length && /^<summary>/.test(lines[i])) {
          const inner = lines[i].replace(/^<summary>/, "").replace(/<\/summary>$/, "");
          out.push(`<summary>${inline(inner)}</summary>`);
          i++;
        }
      }
      // body until </details>
      const body = [];
      while (i < lines.length && !/^<\/details>/.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      out.push(convert(body.join("\n")).html);
      out.push("</details>");
      i++; // skip </details>
      continue;
    }
    // Blank
    if (/^\s*$/.test(line)) { i++; continue; }
    // Headings
    let m = line.match(/^(#{1,6})\s+(.*)$/);
    if (m) {
      const level = m[1].length;
      const text = m[2];
      if (level === 2) {
        const id = slugify(text);
        toc.push({ id, text: text.replace(/<[^>]+>/g, "") });
        out.push(`<h2 id="${id}">${inline(text)}</h2>`);
      } else {
        out.push(`<h${level}>${inline(text)}</h${level}>`);
      }
      i++;
      continue;
    }
    // Horizontal rule
    if (/^---+$/.test(line)) { out.push("<hr />"); i++; continue; }
    // Callout blockquote: > [!NOTE] / [!TIP]
    if (/^>\s*\[!(NOTE|TIP|WARNING)\]/.test(line)) {
      const kind = line.match(/\[!(NOTE|TIP|WARNING)\]/)[1].toLowerCase();
      const buf = [line.replace(/^>\s*\[![A-Z]+\]\s*/, "")];
      i++;
      while (i < lines.length && /^>/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      out.push(`<div class="callout callout-${kind}"><p>${buf.filter(Boolean).map(inline).join("<br />")}</p></div>`);
      continue;
    }
    // Plain blockquote
    if (/^>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      out.push(`<blockquote>${buf.map(inline).join("<br />")}</blockquote>`);
      continue;
    }
    // Table
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|?[\s:|-]+\|/.test(lines[i + 1]) && lines[i + 1].includes("-")) {
      const header = splitRow(line);
      i += 2; // skip header + separator
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(splitRow(lines[i])); i++; }
      let t = '<div class="table-wrap"><table><thead><tr>';
      t += header.map((h) => `<th>${inline(h)}</th>`).join("");
      t += "</tr></thead><tbody>";
      for (const r of rows) {
        t += "<tr>" + header.map((_, c) => `<td>${inline(r[c] ?? "")}</td>`).join("") + "</tr>";
      }
      t += "</tbody></table></div>";
      out.push(t);
      continue;
    }
    // Lists (unordered or ordered)
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const tag = ordered ? "ol" : "ul";
      const items = [];
      while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))) {
        items.push(lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, ""));
        i++;
      }
      out.push(`<${tag}>` + items.map((it) => `<li>${inline(it)}</li>`).join("") + `</${tag}>`);
      continue;
    }
    // Standalone image paragraph
    if (/^!\[/.test(line)) { out.push(inline(line)); i++; continue; }
    // Paragraph (gather until blank)
    const buf = [line];
    i++;
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6}\s|>|\||---+$|\s*[-*]\s|\s*\d+\.\s|<details>|!\[)/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }
  return { html: out.join("\n"), toc };
}

function splitRow(line) {
  return line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
}

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { meta: {}, body: md };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (mm) meta[mm[1]] = mm[2];
  }
  return { meta, body: md.slice(m[0].length) };
}

const files = readdirSync(guidesDir).filter((f) => f.endsWith(".md")).sort();
const entries = [];
let withImages = 0;
for (const f of files) {
  const slug = f.replace(/\.md$/, "");
  const raw = readFileSync(join(guidesDir, f), "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const { html, toc } = convert(body);
  const imgCount = (body.match(/\(img:/g) || []).length;
  const imgShown = (html.match(/<img /g) || []).length;
  withImages += imgShown;
  entries.push({ slug, title: meta.title || slug, type: meta.type || "", summary: meta.summary || "", html, toc, imgCount });
}

const ts =
  `// AUTO-GENERATED by scripts/build-guides.mjs. Do not edit by hand.\n` +
  `// Run: node scripts/build-guides.mjs\n` +
  `export interface GuideToc { id: string; text: string }\n` +
  `export interface Guide { slug: string; title: string; type: string; summary: string; html: string; toc: GuideToc[] }\n\n` +
  `// Base path for guide images; overridden in the demo build.\n` +
  `const GUIDE_IMG = (globalThis as unknown as { __SOG_GUIDE_BASE?: string }).__SOG_GUIDE_BASE ?? "/guides/";\n\n` +
  `export const GUIDES: Record<string, Guide> = {\n` +
  entries
    .map(
      (e) =>
        `  ${JSON.stringify(e.slug)}: {\n` +
        `    slug: ${JSON.stringify(e.slug)},\n` +
        `    title: ${JSON.stringify(e.title)},\n` +
        `    type: ${JSON.stringify(e.type)},\n` +
        `    summary: ${JSON.stringify(e.summary)},\n` +
        `    toc: ${JSON.stringify(e.toc)},\n` +
        `    html: \`${e.html.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{(?!GUIDE_IMG)/g, "\\${")}\`,\n` +
        `  },`
    )
    .join("\n") +
  `\n};\n\n` +
  `export function guideFor(slug: string): Guide | undefined {\n  return GUIDES[slug];\n}\n`;

writeFileSync(outFile, ts);
console.log(`Wrote ${entries.length} guides to ${outFile} (${withImages} images rendered, ${entries.reduce((a, e) => a + e.imgCount, 0)} placeholders total).`);
