// Anatomy & Physiology "label the diagram" drill: unlabeled schematic SVGs with
// numbered markers the student names. Pure data + helpers, shared by app and demo.

export interface Marker {
  id: string;
  /** Position as a percentage of the image box (0–100). */
  x: number;
  y: number;
  label: string;
  aliases?: string[];
  hint: string;
}

export interface LabelSet {
  slug: string;
  title: string;
  system: string;
  /** Image file under the anatomy base, e.g. "respiratory.svg". */
  image: string;
  blurb: string;
  markers: Marker[];
}

export const LABEL_SETS: readonly LabelSet[] = [
  {
    slug: "respiratory",
    title: "Respiratory system",
    system: "Respiratory",
    image: "respiratory.svg",
    blurb: "Label the airway from the nose to the alveoli, plus the lungs and diaphragm.",
    markers: [
      { id: "nasal-cavity", x: 46, y: 9, label: "Nasal cavity", aliases: ["nose", "nasal passage"], hint: "Warms, moistens and filters incoming air." },
      { id: "larynx", x: 50, y: 26, label: "Larynx", aliases: ["voice box"], hint: "Holds the vocal cords; the epiglottis guards its opening." },
      { id: "trachea", x: 50, y: 37, label: "Trachea", aliases: ["windpipe"], hint: "C-shaped rings of cartilage keep this tube open." },
      { id: "bronchus", x: 41, y: 49, label: "Bronchus", aliases: ["primary bronchus", "main bronchus", "bronchi"], hint: "The trachea splits at the carina into these two tubes." },
      { id: "bronchiole", x: 33, y: 59, label: "Bronchiole", aliases: ["bronchioles"], hint: "Small airways with smooth muscle but no cartilage." },
      { id: "right-lung", x: 27, y: 68, label: "Right lung", aliases: ["right lung three lobes"], hint: "Has three lobes (the diagram's left side)." },
      { id: "left-lung", x: 73, y: 60, label: "Left lung", aliases: ["left lung two lobes"], hint: "Has two lobes and a cardiac notch." },
      { id: "alveoli", x: 75, y: 82, label: "Alveoli", aliases: ["alveolus", "air sacs"], hint: "Tiny air sacs where gas exchange happens." },
      { id: "diaphragm", x: 50, y: 92, label: "Diaphragm", hint: "The main breathing muscle; it contracts and flattens to inhale." },
    ],
  },
  {
    slug: "digestive",
    title: "Digestive system",
    system: "Digestive",
    image: "digestive.svg",
    blurb: "Label the alimentary canal and the accessory organs (liver, gallbladder, pancreas).",
    markers: [
      { id: "mouth", x: 47, y: 8, label: "Mouth", aliases: ["oral cavity"], hint: "Digestion begins here with chewing and salivary amylase." },
      { id: "esophagus", x: 49, y: 19, label: "Esophagus", aliases: ["oesophagus", "gullet"], hint: "Muscular tube that moves food down by peristalsis." },
      { id: "liver", x: 72, y: 33, label: "Liver", hint: "Makes bile and processes nutrients from the gut." },
      { id: "gallbladder", x: 59, y: 41, label: "Gallbladder", hint: "Stores and concentrates bile." },
      { id: "stomach", x: 34, y: 37, label: "Stomach", hint: "Churns food and secretes acid and pepsin." },
      { id: "pancreas", x: 55, y: 46, label: "Pancreas", hint: "Makes digestive enzymes and bicarbonate (and insulin)." },
      { id: "large-intestine", x: 23, y: 72, label: "Large intestine", aliases: ["colon"], hint: "Absorbs water and electrolytes and forms feces." },
      { id: "small-intestine", x: 46, y: 74, label: "Small intestine", hint: "Most digestion and absorption; lined with villi." },
      { id: "cecum", x: 76, y: 76, label: "Cecum", aliases: ["caecum", "appendix"], hint: "The pouch at the start of the large intestine; bears the appendix." },
      { id: "rectum", x: 48, y: 91, label: "Rectum", hint: "Stores feces before elimination." },
    ],
  },
];

export function labelSetBySlug(slug: string): LabelSet | undefined {
  return LABEL_SETS.find((s) => s.slug === slug);
}

export function anatomyImg(image: string): string {
  const base = (globalThis as { __SOG_ANATOMY_BASE?: string }).__SOG_ANATOMY_BASE ?? "/anatomy/";
  return base + image;
}

export function normalizeLabel(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\b(the|a|an|of|right|left|primary|main)\b/g, " ")
    .replace(/s\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchLabel(marker: Marker, guess: string): boolean {
  const g = normalizeLabel(guess);
  if (!g) return false;
  return [marker.label, ...(marker.aliases ?? [])].some((n) => {
    const w = normalizeLabel(n);
    return w === g || (g.length >= 4 && (w.includes(g) || g.includes(w)));
  });
}

// mulberry32 — a tiny deterministic RNG so choices are stable per seed.
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Four answer choices for a marker: the right label plus distractors from the same set. */
export function labelChoices(set: LabelSet, markerId: string, seed: number): string[] {
  const correct = set.markers.find((m) => m.id === markerId);
  if (!correct) return [];
  const others = set.markers.filter((m) => m.id !== markerId).map((m) => m.label);
  const r = rng(seed);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [others[i], others[j]] = [others[j]!, others[i]!];
  }
  const choices = [correct.label, ...others.slice(0, 3)];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [choices[i], choices[j]] = [choices[j]!, choices[i]!];
  }
  return choices;
}
