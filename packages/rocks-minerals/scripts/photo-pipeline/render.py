"""Fetch rendered Wikipedia article HTML (index.php action=render), 1 req/sec."""
import json, os, subprocess, time, urllib.parse
W = os.environ.get("SOG_WIKI_DIR", "wiki-cache")
UA = "SciOlyGuide/0.1 (educational study app; https://github.com/BAFOOD123/SciOlyGuide)"
titles = json.load(open(os.path.join(os.path.dirname(__file__), "titles.json")))
os.makedirs(f"{W}/render", exist_ok=True)
for t in sorted(set(titles.values())):
    enc = urllib.parse.quote(t.replace(" ", "_"), safe="")
    out = f"{W}/render/{enc}.html"
    if os.path.exists(out) and os.path.getsize(out) > 1000: continue
    for k in range(6):
        r = subprocess.run(["curl", "-sL", "-A", UA, "-w", "%{http_code}", "-o", out, f"https://en.wikipedia.org/w/index.php?title={enc}&action=render"], capture_output=True, text=True)
        if r.stdout.strip() == "200": break
        print("retry", t, r.stdout.strip(), flush=True); time.sleep(10 * (k + 1))
    print("ok", t, os.path.getsize(out), flush=True)
    time.sleep(1)
