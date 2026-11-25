import {
  aminoAcid,
  bendAngle,
  caDistance,
  checkpoints,
  CM_PER_RESIDUE,
  FIRST,
  LAST,
  PROPERTY_INFO,
  RESIDUES,
  segmentName,
  segments,
  SS_INFO,
  tooberCm,
  TOOBER_LENGTH_CM,
} from "@/lib/protein/analysis";
import { shownSideChains, type ModelDesign } from "@/lib/protein/design";
import { offerPrintable } from "@/components/protein/platform";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** Only #rrggbb colors reach a style attribute. */
const safeColor = (c: string) => (/^#[0-9a-fA-F]{6}$/.test(c) ? c : "#999999");

function printable(title: string, css: string, body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
      *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact} body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#111;margin:0;background:#fff}
      table{border-collapse:collapse;width:100%} th,td{border:1px solid #333;padding:4px 6px;text-align:left;vertical-align:top}
      th{background:#eee} .sw{display:inline-block;width:12px;height:12px;border:1px solid #333;border-radius:50%;vertical-align:-2px;margin-right:4px}
      @media screen{body{padding:24px}}
      ${css}
    </style></head><body>${body}<script>window.onload=()=>setTimeout(()=>window.print(),150)</script></body></html>`;
}

// ---------- legend (8.5″ × 5.5″) ----------

/** The legend card: half-letter landscape with 0.3″ margins (96 px per inch). */
export const LEGEND_CARD = { widthIn: 8.5, heightIn: 5.5, marginIn: 0.3 };

/** Font size (pt) for the legend body, shrinking a little as rows are added. */
export function legendFontPt(rows: number): number {
  return rows > 11 ? 7.5 : rows > 9 ? 8.5 : rows > 6 ? 9.5 : 10.5;
}

export function printLegend(design: ModelDesign): Promise<string | null> {
  const rows = design.features.filter((f) => f.inLegend);
  const body = `<div class="card">
    <h1>${esc(design.title || "Model Description Legend")}</h1>
    <table><thead><tr><th style="width:30%">What is displayed?</th><th style="width:30%">How is it displayed?</th><th>Why is it displayed?</th></tr></thead>
    <tbody>${rows
      .map(
        (f) =>
          `<tr><td>${esc(f.what)}</td><td><span class="sw" style="background:${safeColor(f.color)}"></span>${esc(f.how)}</td><td>${esc(f.why)}</td></tr>`,
      )
      .join("")}</tbody></table></div>`;
  const { widthIn, heightIn, marginIn } = LEGEND_CARD;
  return offerPrintable(
    "model-legend.html",
    printable(
      "Model Description Legend",
      `@page{size:${widthIn}in ${heightIn}in;margin:${marginIn}in} .card{width:${widthIn - 2 * marginIn}in;font-size:${legendFontPt(rows.length)}pt;line-height:1.25}
       h1{font-size:13pt;margin:0 0 6px} th,td{padding:3px 5px}`,
      body,
    ),
  );
}

// ---------- build sheet (letter) ----------

export function printBuildSheet(design: ModelDesign): Promise<string | null> {
  const shown = shownSideChains(design);
  const segs = segments();
  const cps = checkpoints();
  const segRows = segs
    .map((s) => {
      const partners = s.partners.map((p) => `${p.start}–${p.end} (${p.parallel ? "parallel" : "antiparallel"})`).join(", ");
      const span = s.start === s.end ? "—" : `${caDistance(s.start, s.end).cm.toFixed(1)} cm`;
      return `<tr><td>${s.index + 1}</td><td>${esc(segmentName(s))}</td><td>${s.length}</td><td>${s.fromCm}–${s.toCm} cm</td><td>${span}</td><td>${esc(partners)}</td><td class="box"></td></tr>`;
    })
    .join("");
  const resRows = RESIDUES.map((r) => {
    const aa = aminoAcid(r.aa);
    const p = PROPERTY_INFO[aa.property];
    const ang = bendAngle(r.n);
    return `<tr${r.n % 10 === 0 ? ' class="ten"' : ""}><td>${r.n}</td><td>${aa.three[0]}${aa.three.slice(1).toLowerCase()} (${aa.one})</td><td>${tooberCm(r.n)}</td><td>${r.ss === "H" ? "helix" : r.ss === "E" ? "strand" : "loop"}</td><td>${ang == null ? "end" : `${Math.round(ang)}°`}</td><td><span class="sw" style="background:${p.hex}"></span>${p.colorName}${shown.has(r.n) ? " ✔" : ""}</td></tr>`;
  });
  const half = Math.ceil(resRows.length / 2);
  const resTable = (rows: string[]) =>
    `<table class="res"><thead><tr><th>Res</th><th>Amino acid</th><th>Mark (cm)</th><th>SS</th><th>Angle</th><th>Side chain</th></tr></thead><tbody>${rows.join("")}</tbody></table>`;
  const cpRows = cps
    .map((c) => `<tr><td>${c.a} ↔ ${c.b}</td><td>${tooberCm(c.a)} cm ↔ ${tooberCm(c.b)} cm</td><td><b>${c.cm.toFixed(1)} cm</b></td><td>${esc(c.segA)} / ${esc(c.segB)}</td><td class="box"></td></tr>`)
    .join("");
  const body = `
    <h1>${esc(design.title)} — build sheet</h1>
    <p>Backbone: <b>${esc(design.backbone.material)}</b>, ${design.backbone.diameterCm} cm diameter, <b>${TOOBER_LENGTH_CM} cm</b> long (${CM_PER_RESIDUE} cm per amino acid, residues ${FIRST}–${LAST}).
    Each residue's alpha carbon sits at the <b>center</b> of its 2 cm: residue ${FIRST} at 1 cm, ${FIRST + 1} at 3 cm, … ${LAST} at ${TOOBER_LENGTH_CM - 1} cm. Residues marked ✔ get a side chain on your model.</p>
    <h2>1 · Folding order</h2>
    <table><thead><tr><th>#</th><th>Structure</th><th>Res.</th><th>On the material</th><th>End to end</th><th>Pairs with</th><th>✓</th></tr></thead><tbody>${segRows}</tbody></table>
    <h2>2 · Residue marks</h2>
    <p class="note"><b>Angle</b> is the angle at that mark between the 2 cm pieces on either side: 180° is straight, about 90° is a helix turn, about 120° is a strand pleat.</p>
    <div class="cols">${resTable(resRows.slice(0, half))}${resTable(resRows.slice(half))}</div>
    <h2 class="break">3 · Fold checkpoints</h2>
    <p class="note">These parts of the chain touch in the real structure. Measure between the two marks on your model (center to center of the tubing); it should be close to the distance shown.</p>
    <table><thead><tr><th>Residues</th><th>Marks</th><th>Distance</th><th>Structures</th><th>✓</th></tr></thead><tbody>${cpRows}</tbody></table>`;
  return offerPrintable(
    "build-sheet.html",
    printable(
      "Build sheet",
      `@page{size:letter;margin:0.45in} body{font-size:9.5pt} h1{font-size:15pt;margin:0 0 4px} h2{font-size:11.5pt;margin:12px 0 4px}
       p{margin:4px 0} .note{font-size:8.5pt;color:#333} .cols{display:grid;grid-template-columns:1fr 1fr;gap:10px}
       table.res td,table.res th{padding:1px 4px;font-size:8.5pt} tr.ten td{border-top:2px solid #000;font-weight:600}
       td.box{width:22px} @media print{.break{break-before:page}}`,
      body,
    ),
  );
}
