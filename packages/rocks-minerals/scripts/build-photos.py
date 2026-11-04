"""
Build specimen photos and Wikipedia summaries from curated Wikimedia Commons picks.

Inputs (from the scratch fetch step): curated picks below, candidate lists, downloaded
500px thumbnails, rendered article extracts. Outputs:
  apps/web/public/specimens/<key>.jpg   (hashed names so the file name never gives the answer)
  packages/rocks-minerals/src/photos.ts (PHOTOS + WIKI, with author/license/source for each photo)
Usage: python3 -I build-photos.py <scratch wiki dir>
"""
import hashlib, html, json, os, re, subprocess, sys, time, urllib.parse
from PIL import Image

W = sys.argv[1]
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
OUT_IMG = os.path.join(ROOT, "apps/web/public/specimens")
OUT_TS = os.path.join(ROOT, "packages/rocks-minerals/src/photos.ts")
UA = "SciOlyGuide/0.1 (educational study app; https://github.com/BAFOOD123/SciOlyGuide)"

# a = Wikipedia article image, s = Commons search result, t:<query>:<i> = second search round.
PICKS = {
 "ulexite": "a0 a1", "tourmaline": "a2 a4 a6", "azurite": "a0 a3 a6", "calcite": "a0 a2 a3", "dolomite": "a0 s3 s7",
 "malachite": "a3 a0 a4", "copper": "a0 s2 s7", "graphite": "s0 s1 s3", "sulfur": "s2 s3 s7", "fluorite": "a0 a3 a5",
 "halite": "a3 a4 a2", "bauxite": "a1 a0", "corundum": "s1 s2 a1", "limonite-goethite": "a3 a5 a0", "hematite": "a0 a4 a7",
 "magnetite": "a0 a3 a1", "apatite": "a0 s1 s3", "barite": "a0 a1", "alabaster": "t:alabaster2:1 t:alabaster2:2",
 "satin-spar": "s6 s2", "selenite": "a0 a4 a1", "bornite": "a0 a1", "beryl": "a2 a3 a0", "epidote": "a1 a7 a0",
 "kaolinite": "a0 s3", "kyanite": "a0 a2 a1", "olivine": "a2 a1 a4", "sodalite": "a0 a2", "staurolite": "a0 a1",
 "stilbite": "a0 a3 a5", "talc": "a0 s2 s5", "topaz": "a1 a3 a0", "hornblende": "a0 a1", "tremolite": "a0 a1 a2",
 "albite": "a0 a1", "labradorite": "a0 a1 a3", "amazonite": "a1 a2 a4", "microcline": "a0 s0 s6", "almandine": "a0 s0 s4",
 "biotite": "a1 a2 a3", "muscovite": "a0 a2", "augite": "a0 a1", "rhodonite": "a0 s5 s2", "agate": "a0 a2 a3",
 "amethyst": "a0 a1", "tiger-eye": "a0 a2 a3", "rock-crystal": "a0 a2", "white-quartzite": "s0 s2", "milky-quartz": "s7 s3",
 "rose-quartz": "a0 a2", "smoky-quartz": "a0 s4 s6", "citrine": "a1 a6 a4",
 "amphibolite": "a1 a2 a3", "gneiss": "a0 a1 a5", "marble": "s1 s2 s5", "phyllite": "s0 s1 s2", "quartzite": "a0 a1 a5",
 "garnet-schist": "a0", "mica-schist": "a0 a2", "talc-schist": "s0 s6 s7", "serpentinite": "a0 a1 a2", "slate": "s0 s1 s4",
 "andesite": "a0 a1", "basalt": "a0 a1 s2", "diorite": "a1 s3 s4", "gabbro": "a0 a1", "granite": "a0 a1 a5",
 "obsidian": "a0 a1 a6", "peridotite": "a0 a4 a3", "pumice": "a0 a5 a6", "rhyolite": "a0 t:rhyolite3:3 t:rhyolite3:4",
 "scoria": "a0 s3 s5", "syenite": "a0 t:syenite2:1 t:syenite3:0", "tuff": "a0 s3 s5",
 "arkose": "a0 s1 s6", "banded-iron-formation": "a2 a1", "breccia": "a0 s4 s6", "chert-flint": "a3 s1 s4",
 "conglomerate": "a3 a1", "diatomite": "a2", "dolostone": "a4 s5 s6", "graywacke": "s0 a0", "sandstone": "a0 a3",
 "shale": "s1 s6 s5", "anthracite": "a2 a3 a4", "bituminous": "s0 s3 a1", "chalk": "s0 s3 s5", "coquina": "a3 a4 a0",
 "fossil-limestone": "a1 a2", "oolitic-limestone": "a0 a1", "travertine": "s4 s6 s7", "rock-salt": "s0 s7 s1",
}

