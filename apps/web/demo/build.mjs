// Build a single self-contained HTML demo of Codebusters (no server, no accounts).
// Usage: node demo/build.mjs <out.html>
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const web = resolve(here, "..");
const out = resolve(process.argv[2] ?? resolve(here, "dist/sciolyguide-demo.html"));

const js = await build({
  entryPoints: [resolve(here, "main.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  write: false,
  legalComments: "none",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: {
    "@/app/codebusters/actions": resolve(here, "actions.ts"),
    "@/app/home-actions": resolve(here, "home-actions.ts"),
    "@/app/rocks-and-minerals/actions": resolve(here, "rocks-actions.ts"),
    "next/link": resolve(here, "Link.tsx"),
    "@": resolve(web, "src"),
  },
  logOverride: { "unsupported-directive": "silent" },
});

const globals = readFileSync(resolve(web, "src/app/globals.css"), "utf8").replace('@import "tailwindcss";', "");
const cssSrc = readFileSync(resolve(here, "demo.css"), "utf8").replace("/*__GLOBALS__*/", globals);
const css = (await postcss([tailwind({ base: web, optimize: true })]).process(cssSrc, { from: resolve(here, "demo.css") })).css;

const code = js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const html = `<meta charset="utf-8">
<title>SciOlyGuide</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Free Division C Science Olympiad study app: choose your events, with Codebusters and Rocks and Minerals live.">
<style>${css}</style>
<div id="root"></div>
<script>${code}</script>
`;
writeFileSync(out, html);
console.log(`✓ ${out} (${(html.length / 1024).toFixed(0)} KB: js ${(code.length / 1024).toFixed(0)} KB, css ${(css.length / 1024).toFixed(0)} KB)`);
