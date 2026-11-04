import json, os, re, subprocess, time
from PIL import Image, ImageDraw
W = os.environ.get("SOG_WIKI_DIR", "wiki-cache")
UA = "SciOlyGuide/0.1 (educational study app; https://github.com/BAFOOD123/SciOlyGuide)"
titles = json.load(open(os.path.join(os.path.dirname(__file__), "titles.json")))
images = json.load(open(f"{W}/images.json"))
# Specimens sharing an article: keep only photos whose file name or caption matches.
FILTER = {
  "rock-crystal": r"rock.?crystal|clear|colou?rless|herkimer|quartz.?crystal|crystal.?cluster|prism|druse|brazil",
  "milky-quartz": r"milky|milk",
  "white-quartzite": r"white|quartzite",
  "satin-spar": r"satin",
  "garnet-schist": r"garnet",
  "mica-schist": r"mica|muscovite|biotite|schist",
  "fossil-limestone": r"fossil|crinoid|brachiopod|shell|coral|bioclast",
  "rock-salt": r"rock.?salt|halite",
  "halite": r"halite|crystal|cubic|salt",
  "quartzite": r"quartzite",
}
cands = {}
for sid, t in titles.items():
    imgs = images.get(t, [])
    if sid in FILTER:
        rx = re.compile(FILTER[sid], re.I)
        imgs = [i for i in imgs if rx.search(i["file"]) or rx.search(i["caption"])]
    cands[sid] = imgs[:8]
json.dump(cands, open(f"{W}/cands.json", "w"), indent=1, ensure_ascii=False)
print("no candidates:", [k for k, v in cands.items() if not v])
print("1 candidate:", [k for k, v in cands.items() if len(v) == 1])
# Download
n = 0
for sid, imgs in cands.items():
    os.makedirs(f"{W}/thumbs/{sid}", exist_ok=True)
    for i, im in enumerate(imgs):
        out = f"{W}/thumbs/{sid}/{i}.jpg"
        if os.path.exists(out) and os.path.getsize(out) > 2000: continue
        for k in range(4):
            r = subprocess.run(["curl", "-s", "-A", UA, "-w", "%{http_code}", "-o", out, im["thumb"]], capture_output=True, text=True)
            if r.stdout.strip() == "200": break
            time.sleep(5 * (k + 1))
        n += 1
        time.sleep(0.25)
print("downloaded", n)
# Contact sheets: 4 specimens per sheet, up to 8 thumbs each.
ids = list(cands)
TW, TH = 170, 128
os.makedirs(f"{W}/sheets", exist_ok=True)
for s in range(0, len(ids), 4):
    group = ids[s:s + 4]
    sheet = Image.new("RGB", (8 * TW, len(group) * (TH + 18)), "white")
    d = ImageDraw.Draw(sheet)
    for r, sid in enumerate(group):
        for i in range(len(cands[sid])):
            try:
                im = Image.open(f"{W}/thumbs/{sid}/{i}.jpg").convert("RGB")
            except Exception:
                continue
            im.thumbnail((TW - 4, TH - 4))
            sheet.paste(im, (i * TW + 2, r * (TH + 18) + 16))
            d.text((i * TW + 4, r * (TH + 18) + 2), f"{sid}:{i}", fill="black")
    sheet.save(f"{W}/sheets/sheet{s // 4:02d}.jpg", quality=80)
print("sheets", len(os.listdir(f"{W}/sheets")))
