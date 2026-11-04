import html, json, os, re, urllib.parse
W = os.environ.get("SOG_WIKI_DIR", "wiki-cache")
titles = json.load(open(os.path.join(os.path.dirname(__file__), "titles.json")))
BAD = re.compile(r"map|locat|structure|diagram|chart|graph|logo|flag|portrait|mine\b|mining|quarry|build|church|temple|house|wall|landscape|aerial|satellite|microscop|thin.?section|photomicro|xpl|ppl|spectr|sem\b|tem\b|cross.?section|polymorph|ball.and.stick|unit.cell|lattice|phase|_vs_|cave|village|castle|monument|statue|bridge|road|street|sign|stamp|coin|ancient|museum_exterior|tomb|plant|factory|kiln|furnace|production|stockpile|truck|ship", re.I)
def clean(t):
    t = re.sub(r"<sup[^>]*>.*?</sup>", "", t, flags=re.S)
    t = re.sub(r"<span class=\"(?:IPA|rt-commentedText|nowrap)[^\"]*\"[^>]*>.*?</span>", "", t, flags=re.S)
    t = html.unescape(re.sub(r"<[^>]+>", "", t))
    t = re.sub(r"\[\d+\]|\[[a-z]\]|\[citation needed\]", "", t)
    t = re.sub(r"\(\s*[/ˈ][^)]*\)", "", t)  # IPA
    t = re.sub(r"\(\s*listen\s*\)", "", t)
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"\s+([,.;])", r"\1", t).replace("( ", "(").replace(" )", ")").replace("()", "")
    return t
out_ex, out_img = {}, {}
for t in sorted(set(titles.values())):
    enc = urllib.parse.quote(t.replace(" ", "_"), safe="")
    path = f"{W}/render/{enc}.html"
    if not os.path.exists(path): print("missing", t); continue
    h = open(path, encoding="utf-8", errors="replace").read()
    lead = re.split(r'<div class="mw-heading|<h2', h, maxsplit=1)[0]
    paras = [clean(p) for p in re.findall(r"<p[^>]*>(.*?)</p>", lead, flags=re.S)]
    paras = [p for p in paras if len(p) > 30]
    if sum(len(p) for p in paras) < 200:
        # Very short lead (e.g. one sentence): continue into the first section.
        body = re.split(r'<div class="mw-heading|<h2', h)
        if len(body) > 1:
            paras += [q for q in (clean(x) for x in re.findall(r"<p[^>]*>(.*?)</p>", body[1], flags=re.S)) if len(q) > 60][:1]
    ex = ""
    for p in paras:
        ex = (ex + " " + p).strip() if ex else p
        if len(ex) > 450: break
    out_ex[t] = ex
    imgs = []
    for m in re.finditer(r"<img [^>]*>", h):
        tag = m.group(0)
        res = re.search(r'resource="[^"]*/File:([^"]+)"', tag)
        if not res: continue
        fname = urllib.parse.unquote(res.group(1))
        if not re.search(r"\.(jpe?g)$", fname, re.I): continue
        w = int(re.search(r'data-file-width="(\d+)"', tag).group(1)); hh = int(re.search(r'data-file-height="(\d+)"', tag).group(1))
        if w < 400 or hh < 300: continue
        after = h[m.end(): m.end() + 2500]
        nxt = after.find("<img")
        seg = after[: nxt if nxt > 0 else 2500]
        cap = re.search(r'<figcaption[^>]*>(.*?)</figcaption>|class="gallerytext"[^>]*>(.*?)</div>|class="infobox-caption"[^>]*>(.*?)</div>', seg, flags=re.S)
        capg = next((g for g in cap.groups() if g), None) if cap else None
        alt = re.search(r'alt="([^"]*)"', tag)
        caption = clean(capg) if capg else (clean(alt.group(1)) if alt else "")
        if BAD.search(fname) or BAD.search(caption): continue
        thumb = None
        for u in re.findall(r"//thumb\.wikimedia\.org/[^\s\"]+", tag):
            if "/500px-" in u: thumb = "https:" + html.unescape(u)
        if not thumb:
            src = re.search(r'src="(//thumb\.wikimedia\.org/[^"]+)"', tag)
            if not src: continue
            thumb = re.sub(r"/\d+px-", "/500px-", "https:" + html.unescape(src.group(1)))
        if any(i["file"] == fname for i in imgs): continue
        imgs.append({"file": fname, "thumb": thumb, "w": w, "h": hh, "caption": caption[:200]})
    out_img[t] = imgs
json.dump(out_ex, open(f"{W}/extracts.json", "w"), indent=1, ensure_ascii=False)
json.dump(out_img, open(f"{W}/images.json", "w"), indent=1, ensure_ascii=False)
print("articles", len(out_img), "images", sum(len(v) for v in out_img.values()))
for t in ["Malachite", "Quartz", "Gypsum", "Schist", "Limestone"]:
    print(t, len(out_img.get(t, [])), "|", out_ex.get(t, "")[:160])
print("few images:", [t for t, v in out_img.items() if len(v) < 2])
