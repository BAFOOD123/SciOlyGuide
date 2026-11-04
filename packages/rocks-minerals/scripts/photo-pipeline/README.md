# Specimen photo pipeline

How the Rocks and Minerals photos and summaries were collected (Wikimedia Commons + Wikipedia).
Run with `SOG_WIKI_DIR=<cache dir>`; each step caches its downloads.

1. `render.py` fetches each specimen's Wikipedia article (`titles.json`) as rendered HTML
   (`index.php?action=render`, about 1 request per second with a descriptive User-Agent).
2. `parse.py` extracts each article's lead paragraph and its candidate JPEG photos, skipping maps,
   diagrams, thin sections and buildings.
3. `select.py` builds per-specimen candidate lists, downloads 500px thumbnails and makes contact
   sheets for review by eye.
4. `search.py` / `search2.py` run Commons searches for specimens whose article lacked a usable
   hand-specimen photo.
5. `../build-photos.py <cache dir>` applies the hand-curated `PICKS`, fetches each file's
   author and license from its Commons file page (CC and public-domain only), writes hashed
   JPEGs to `apps/web/public/specimens/` and generates `src/photos.ts`.

Photo file names are hashes, so neither the name nor the URL gives the answer away during Photo ID.
