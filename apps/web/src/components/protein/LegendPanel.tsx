"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { offerFile } from "@/components/protein/platform";
import { defaultDesign, parseDesign, type ModelDesign } from "@/lib/protein/design";
import { LEGEND_CARD, legendFontPt, printLegend } from "./print";
import { PrintButton } from "./ui";

const PX_PER_IN = 96;
const CARD_W = LEGEND_CARD.widthIn * PX_PER_IN;
const CARD_H = LEGEND_CARD.heightIn * PX_PER_IN;
const PAD = LEGEND_CARD.marginIn * PX_PER_IN;

export function LegendPanel({
  design,
  update,
  onImport,
}: {
  design: ModelDesign;
  update: (fn: (d: ModelDesign) => ModelDesign) => void;
  onImport: (d: ModelDesign) => void;
}) {
  const rows = design.features.filter((f) => f.inLegend);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState<ModelDesign | null>(null);

  const exportJson = async () => {
    setMsg(await offerFile("protein-model-design.json", JSON.stringify(design, null, 2)));
  };
  const importJson = async (file: File) => {
    try {
      const raw = JSON.parse(await file.text());
      if (!raw || raw.v !== 1) throw new Error("bad");
      const d = parseDesign(raw);
      if (JSON.stringify(d) === JSON.stringify(defaultDesign())) throw new Error("bad");
      setPending(d);
      setMsg(null);
    } catch {
      setPending(null);
      setMsg("That file isn’t a protein model design exported from this studio.");
    }
  };

  return (
    <div className="space-y-4 text-sm">
      <label className="block" htmlFor="pm-legend-title">
        <span className="mb-0.5 block text-xs font-medium text-zinc-500">Legend title</span>
        <input
          id="pm-legend-title"
          className="input py-1.5"
          maxLength={80}
          value={design.title}
          onChange={(e) => update((d) => ({ ...d, title: e.target.value }))}
        />
      </label>

      <CardPreview design={design} />

      <PrintButton className="btn btn-primary w-full" label="legend (8.5″ × 5.5″)" run={() => printLegend(design)} />
      <p className="text-xs text-zinc-500">
        {rows.length} row{rows.length === 1 ? "" : "s"}. Edit them in the Features tab; untick “In legend” to leave a feature off the card.
      </p>

      <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <h3 className="font-semibold">Share with your partner</h3>
        <p className="text-xs text-zinc-500">Export your design as a file. Your partner imports it on their device to get the same model, features and progress.</p>
        <div className="flex gap-2">
          <button className="btn btn-secondary flex-1" onClick={exportJson}>
            Export design
          </button>
          <button className="btn btn-secondary flex-1" onClick={() => fileRef.current?.click()}>
            Import design
          </button>
          <input
            ref={fileRef}
            id="pm-import"
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importJson(f);
              e.target.value = "";
            }}
          />
        </div>
        {pending && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs dark:border-amber-800 dark:bg-amber-950/40">
            <span className="min-w-0 flex-1">
              Replace your current design with “{pending.title}” ({pending.features.length} features)? You can undo this.
            </span>
            <button
              className="btn btn-primary px-2 py-1 text-xs"
              onClick={() => {
                onImport(pending);
                setPending(null);
              }}
            >
              Replace
            </button>
            <button className="btn btn-secondary px-2 py-1 text-xs" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        )}
        {msg && (
          <p role="status" className="text-xs text-zinc-600 dark:text-zinc-400">
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

/** The legend card at its real proportions, scaled to fit, with a check that the table fits the page. */
function CardPreview({ design }: { design: ModelDesign }) {
  const rows = design.features.filter((f) => f.inLegend);
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [overflow, setOverflow] = useState(false);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => setScale(box.clientWidth / CARD_W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);
  useLayoutEffect(() => {
    const c = contentRef.current;
    if (c) setOverflow(c.scrollHeight > CARD_H - 2 * PAD + 1);
  });

  const fontPt = legendFontPt(rows.length);
  const cell: React.CSSProperties = { border: "1px solid #333", padding: "3px 5px", textAlign: "left", verticalAlign: "top" };
  return (
    <div className="space-y-1.5">
      <div ref={boxRef} className="relative w-full overflow-hidden rounded-md border border-zinc-300 shadow-sm dark:border-zinc-700" style={{ height: CARD_H * scale }}>
        <div
          className="absolute left-0 top-0 origin-top-left bg-white text-[#111]"
          style={{ width: CARD_W, height: CARD_H, padding: PAD, transform: `scale(${scale})`, fontFamily: 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif' }}
          aria-label="Legend preview"
        >
          <div ref={contentRef} style={{ fontSize: `${fontPt}pt`, lineHeight: 1.25, maxHeight: CARD_H - 2 * PAD, overflow: "hidden" }}>
            <div style={{ fontSize: "13pt", fontWeight: 700, margin: "0 0 6px" }}>{design.title || "Model Description Legend"}</div>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr style={{ background: "#eee" }}>
                  <th style={{ ...cell, width: "30%" }}>What is displayed?</th>
                  <th style={{ ...cell, width: "30%" }}>How is it displayed?</th>
                  <th style={cell}>Why is it displayed?</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((f) => (
                  <tr key={f.id}>
                    <td style={cell}>{f.what}</td>
                    <td style={cell}>
                      <span style={{ display: "inline-block", width: 12, height: 12, border: "1px solid #333", borderRadius: "50%", verticalAlign: -2, marginRight: 4, background: f.color }} />
                      {f.how}
                    </td>
                    <td style={cell}>{f.why || <span style={{ color: "#b45309", fontStyle: "italic" }}>missing</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <p className={`text-xs font-medium ${overflow ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}`} role="status">
        {overflow ? "Too long for the 8.5″ × 5.5″ card: shorten some rows or leave a few out." : "Fits on the 8.5″ × 5.5″ card."}
      </p>
    </div>
  );
}
