import hashlib, html, json, os, re, subprocess, time, urllib.parse
from PIL import Image, ImageDraw
W = os.environ.get("SOG_WIKI_DIR", "wiki-cache")
UA = "SciOlyGuide/0.1 (educational study app; https://github.com/BAFOOD123/SciOlyGuide)"
Q = {"alabaster2": "alabaster mineral", "alabaster3": "gypsum alabaster", "rhyolite2": "rhyolite", "rhyolite3": "rhyolite specimen", "syenite2": "syenite", "syenite3": "nepheline syenite"}
def thumb_url(name):
    n = name.replace(" ", "_")
    h = hashlib.md5(n.encode()).hexdigest()
    q = urllib.parse.quote(n)
    return f"https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/500px-{q}"
def curl(url, out):
    r = subprocess.run(["curl", "-sL", "-A", UA, "-w", "%{http_code}", "-o", out, url], capture_output=True, text=True)
    return r.stdout.strip()
os.makedirs(f"{W}/csearch", exist_ok=True)
found = {}
for sid, q in Q.items():
    out = f"{W}/csearch/{sid}.html"
    if not os.path.exists(out):
        curl("https://commons.wikimedia.org/w/index.php?" + urllib.parse.urlencode({"search": q, "title": "Special:MediaSearch", "type": "image"}), out)
        time.sleep(1)
    h = open(out, encoding="utf-8", errors="replace").read()
    names = []
    for m in re.findall(r'File:([^"&<>]+?\.(?:jpe?g|JPE?G))', h):
        nm = html.unescape(urllib.parse.unquote(m)).replace("_", " ")
        if nm not in names and not re.search(r"map|diagram|thin.?section|micro", nm, re.I): names.append(nm)
    found[sid] = names[:8]
json.dump(found, open(f"{W}/search_found2.json", "w"), indent=1)
# Download candidate thumbs (500px) from thumb host (same files as upload host path).
for sid, names in found.items():
    os.makedirs(f"{W}/sthumbs/{sid}", exist_ok=True)
    for i, nm in enumerate(names):
        out = f"{W}/sthumbs/{sid}/{i}.jpg"
        if os.path.exists(out) and os.path.getsize(out) > 2000: continue
        url = thumb_url(nm).replace("upload.wikimedia.org", "thumb.wikimedia.org")
        code = curl(url, out)
        if code != "200":
            if os.path.exists(out): os.remove(out)
        time.sleep(0.25)
ids = list(found)
TW, TH = 170, 128
os.makedirs(f"{W}/ssheets2", exist_ok=True)
for s in range(0, len(ids), 4):
    group = ids[s:s + 4]
    sheet = Image.new("RGB", (8 * TW, len(group) * (TH + 18)), "white")
    d = ImageDraw.Draw(sheet)
    for r, sid in enumerate(group):
        for i in range(len(found[sid])):
            p = f"{W}/sthumbs/{sid}/{i}.jpg"
            if not os.path.exists(p): continue
            try: im = Image.open(p).convert("RGB")
            except Exception: continue
            im.thumbnail((TW - 4, TH - 4))
            sheet.paste(im, (i * TW + 2, r * (TH + 18) + 16))
            d.text((i * TW + 4, r * (TH + 18) + 2), f"{sid}:s{i}", fill="black")
    sheet.save(f"{W}/ssheets2/t{s // 4:02d}.jpg", quality=80)
print({k: len(v) for k, v in found.items()})
print("sheets", len(os.listdir(f"{W}/ssheets2")))
