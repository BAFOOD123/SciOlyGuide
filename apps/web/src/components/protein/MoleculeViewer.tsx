"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { STRUCTURE } from "@/lib/protein/structure.generated";
import {
  aminoAcid,
  atomPos,
  CM_PER_ANGSTROM,
  FIRST,
  INTERACTION_INFO,
  interactions,
  LAST,
  MAX_MODEL_CM,
  PROPERTY_INFO,
  RESIDUES,
  resLabel,
  resLabel3,
  SS_INFO,
  tooberCm,
  type Vec3,
} from "@/lib/protein/analysis";
import { shownSideChains, type ModelDesign } from "@/lib/protein/design";

export type ColorMode = "model" | "ss" | "property" | "rainbow";
export type ViewName = "front" | "back" | "left" | "right" | "top" | "bottom";

export interface DisplayOptions {
  color: ColorMode;
  /** Draw side-chain atoms (sticks) for the side chains on the model. */
  atoms: boolean;
  /** Show every side chain as a property-colored ball, not just the chosen ones. */
  allSideChains: boolean;
  receptor: boolean;
  /** Show every detected interaction faintly (chosen ones are always drawn). */
  allInteractions: boolean;
  labels: boolean;
  box: boolean;
}

export interface ViewerHandle {
  setView: (v: ViewName) => void;
  fit: () => void;
  /** PNG of the current view, labels included. */
  snapshot: () => Promise<Blob | null>;
}

interface Props {
  design: ModelDesign;
  display: DisplayOptions;
  /** Highlight a residue range (dims the rest, rotates around it). */
  focus: { start: number; end: number } | null;
  /** Build-along: draw the chain only up to this residue (the rest as a faint trace). */
  buildTo: number | null;
  /** How strongly to fade what's outside `focus` (0 = not at all, 1 = into the background). */
  focusDim?: number;
  selected: number | null;
  measure: number[];
  onPick: (n: number) => void;
  onReady?: (h: ViewerHandle) => void;
}

const ELEMENT_HEX: Record<string, string> = { N: "#3b82f6", O: "#ef4444", S: "#facc15" };
const BG = "#0b1020";
const VIEWS: Record<ViewName, { pos: Vec3; up: Vec3 }> = {
  // Front matches JUDE/Jmol's default orientation: x right, y up, looking down −z.
  front: { pos: [0, 0, 1], up: [0, 1, 0] },
  back: { pos: [0, 0, -1], up: [0, 1, 0] },
  right: { pos: [1, 0, 0], up: [0, 1, 0] },
  left: { pos: [-1, 0, 0], up: [0, 1, 0] },
  top: { pos: [0, 1, 0], up: [0, 0, -1] },
  bottom: { pos: [0, -1, 0], up: [0, 0, 1] },
};

const RADIUS = 22; // Å: half the shorter side of the view (the fragment plus the receptor)
const CAM_DIST = 200;

const v3 = (p: Vec3) => new THREE.Vector3(p[0], p[1], p[2]);
const caVec = (n: number) => v3(atomPos(RESIDUES[n - FIRST]!, "CA")!);

function rainbow(t: number): THREE.Color {
  return new THREE.Color().setHSL(0.66 * (1 - t), 0.85, 0.55);
}

function residueColor(n: number, mode: ColorMode, design: ModelDesign): THREE.Color {
  const r = RESIDUES[n - FIRST]!;
  switch (mode) {
    case "ss":
      return new THREE.Color(SS_INFO[r.ss].hex);
    case "property":
      return new THREE.Color(PROPERTY_INFO[aminoAcid(r.aa).property].hex);
    case "rainbow":
      return rainbow((n - FIRST) / (LAST - FIRST));
    default:
      if (design.backbone.accentSS && r.ss !== "L") return new THREE.Color(SS_INFO[r.ss].hex);
      return new THREE.Color(design.backbone.color);
  }
}

/** Lower number = more important; overlapping labels of lower importance are hidden. */
function label(text: string, cls: string, priority: number): CSS2DObject {
  const el = document.createElement("div");
  el.className = cls;
  el.textContent = text;
  el.dataset.p = String(priority);
  return new CSS2DObject(el);
}

