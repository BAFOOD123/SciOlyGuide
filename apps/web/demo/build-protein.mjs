// Build the Protein Model Studio as one self-contained HTML page (no server).
// Usage: node demo/build-protein.mjs [out.html]
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const web = resolve(here, "..");
const out = resolve(process.argv[2] ?? resolve(here, "dist/protein-model-studio.html"));
mkdirSync(dirname(out), { recursive: true });

const js = await build({
  entryPoints: [resolve(here, "protein/main.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  write: false,
  legalComments: "none",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: {
    "@/app/protein-modeling/actions": resolve(here, "protein/actions.ts"),
    "@/components/protein/platform": resolve(here, "protein/platform.ts"),
    "@": resolve(web, "src"),
  },
  logOverride: { "unsupported-directive": "silent" },
});

const globals = readFileSync(resolve(web, "src/app/globals.css"), "utf8").replace('@import "tailwindcss";', "");
const cssSrc = readFileSync(resolve(here, "demo.css"), "utf8").replace("/*__GLOBALS__*/", globals);
const css = (await postcss([tailwind({ base: web, optimize: true })]).process(cssSrc, { from: resolve(here, "demo.css") })).css;

const code = js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const html = `<meta charset="utf-8">
<title>Protein Model Studio</title>
<link rel="artifact-thumbnail" href="thumb.png">
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Plan your Science Olympiad Protein Modeling pre-build (3UBE residues 153–252) in 3D.">
<style>${css}</style>
<div id="root"></div>
<script>${code}</script>
`;
writeFileSync(out, html);
console.log(`✓ ${out} (${(html.length / 1024).toFixed(0)} KB: js ${(code.length / 1024).toFixed(0)} KB, css ${(css.length / 1024).toFixed(0)} KB)`);