titles = json.load(open(os.path.join(os.path.dirname(__file__), "photo-pipeline", "titles.json")))
cands = json.load(open(f"{W}/cands.json"))
found = json.load(open(f"{W}/search_found.json"))
found2 = json.load(open(f"{W}/search_found2.json"))
extracts = json.load(open(f"{W}/extracts.json"))

def text(x):
    x = re.sub(r"<style[^>]*>.*?</style>", "", x, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", x))).strip()

def clean_author(a):
    a = re.sub(r"\.mw-parser-output.*?\}\s*", "", a)
    m = re.match(r"No machine-readable author provided\.\s*(.+?) assumed", a)
    if m: a = m.group(1)
    a = re.sub(r"^\S+\.(?:jpe?g|png): ", "", a, flags=re.I)
    a = re.split(r"\s+(?:You are free|derivative work|– CC|- CC|, CC-|CC-BY|Wikimedia Commons, CC|Alternative names|Description |It feels|My own)|\. My own", a)[0]
    if a.startswith("View this"): a = ""
    a = re.sub(r"https?://\S+", "", a)
    a = re.sub(r"\(\s*\)", "", a)
    a = re.sub(r"\s*\(\s*$", "", a)
    a = re.sub(r"^©\s*", "", a)
    a = re.sub(r"\s*/\s*CC BY.*$", "", a)
    a = re.sub(r"(Unknown author)+", "Unknown author", a)
    a = a.strip(" .,;:–-\"“”")
    return a

def file_info(fname):
    os.makedirs(f"{W}/fileinfo", exist_ok=True)
    path = f"{W}/fileinfo/{hashlib.md5(fname.encode()).hexdigest()}.html"
    if not os.path.exists(path) or os.path.getsize(path) < 500:
        url = "https://commons.wikimedia.org/w/index.php?" + urllib.parse.urlencode({"title": "File:" + fname, "action": "render"})
        for k in range(5):
            r = subprocess.run(["curl", "-sL", "-A", UA, "-w", "%{http_code}", "-o", path, url], capture_output=True, text=True)
            if r.stdout.strip() == "200": break
            time.sleep(5 * (k + 1))
        time.sleep(0.8)
    h = open(path, encoding="utf-8", errors="replace").read()
    a = re.search(r'id="fileinfotpl_aut"[^>]*>.*?</td>\s*<td[^>]*>(.*?)</td>', h, re.S)
    author = text(a.group(1)) if a else ""
    shorts = [text(m) for m in re.findall(r'class="licensetpl_short"[^>]*>(.*?)</span>', h, re.S)]
    links = [text(m) for m in re.findall(r'class="licensetpl_link"[^>]*>(.*?)</span>', h, re.S)]
    attr = re.search(r'class="licensetpl_attr"[^>]*>(.*?)</span>', h, re.S)
    if attr and text(attr.group(1)):
        author = text(attr.group(1))
    # Prefer CC / public-domain licenses; GFDL alone would require shipping the full license text.
    chosen = None
    for i, s in enumerate(shorts):
        if re.search(r"^(CC|Public domain|PD)", s, re.I):
            chosen = (s, links[i] if i < len(links) else None)
            break
    author = clean_author(author)
    author = re.sub(r"\s*\((?:talk|contribs?)[^)]*\)", "", author)
    author = re.sub(r"\s*\|.*$", "", author).strip(" .")
    if len(author) > 90: author = author[:87].rsplit(" ", 1)[0] + "…"
    return chosen, author or "Unknown author (see source)"

def clean_extract(t):
    t = re.sub(r"\s*\([^()]*[/ˈˌəæʃʒθðŋɪʊɛɔʌɑɒːˌ][^()]*\)", "", t)  # pronunciations
    t = re.sub(r"\s*\(\s*\)", "", t)
    t = re.sub(r"\s+", " ", t).strip()
    out = ""
    for sent in re.split(r"(?<=[.!?])\s+(?=[A-Z])", t):
        if len(out) + len(sent) > 480 and out: break
        out = (out + " " + sent).strip()
    return out

os.makedirs(OUT_IMG, exist_ok=True)
for f in os.listdir(OUT_IMG): os.remove(os.path.join(OUT_IMG, f))
photos, used, dropped = {}, set(), []
for sid, spec in PICKS.items():
    title = titles[sid]
    for tok in spec.split():
        if tok.startswith("a"):
            i = int(tok[1:]); c = cands[sid][i]; fname, caption, local = c["file"], c["caption"], f"{W}/thumbs/{sid}/{i}.jpg"
        elif tok.startswith("s"):
            i = int(tok[1:]); fname, caption, local = found[sid][i], "", f"{W}/sthumbs/{sid}/{i}.jpg"
        else:
            _, q, i = tok.split(":"); i = int(i); fname, caption, local = found2[q][i], "", f"{W}/sthumbs/{q}/{i}.jpg"
        fname = fname.replace("_", " ")
        if fname in used or not os.path.exists(local):
            dropped.append((sid, tok, "duplicate" if fname in used else "missing")); continue
        lic, author = file_info(fname.replace(" ", "_"))
        if not lic:
            dropped.append((sid, tok, "license")); continue
        used.add(fname)
        key = hashlib.sha1(("sog-photo:" + fname).encode()).hexdigest()[:12]
        im = Image.open(local).convert("RGB")
        im.thumbnail((640, 640))
        im.save(f"{OUT_IMG}/{key}.jpg", "JPEG", quality=82, optimize=True, progressive=True)
        photos.setdefault(sid, []).append({
            "key": key, "width": im.width, "height": im.height, "author": author, "license": lic[0],
            **({"licenseUrl": lic[1]} if lic[1] else {}),
            "source": "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(fname.replace(" ", "_")),
            **({"caption": caption[:160]} if caption else {}),
        })
wiki = {}
for sid, title in titles.items():
    ex = clean_extract(extracts.get(title, ""))
    if ex:
        wiki[sid] = {"title": title, "url": "https://en.wikipedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_")), "extract": ex}

with open(OUT_TS, "w") as f:
    f.write("// GENERATED by scripts/build-photos.py from curated Wikimedia Commons photos and\n")
    f.write("// Wikipedia article summaries (text CC BY-SA 4.0). Do not edit by hand.\n")
    f.write('import type { Photo, WikiInfo } from "./media.ts";\n\n')
    f.write("export const PHOTOS: Record<string, Photo[]> = " + json.dumps(photos, ensure_ascii=False, indent=1) + ";\n\n")
    f.write("export const WIKI: Record<string, WikiInfo> = " + json.dumps(wiki, ensure_ascii=False, indent=1) + ";\n")
total = sum(len(v) for v in photos.values())
size = sum(os.path.getsize(os.path.join(OUT_IMG, f)) for f in os.listdir(OUT_IMG))
print(f"photos {total} for {len(photos)} specimens, {size/1e6:.1f} MB; wiki {len(wiki)}")
print("no photos:", [s for s in PICKS if s not in photos])
print("dropped:", dropped)
from collections import Counter
print("licenses:", Counter(p["license"] for v in photos.values() for p in v).most_common(8))