function cylinderBetween(a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, len, 8, 1), material);
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

function dashedLine(a: THREE.Vector3, b: THREE.Vector3, color: string, opacity = 1): THREE.Line {
  const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
  const mat = new THREE.LineDashedMaterial({ color, dashSize: 0.45, gapSize: 0.3, transparent: opacity < 1, opacity });
  const line = new THREE.Line(geo, mat);
  line.computeLineDistances();
  return line;
}

/** Only what changes the 3D scene — so typing in a legend field doesn't rebuild it. */
function sceneKeyOf(design: ModelDesign): string {
  return JSON.stringify([design.backbone, design.features.map((f) => [f.kind, f.residues, f.interaction ?? "", f.color])]);
}

export function MoleculeViewer({ design, display, focus, buildTo, focusDim = 0.82, selected, measure, onPick, onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const ctx = useRef<{
    renderer: THREE.WebGLRenderer;
    labels: CSS2DRenderer;
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    controls: OrbitControls;
    content: THREE.Group;
    render: () => void;
    /** Residues that can be picked / hovered right now. */
    pickable: { max: number };
  } | null>(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const designRef = useRef(design);
  designRef.current = design;
  const sceneKey = useMemo(() => sceneKeyOf(design), [design]);
  const [scale, setScale] = useState<{ px: number; cm: number } | null>(null);
  const [webgl, setWebgl] = useState(true);

  // ---- one-time setup ----
  useEffect(() => {
    const host = hostRef.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    } catch {
      setWebgl(false);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(BG);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.setAttribute("aria-label", "3D model of residues 153 to 252. Drag to rotate, scroll to zoom.");
    renderer.domElement.setAttribute("role", "img");
    const labels = new CSS2DRenderer();
    labels.domElement.style.position = "absolute";
    labels.domElement.style.inset = "0";
    labels.domElement.style.pointerEvents = "none";
    host.appendChild(labels.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-RADIUS, RADIUS, RADIUS, -RADIUS, 0.1, 1000);
    camera.position.set(0, 0, CAM_DIST);
    scene.add(camera);
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(0.6, 0.8, 1);
    camera.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.6);
    fill.position.set(-1, -0.4, 0.5);
    camera.add(fill);

    const content = new THREE.Group();
    scene.add(content);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.zoomSpeed = 1.2;
    controls.minZoom = 0.3;
    controls.maxZoom = 12;

    const updateScale = () => {
      const h = renderer.domElement.clientHeight;
      if (!h) return;
      const pxPerCm = ((h / (camera.top - camera.bottom)) * camera.zoom) / CM_PER_ANGSTROM;
      const cm = [1, 2, 5, 10, 20].find((c) => c * pxPerCm >= 50) ?? 20;
      setScale({ px: cm * pxPerCm, cm });
    };

    // Hide labels that collide with more important ones.
    const declutter = () => {
      const els = [...labels.domElement.querySelectorAll<HTMLElement>(".pm-label")];
      els.sort((a, b) => Number(a.dataset.p) - Number(b.dataset.p));
      const kept: DOMRect[] = [];
      for (const el of els) {
        el.style.visibility = "";
        if (el.style.display === "none") continue;
        const r = el.getBoundingClientRect();
        const hit = kept.some((k) => r.left < k.right + 2 && r.right > k.left - 2 && r.top < k.bottom + 1 && r.bottom > k.top - 1);
        if (hit) el.style.visibility = "hidden";
        else kept.push(r);
      }
    };
    const render = () => {
      renderer.render(scene, camera);
      labels.render(scene, camera);
      declutter();
    };
    controls.addEventListener("change", () => {
      updateScale();
      render();
    });

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      labels.setSize(w, h);
      // Fit RADIUS to the shorter side so the model fills phones and wide screens alike.
      const aspect = w / h;
      const halfH = aspect >= 1 ? RADIUS : RADIUS / aspect;
      camera.left = -halfH * aspect;
      camera.right = halfH * aspect;
      camera.top = halfH;
      camera.bottom = -halfH;
      camera.updateProjectionMatrix();
      updateScale();
      render();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const pickable = { max: LAST };
    const residueAt = (clientX: number, clientY: number): number | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc, camera);
      const targets: THREE.Object3D[] = [];
      content.traverse((o) => o.userData.pick && targets.push(o));
      const hit = ray.intersectObjects(targets, false)[0];
      if (!hit) return null;
      let best: number | null = null;
      let bestD = Infinity;
      for (let n = FIRST; n <= pickable.max; n++) {
        const d = caVec(n).distanceTo(hit.point);
        if (d < bestD) {
          bestD = d;
          best = n;
        }
      }
      return best;
    };

    // Click (not drag) picks the nearest residue; hovering shows which residue is under the pointer.
    let down: { x: number; y: number } | null = null;
    let hoverFrame = 0;
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY };
      if (tipRef.current) tipRef.current.hidden = true;
    };
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      down = null;
      const n = residueAt(e.clientX, e.clientY);
      if (n != null) pickRef.current(n);
    };
    const onMove = (e: PointerEvent) => {
      if (e.buttons || e.pointerType === "touch") return;
      cancelAnimationFrame(hoverFrame);
      hoverFrame = requestAnimationFrame(() => {
        const tip = tipRef.current;
        if (!tip) return;
        const n = residueAt(e.clientX, e.clientY);
        if (n == null) {
          tip.hidden = true;
          renderer.domElement.style.cursor = "";
          return;
        }
        const r = RESIDUES[n - FIRST]!;
        const rect = host.getBoundingClientRect();
        tip.textContent = `${resLabel3(n)} · ${SS_INFO[r.ss].label} · ${tooberCm(n)} cm`;
        tip.style.left = `${e.clientX - rect.left + 12}px`;
        tip.style.top = `${e.clientY - rect.top + 12}px`;
        tip.hidden = false;
        renderer.domElement.style.cursor = "pointer";
      });
    };
    const onLeave = () => {
      if (tipRef.current) tipRef.current.hidden = true;
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerleave", onLeave);

    ctx.current = { renderer, labels, scene, camera, controls, content, render, pickable };

    const setView = (v: ViewName) => {
      const { pos, up } = VIEWS[v];
      const t = controls.target;
      camera.position.set(t.x + pos[0] * CAM_DIST, t.y + pos[1] * CAM_DIST, t.z + pos[2] * CAM_DIST);
      camera.up.set(up[0], up[1], up[2]);
      camera.lookAt(t);
      controls.update();
      render();
    };
    const fit = () => {
      camera.zoom = 1;
      camera.updateProjectionMatrix();
      controls.update();
      updateScale();
      render();
    };
    const snapshot = async (): Promise<Blob | null> => {
      render();
      const src = renderer.domElement;
      const out = document.createElement("canvas");
      out.width = src.width;
      out.height = src.height;
      const g = out.getContext("2d");
      if (!g) return null;
      g.drawImage(src, 0, 0);
      // Paint the visible labels on top (they are HTML, not part of the WebGL image).
      const ratio = src.width / src.clientWidth;
      const base = src.getBoundingClientRect();
      for (const el of labels.domElement.querySelectorAll<HTMLElement>(".pm-label")) {
        if (el.style.display === "none" || el.style.visibility === "hidden") continue;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        g.fillStyle = cs.backgroundColor;
        g.fillRect((r.left - base.left) * ratio, (r.top - base.top) * ratio, r.width * ratio, r.height * ratio);
        g.fillStyle = cs.color;
        g.font = `${cs.fontWeight} ${parseFloat(cs.fontSize) * ratio}px ${cs.fontFamily}`;
        g.textBaseline = "middle";
        g.fillText(el.textContent ?? "", (r.left - base.left + parseFloat(cs.paddingLeft)) * ratio, (r.top - base.top + r.height / 2) * ratio);
      }
      return new Promise((res) => out.toBlob((b) => res(b), "image/png"));
    };
    onReady?.({ setView, fit, snapshot });

    return () => {
      ro.disconnect();
      cancelAnimationFrame(hoverFrame);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      controls.dispose();
      disposeGroup(content);
      renderer.dispose();
      host.removeChild(renderer.domElement);
      host.removeChild(labels.domElement);
      ctx.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- rotate around the focused part (or the whole model) ----
  const focusKey = focus ? `${focus.start}-${focus.end}` : "";
  useEffect(() => {
    const c = ctx.current;
    if (!c) return;
    const target = new THREE.Vector3();
    if (focus) {
      for (let n = focus.start; n <= focus.end; n++) target.add(caVec(n));
      target.multiplyScalar(1 / (focus.end - focus.start + 1));
    }
    const delta = new THREE.Vector3().subVectors(target, c.controls.target);
    c.controls.target.copy(target);
    c.camera.position.add(delta);
    c.controls.update();
    c.render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey]);

  // ---- (re)build the model whenever what's shown changes ----
  const measureKey = measure.join(",");
  useEffect(() => {
    const c = ctx.current;
    if (!c) return;
    const design = designRef.current;
    disposeGroup(c.content);
    c.content.clear();

    const last = buildTo != null ? Math.max(FIRST, Math.min(LAST, buildTo)) : LAST;
    c.pickable.max = last;
    const built = (n: number) => n <= last;
    const inFocus = (n: number) => !focus || (n >= focus.start && n <= focus.end);
    const dimColor = new THREE.Color(BG);
    const radiusA = design.backbone.diameterCm / 2 / CM_PER_ANGSTROM;

    // Backbone tube through the alpha carbons (built part), at the model's real diameter.
    const cas = RESIDUES.filter((r) => built(r.n)).map((r) => v3(atomPos(r, "CA")!));
    if (cas.length >= 2) {
      const curve = new THREE.CatmullRomCurve3(cas, false, "centripetal");
      const perRes = 10;
      const radial = 12;
      const tubular = (cas.length - 1) * perRes;
      const tubeGeo = new THREE.TubeGeometry(curve, tubular, radiusA, radial, false);
      const colors: number[] = [];
      for (let ring = 0; ring <= tubular; ring++) {
        const n = FIRST + Math.min(cas.length - 1, Math.round(ring / perRes));
        const col = residueColor(n, display.color, design);
        if (!inFocus(n)) col.lerp(dimColor, focusDim);
        for (let j = 0; j <= radial; j++) colors.push(col.r, col.g, col.b);
      }
      tubeGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      const tube = new THREE.Mesh(tubeGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.05 }));
      tube.userData.pick = true;
      c.content.add(tube);
    }
    // End caps so the termini read clearly.
    const capMat = new THREE.MeshStandardMaterial({ color: design.backbone.color, roughness: 0.6 });
    for (const p of cas.length ? [cas[0]!, cas[cas.length - 1]!] : []) {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(radiusA, 16, 12), capMat);
      cap.position.copy(p);
      cap.userData.pick = true;
      c.content.add(cap);
    }
    // Build-along: the part not folded yet, as a faint thin trace.
    if (last < LAST) {
      const rest = RESIDUES.filter((r) => r.n >= last).map((r) => v3(atomPos(r, "CA")!));
      const geo = new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(rest, false, "centripetal").getPoints(rest.length * 6));
      c.content.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: "#94a3b8", transparent: true, opacity: 0.22 })));
    }

    // Side chains: property-colored ball on the alpha carbon (+ optional atoms).
    const chosen = shownSideChains(design);
    const ballR = radiusA * 1.35;
    for (const r of RESIDUES) {
      if (!built(r.n)) continue;
      const isChosen = chosen.has(r.n);
      if (!isChosen && !display.allSideChains) continue;
      const col = new THREE.Color(PROPERTY_INFO[aminoAcid(r.aa).property].hex);
      if (!inFocus(r.n)) col.lerp(dimColor, focusDim);
      const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.45, transparent: !isChosen, opacity: isChosen ? 1 : 0.55 });
      const ball = new THREE.Mesh(new THREE.SphereGeometry(isChosen ? ballR : ballR * 0.75, 20, 14), mat);
      ball.position.copy(caVec(r.n));
      ball.userData.pick = true;
      c.content.add(ball);
      if (display.atoms && isChosen) addSideChainSticks(c.content, r.n, col);
    }

    // Selected residue halo.
    if (selected != null && built(selected)) {
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(ballR * 1.6, 24, 16),
        new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.28, depthWrite: false }),
      );
      halo.position.copy(caVec(selected));
      c.content.add(halo);
      if (display.atoms && !chosen.has(selected)) addSideChainSticks(c.content, selected, new THREE.Color("#cbd5e1"));
    }

    // The receptor (LSTc glycan; sialic acid emphasized).
    if (display.receptor) {
      const rec = design.features.find((f) => f.kind === "receptor");
      const base = new THREE.Color(rec?.color ?? "#d946ef");
      const lig = STRUCTURE.ligand;
      const pts = lig.atoms.map((a) => new THREE.Vector3(a[2], a[3], a[4]));
      const atomColor = (i: number) => {
        const a = lig.atoms[i]!;
        if (a[1] !== "C") return new THREE.Color(ELEMENT_HEX[a[1]] ?? "#ffffff");
        return a[5] === "SIA" ? base.clone() : base.clone().lerp(new THREE.Color("#ffffff"), 0.45);
      };
      for (const [i, j] of lig.bonds) {
        const mid = new THREE.Vector3().addVectors(pts[i]!, pts[j]!).multiplyScalar(0.5);
        c.content.add(cylinderBetween(pts[i]!, mid, 0.22, new THREE.MeshStandardMaterial({ color: atomColor(i) })));
        c.content.add(cylinderBetween(mid, pts[j]!, 0.22, new THREE.MeshStandardMaterial({ color: atomColor(j) })));
      }
      pts.forEach((p, i) => {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8), new THREE.MeshStandardMaterial({ color: atomColor(i) }));
        s.position.copy(p);
        c.content.add(s);
      });
      if (display.labels) {
        const sia = lig.atoms.filter((a) => a[5] === "SIA");
        const ctr = sia.reduce((acc, a) => acc.add(new THREE.Vector3(a[2], a[3], a[4])), new THREE.Vector3()).multiplyScalar(1 / Math.max(1, sia.length));
        const l = label("Sialic acid", "pm-label pm-label-receptor", 1);
        l.position.copy(ctr).add(new THREE.Vector3(0, 2.5, 0));
        c.content.add(l);
      }
    }

    // Interactions: the student's chosen ones solid, the rest faint (optional).
    const chosenKeys = new Set(
      design.features.filter((f) => f.kind === "interaction").map((f) => `${f.interaction}:${[...f.residues].sort((a, b) => a - b).join("-")}`),
    );
    for (const it of interactions()) {
      if (!built(it.b)) continue;
      const isChosen = chosenKeys.has(`${it.type}:${it.a}-${it.b}`);
      if (!isChosen && !display.allInteractions) continue;
      // On the physical model the side chains sit on the alpha carbons, so draw CA→CA;
      // with atoms showing, draw the actual atom→atom contact too.
      const col = INTERACTION_INFO[it.type].hex;
      c.content.add(dashedLine(caVec(it.a), caVec(it.b), col, isChosen ? 1 : 0.35));
      if (display.atoms && isChosen) {
        const pa = atomPos(RESIDUES[it.a - FIRST]!, it.atomA);
        const pb = atomPos(RESIDUES[it.b - FIRST]!, it.atomB);
        if (pa && pb) c.content.add(dashedLine(v3(pa), v3(pb), col));
      }
    }

    // Measurement between two residues.
    if (measure.length === 2) {
      const a = caVec(measure[0]!);
      const b = caVec(measure[1]!);
      c.content.add(dashedLine(a, b, "#ffffff"));
      const d = a.distanceTo(b);
      const l = label(`${(d * CM_PER_ANGSTROM).toFixed(1)} cm`, "pm-label pm-label-measure", 0);
      l.position.addVectors(a, b).multiplyScalar(0.5);
      c.content.add(l);
    }
    for (const n of measure) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(ballR * 1.2, 16, 12), new THREE.MeshBasicMaterial({ color: "#ffffff" }));
      m.position.copy(caVec(n));
      c.content.add(m);
    }

    // Labels: the selection and measured residues first, then termini, side chains, every 10th.
    if (display.labels) {
      const want = new Map<number, number>();
      const add = (n: number, p: number) => built(n) && want.set(n, Math.min(p, want.get(n) ?? 9));
      for (let n = Math.ceil(FIRST / 10) * 10; n <= LAST; n += 10) add(n, 4);
      chosen.forEach((n) => add(n, 3));
      if (focus) {
        add(focus.start, 2);
        add(focus.end, 2);
      }
      add(FIRST, 1);
      add(last, 1);
      measure.forEach((n) => add(n, 0));
      if (selected != null) add(selected, 0);
      for (const [n, p] of want) {
        if (focus && !inFocus(n) && p > 1) continue;
        const text = n === FIRST ? `N · ${resLabel(n)}` : n === LAST ? `C · ${resLabel(n)}` : resLabel(n);
        const l = label(text, `pm-label${n === selected ? " pm-label-selected" : ""}`, p);
        l.position.copy(caVec(n)).add(new THREE.Vector3(0, ballR + 0.6, 0));
        c.content.add(l);
      }
    }

    // The 50 cm cube the model must fit in, at scale.
    if (display.box) {
      const side = MAX_MODEL_CM / CM_PER_ANGSTROM;
      c.content.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(side, side, side)),
          new THREE.LineBasicMaterial({ color: "#64748b", transparent: true, opacity: 0.6 }),
        ),
      );
    }

    c.render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneKey, display, focusKey, focusDim, buildTo, selected, measureKey]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl" style={{ background: BG }}>
      <div ref={hostRef} className="absolute inset-0" />
      <div ref={tipRef} hidden className="pointer-events-none absolute z-10 rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-900 shadow" />
      {!webgl && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-slate-300">
          This browser can’t show 3D graphics (WebGL is off). Everything else on the page still works.
        </div>
      )}
      {scale && (
        <div className="pointer-events-none absolute bottom-3 left-3 text-[11px] font-medium text-slate-300">
          <div className="h-1.5 border-x-2 border-b-2 border-slate-300" style={{ width: scale.px }} />
          <div className="mt-0.5">{scale.cm} cm on your model</div>
        </div>
      )}
    </div>
  );
}

