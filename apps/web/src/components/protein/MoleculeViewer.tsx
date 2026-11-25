"use client";

import { useEffect, useRef, useState } from "react";
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
  SS_INFO,
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
  screenshot: () => string | null;
}

interface Props {
  design: ModelDesign;
  display: DisplayOptions;
  /** Highlight a residue range (dims the rest). */
  focus: { start: number; end: number } | null;
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

const RADIUS = 25; // Å — half the view: the fragment plus the receptor

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

function label(text: string, cls: string): CSS2DObject {
  const el = document.createElement("div");
  el.className = cls;
  el.textContent = text;
  return new CSS2DObject(el);
}

function cylinderBetween(a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(radius, radius, len, 8, 1);
  const mesh = new THREE.Mesh(geo, material);
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

const v3 = (p: Vec3) => new THREE.Vector3(p[0], p[1], p[2]);

export function MoleculeViewer({ design, display, focus, selected, measure, onPick, onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctx = useRef<{
    renderer: THREE.WebGLRenderer;
    labels: CSS2DRenderer;
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    controls: OrbitControls;
    content: THREE.Group;
    tube: THREE.Mesh | null;
    render: () => void;
  } | null>(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const [scale, setScale] = useState<{ px: number; cm: number } | null>(null);

  // ---- one-time setup ----
  useEffect(() => {
    const host = hostRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(BG);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    const labels = new CSS2DRenderer();
    labels.domElement.style.position = "absolute";
    labels.domElement.style.inset = "0";
    labels.domElement.style.pointerEvents = "none";
    host.appendChild(labels.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-RADIUS, RADIUS, RADIUS, -RADIUS, 0.1, 1000);
    camera.position.set(0, 0, 200);
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
      const pxPerA = (h / (camera.top - camera.bottom)) * camera.zoom;
      const pxPerCm = pxPerA / CM_PER_ANGSTROM;
      const cm = [1, 2, 5, 10, 20].find((c) => c * pxPerCm >= 50) ?? 20;
      setScale({ px: cm * pxPerCm, cm });
    };
    const render = () => {
      renderer.render(scene, camera);
      labels.render(scene, camera);
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

    // Click (not drag) picks the nearest residue on the backbone.
    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY });
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4) return;
      down = null;
      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc, camera);
      const targets: THREE.Object3D[] = [];
      content.traverse((o) => o.userData.pick && targets.push(o));
      const hit = ray.intersectObjects(targets, false)[0];
      if (!hit) return;
      let best = FIRST;
      let bestD = Infinity;
      for (const r of RESIDUES) {
        const d = v3(atomPos(r, "CA")!).distanceTo(hit.point);
        if (d < bestD) {
          bestD = d;
          best = r.n;
        }
      }
      pickRef.current(best);
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    ctx.current = { renderer, labels, scene, camera, controls, content, tube: null, render };

    const setView = (v: ViewName) => {
      const { pos, up } = VIEWS[v];
      camera.position.set(pos[0] * 200, pos[1] * 200, pos[2] * 200);
      camera.up.set(up[0], up[1], up[2]);
      controls.target.set(0, 0, 0);
      camera.lookAt(0, 0, 0);
      controls.update();
      render();
    };
    const fit = () => {
      camera.zoom = 1;
      camera.updateProjectionMatrix();
      controls.target.set(0, 0, 0);
      controls.update();
      updateScale();
      render();
    };
    onReady?.({
      setView,
      fit,
      screenshot: () => {
        render();
        return renderer.domElement.toDataURL("image/png");
      },
    });

    return () => {
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      controls.dispose();
      disposeGroup(content);
      renderer.dispose();
      host.removeChild(renderer.domElement);
      host.removeChild(labels.domElement);
      ctx.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- (re)build the model whenever what's shown changes ----
  useEffect(() => {
    const c = ctx.current;
    if (!c) return;
    disposeGroup(c.content);
    c.content.clear();

    const inFocus = (n: number) => !focus || (n >= focus.start && n <= focus.end);
    const dimColor = new THREE.Color(BG);

    // Backbone tube through the alpha carbons, at the model's real diameter.
    const cas = RESIDUES.map((r) => v3(atomPos(r, "CA")!));
    const curve = new THREE.CatmullRomCurve3(cas, false, "centripetal");
    const perRes = 10;
    const radial = 12;
    const tubular = (cas.length - 1) * perRes;
    const radiusA = design.backbone.diameterCm / 2 / CM_PER_ANGSTROM;
    const tubeGeo = new THREE.TubeGeometry(curve, tubular, radiusA, radial, false);
    const colors: number[] = [];
    for (let ring = 0; ring <= tubular; ring++) {
      const n = FIRST + Math.min(cas.length - 1, Math.round(ring / perRes));
      const col = residueColor(n, display.color, design);
      if (!inFocus(n)) col.lerp(dimColor, 0.82);
      for (let j = 0; j <= radial; j++) colors.push(col.r, col.g, col.b);
    }
    tubeGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const tube = new THREE.Mesh(tubeGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.05 }));
    tube.userData.pick = true;
    c.content.add(tube);
    c.tube = tube;

    // End caps so the termini read clearly.
    const capMat = new THREE.MeshStandardMaterial({ color: design.backbone.color, roughness: 0.6 });
    for (const p of [cas[0]!, cas[cas.length - 1]!]) {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(radiusA, 16, 12), capMat);
      cap.position.copy(p);
      c.content.add(cap);
    }

    // Side chains: property-colored ball on the alpha carbon (+ optional atoms).
    const chosen = shownSideChains(design);
    const ballR = radiusA * 1.35;
    for (const r of RESIDUES) {
      const isChosen = chosen.has(r.n);
      if (!isChosen && !display.allSideChains) continue;
      const prop = PROPERTY_INFO[aminoAcid(r.aa).property];
      const col = new THREE.Color(prop.hex);
      if (!inFocus(r.n)) col.lerp(dimColor, 0.82);
      const ca = v3(atomPos(r, "CA")!);
      const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.45, transparent: !isChosen, opacity: isChosen ? 1 : 0.55 });
      const ball = new THREE.Mesh(new THREE.SphereGeometry(isChosen ? ballR : ballR * 0.75, 20, 14), mat);
      ball.position.copy(ca);
      ball.userData.pick = true;
      c.content.add(ball);
      if (display.atoms && isChosen) addSideChainSticks(c.content, r.n, col);
    }

