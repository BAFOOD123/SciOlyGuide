import {
  aminoAcid,
  CM_PER_RESIDUE,
  PROPERTY_INFO,
  RESIDUES,
  segments,
  SS_INFO,
  tooberCm,
  TOOBER_LENGTH_CM,
} from "@/lib/protein/analysis";
import { shownSideChains, type ModelDesign } from "@/lib/protein/design";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function openPrint(title: string, css: string, body: string) {
  const w = window.open("", "_blank");
  if (!w) {
    alert("Allow pop-ups for this site to print.");
    return;
  }
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
      *{box-sizing:border-box} body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#111;margin:0}
      table{border-collapse:collapse;width:100%} th,td{border:1px solid #333;padding:4px 6px;text-align:left;vertical-align:top}
      th{background:#eee} *{-webkit-print-color-adjust:exact;print-color-adjust:exact} .sw{display:inline-block;width:12px;height:12px;border:1px solid #333;border-radius:50%;vertical-align:-2px;margin-right:4px}
      ${css}
    </style></head><body>${body}<script>window.onload=()=>setTimeout(()=>window.print(),150)</script></body></html>`,
  );
  w.document.close();
}

/** The Model Description Legend: 8.5″ × 5.5″, three columns (What / How / Why). */
export function printLegend(design: ModelDesign) {
  const rows = design.features.filter((f) => f.inLegend);
  const body = `<div class="card">
    <h1>${esc(design.title || "Model Description Legend")}</h1>
    <table><thead><tr><th style="width:30%">What is displayed?</th><th style="width:30%">How is it displayed?</th><th>Why is it displayed?</th></tr></thead>
    <tbody>${rows
      .map(
        (f) =>
          `<tr><td>${esc(f.what)}</td><td><span class="sw" style="background:${f.color}"></span>${esc(f.how)}</td><td>${esc(f.why)}</td></tr>`,
      )
      .join("")}</tbody></table></div>`;
  const fs = rows.length > 9 ? 8.5 : rows.length > 6 ? 9.5 : 10.5;
  openPrint(
    "Model Description Legend",
    `@page{size:8.5in 5.5in;margin:0.3in} .card{width:7.9in;font-size:${fs}pt} h1{font-size:13pt;margin:0 0 6px}`,
    body,
  );
}

/** The build sheet: where each residue's mark goes on the backbone material, plus the folding steps. */
export function printBuildSheet(design: ModelDesign) {
  const shown = shownSideChains(design);
  const segs = segments();
  const segRows = segs
    .map((s) => {
      const partners = s.partners.map((p) => `${p.start}–${p.end} (${p.parallel ? "parallel" : "antiparallel"})`).join(", ");
      return `<tr><td>${s.index + 1}</td><td>${SS_INFO[s.ss].label}</td><td>${s.start === s.end ? s.start : `${s.start}–${s.end}`}</td><td>${s.length}</td><td>${s.fromCm}–${s.toCm} cm</td><td>${esc(partners)}</td></tr>`;
    })
    .join("");
  const resRows = RESIDUES.map((r) => {
    const aa = aminoAcid(r.aa);
    const p = PROPERTY_INFO[aa.property];
    return `<tr${r.n % 10 === 0 ? ' class="ten"' : ""}><td>${r.n}</td><td>${aa.three[0]}${aa.three.slice(1).toLowerCase()} (${aa.one})</td><td>${tooberCm(r.n).toFixed(0)}</td><td>${r.ss === "H" ? "helix" : r.ss === "E" ? "strand" : "loop"}</td><td><span class="sw" style="background:${p.hex}"></span>${p.colorName}${shown.has(r.n) ? " ✔" : ""}</td></tr>`;
  });
  const half = Math.ceil(resRows.length / 2);
  const resTable = (rows: string[]) =>
    `<table class="res"><thead><tr><th>Res</th><th>Amino acid</th><th>Mark (cm)</th><th>SS</th><th>Side chain</th></tr></thead><tbody>${rows.join("")}</tbody></table>`;
  const body = `
    <h1>${esc(design.title)} — build sheet</h1>
    <p>Backbone: <b>${esc(design.backbone.material)}</b>, ${design.backbone.diameterCm} cm diameter, ${TOOBER_LENGTH_CM} cm long (${CM_PER_RESIDUE} cm per amino acid).
    Each residue's alpha carbon sits at the <b>center</b> of its 2 cm: residue 153 at 1 cm, 154 at 3 cm, … 252 at ${TOOBER_LENGTH_CM - 1} cm. Residues marked ✔ get a side chain on your model.</p>
    <h2>Folding order</h2>
    <table><thead><tr><th>#</th><th>Structure</th><th>Residues</th><th>Count</th><th>On the material</th><th>Pairs with</th></tr></thead><tbody>${segRows}</tbody></table>
    <h2>Residue marks</h2>
    <div class="cols">${resTable(resRows.slice(0, half))}${resTable(resRows.slice(half))}</div>`;
  openPrint(
    "Build sheet",
    `@page{size:letter;margin:0.45in} body{font-size:9.5pt} h1{font-size:15pt;margin:0 0 4px} h2{font-size:11.5pt;margin:12px 0 4px}
     p{margin:4px 0} .cols{display:grid;grid-template-columns:1fr 1fr;gap:10px} table.res td,table.res th{padding:1px 4px;font-size:8.5pt}
     tr.ten td{border-top:2px solid #000;font-weight:600}`,
    body,
  );
}