function addSideChainSticks(group: THREE.Group, n: number, carbon: THREE.Color) {
  const r = RESIDUES[n - FIRST]!;
  const keep = (name: string) => !["N", "C", "O", "OXT"].includes(name);
  const pts = r.atoms.map((a) => new THREE.Vector3(a[2], a[3], a[4]));
  const color = (i: number) => {
    const el = r.atoms[i]![1];
    return el === "C" ? carbon : new THREE.Color(ELEMENT_HEX[el] ?? "#ffffff");
  };
  for (const [i, j] of r.bonds) {
    if (!keep(r.atoms[i]![0]) || !keep(r.atoms[j]![0])) continue;
    const mid = new THREE.Vector3().addVectors(pts[i]!, pts[j]!).multiplyScalar(0.5);
    group.add(cylinderBetween(pts[i]!, mid, 0.2, new THREE.MeshStandardMaterial({ color: color(i) })));
    group.add(cylinderBetween(mid, pts[j]!, 0.2, new THREE.MeshStandardMaterial({ color: color(j) })));
  }
  r.atoms.forEach((a, i) => {
    if (!keep(a[0]) || a[0] === "CA") return;
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), new THREE.MeshStandardMaterial({ color: color(i) }));
    s.position.copy(pts[i]!);
    group.add(s);
  });
}

function disposeGroup(g: THREE.Object3D) {
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose?.();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
    else mat?.dispose?.();
    if (o instanceof CSS2DObject) o.element.remove();
  });
}