    // Selected residue ring.
    if (selected != null) {
      const ca = v3(atomPos(RESIDUES[selected - FIRST]!, "CA")!);
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(ballR * 1.6, 24, 16),
        new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.25, depthWrite: false }),
      );
      halo.position.copy(ca);
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
        const l = label("Sialic acid", "pm-label pm-label-receptor");
        l.position.copy(ctr).add(new THREE.Vector3(0, 2.5, 0));
        c.content.add(l);
      }
    }

    // Interactions: the student's chosen ones solid, the rest faint (optional).
    const chosenKeys = new Set(
      design.features.filter((f) => f.kind === "interaction").map((f) => `${f.interaction}:${[...f.residues].sort((a, b) => a - b).join("-")}`),
    );
    for (const it of interactions()) {
      const isChosen = chosenKeys.has(`${it.type}:${it.a}-${it.b}`);
      if (!isChosen && !display.allInteractions) continue;
      const ra = RESIDUES[it.a - FIRST]!;
      const rb = RESIDUES[it.b - FIRST]!;
      // On the physical model the side chains sit on the alpha carbons, so draw CA→CA;
      // with atoms showing, draw the actual atom→atom contact too.
      const a = v3(atomPos(ra, "CA")!);
      const b = v3(atomPos(rb, "CA")!);
      const col = INTERACTION_INFO[it.type].hex;
      c.content.add(dashedLine(a, b, col, isChosen ? 1 : 0.35));
      if (display.atoms && isChosen) {
        const pa = atomPos(ra, it.atomA);
        const pb = atomPos(rb, it.atomB);
        if (pa && pb) c.content.add(dashedLine(v3(pa), v3(pb), col));
      }
    }

    // Measurement between two picked residues.
    if (measure.length === 2) {
      const a = v3(atomPos(RESIDUES[measure[0]! - FIRST]!, "CA")!);
      const b = v3(atomPos(RESIDUES[measure[1]! - FIRST]!, "CA")!);
      c.content.add(dashedLine(a, b, "#ffffff"));
      const d = a.distanceTo(b);
      const l = label(`${(d * CM_PER_ANGSTROM).toFixed(1)} cm · ${d.toFixed(1)} Å`, "pm-label pm-label-measure");
      l.position.addVectors(a, b).multiplyScalar(0.5);
      c.content.add(l);
    }
    for (const n of measure) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(ballR * 1.2, 16, 12), new THREE.MeshBasicMaterial({ color: "#ffffff" }));
      m.position.copy(v3(atomPos(RESIDUES[n - FIRST]!, "CA")!));
      c.content.add(m);
    }

    // Labels: termini, every 10th residue, the selection and the shown side chains.
    if (display.labels) {
      const want = new Set<number>([FIRST, LAST]);
      for (let n = Math.ceil(FIRST / 10) * 10; n <= LAST; n += 10) want.add(n);
      chosen.forEach((n) => want.add(n));
      if (selected != null) want.add(selected);
      if (focus) {
        want.add(focus.start);
        want.add(focus.end);
      }
      for (const n of want) {
        if (focus && !inFocus(n) && n !== selected) continue;
        const text = n === FIRST ? `N · ${resLabel(n)}` : n === LAST ? `C · ${resLabel(n)}` : resLabel(n);
        const l = label(text, `pm-label${n === selected ? " pm-label-selected" : ""}`);
        l.position.copy(v3(atomPos(RESIDUES[n - FIRST]!, "CA")!)).add(new THREE.Vector3(0, ballR + 0.6, 0));
        c.content.add(l);
      }
    }

    // The 50 cm cube the model must fit in, at scale.
    if (display.box) {
      const side = MAX_MODEL_CM / CM_PER_ANGSTROM;
      const box = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(side, side, side)),
        new THREE.LineBasicMaterial({ color: "#64748b", transparent: true, opacity: 0.6 }),
      );
      c.content.add(box);
    }

    c.render();
  }, [design, display, focus, selected, measure]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl" style={{ background: BG }}>
      <div ref={hostRef} className="absolute inset-0" />
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
