---
title: Engineering CAD
type: Hands-on
summary: Read engineering drawings and model parts and an assembly in Onshape. Graded on part volumes and the assembly's center of mass.
---

## At a glance

| | |
|---|---|
| **Team** | Up to 2 |
| **Time** | About 50 minutes |
| **Software** | **Onshape** (free education accounts at onshape.com/edu), one computer per person, with mice |
| **You bring** | A laptop that runs Onshape (each person), a mouse, a charger, writing utensils |
| **Not allowed** | Any resources except what the supervisor provides |
| **Provided** | A printed set of **engineering drawings** and a starting Onshape document containing an assembly with supplied parts |
| **Before the event** | Give the supervisor **two Onshape account email addresses** |
| **Parts to model** | 3–6 (Regional), 4–8 (State and National) |
| **Score** | Individual Part Scores + Individual Assembly Score. High score wins. |
| **Tiebreaker** | Lowest modeling time (from "Start assignment" to your last "Submit") |
| **Sponsor** | Onshape |

> [!NOTE]
> This guide summarizes the 2026–27 rules. Check the official manual and clarifications on soinc.org.

## How the event runs

You and your partner get a drawing packet (multiple views, dimensions, materials and units for each part) and an Onshape assignment. You model each part in Part Studios, give them the **exact names and materials** the drawings specify, then **assemble** them with the provided components and submit.

**Scoring:**

- **Each part:** IPS = 100 × (1 − |Δ_volume|), where Δ_volume = (your volume − correct volume) / correct volume. Minimum 0 per part. A part that's 2% off in volume earns 98.
- **Assembly:** IAS = 100 × (1 − |Δx|/3 − |Δy|/3 − |Δz|/3), where each Δ is the relative error in that component of the assembly's **center of mass (CoM)**. Minimum 0.

So the grader checks two numbers: **volume** (did you get the geometry right?) and **center of mass** (did you get the geometry, materials **and** positions right?). Details that don't change volume (fillet orientation, sketch style) don't matter, but every dimension that changes volume does.

> [!TIP]
> Because Δ is relative to the correct CoM, a CoM component near zero makes the score very sensitive. Getting the assembly origin and orientation right (as the drawing specifies) is essential.

## Reading engineering drawings

![Orthographic projection views](img:cad-ortho)

- **Orthographic views:** front, top and right side, aligned with each other. **Third-angle projection** (standard in the U.S.) places the top view **above** the front view and the right view **to the right**. First-angle projection (common in Europe) flips them. Check the projection symbol in the title block.
- **Isometric view:** a 3D picture for reference.
- **Section views** (A-A) show cut-away interiors, with hatching on cut surfaces. **Detail views** enlarge small features.
- **Line types:** visible (thick solid), **hidden** (dashed: features behind surfaces), **center lines** (long-short dash: axes of holes and symmetry), dimension and extension lines, cutting-plane lines.
- **Title block:** part name, material, units (mm vs inches!), scale, tolerances, projection angle.

**Dimensions and symbols:**

| Symbol | Meaning |
|---|---|
| ⌀ | Diameter |
| R | Radius |
| ⌴ | Counterbore (wider, flat-bottomed recess) |
| ⌵ | Countersink (cone-shaped recess) |
| ↧ | Depth |
| THRU | Through all |
| 4X | Feature repeated 4 times |
| ⌒, C | Chamfer (e.g., 2 × 45°) |
| TYP | Typical (applies to similar features) |
| ( ) | Reference dimension |

**Strategy:** before modeling, figure out the part's overall shape from all views, identify the **simplest base feature** (an extrude or revolve), and list the features to add (holes, pockets, fillets, patterns).

## Onshape essentials

![The Onshape interface](img:cad-onshape)

### Part Studios

1. **Sketch** on a plane or face: lines, rectangles, circles, arcs, slots. Use **constraints** (coincident, parallel, perpendicular, tangent, equal, horizontal/vertical, symmetric, midpoint) and **dimensions** until the sketch is fully defined (black lines; blue = under-defined).
2. **Features:**
   - **Extrude** (add or remove material; blind, through all, up to face, symmetric).
   - **Revolve** (turned parts like shafts and pulleys).
   - **Sweep** and **loft** (paths and transitions).
   - **Fillet** and **chamfer** (edges).
   - **Hole** (simple, counterbore, countersink, tapped; standard sizes).
   - **Shell** (hollow), **draft**, **rib**.
   - **Linear and circular pattern**, **mirror**.
   - **Boolean** (union, subtract, intersect between parts).
3. **Name the part** exactly as the drawing says, and **assign the material** (right-click → Assign material). Density affects the CoM, not volume.
4. **Check volume:** **Mass properties** (the scale icon at the bottom right) shows volume, mass and center of mass. Check units in the document settings.

> [!TIP]
> Use **Variables** (#name) for repeated dimensions, and type math directly into dimension fields (e.g., `50/2`, `25.4*1.5`). Onshape converts units if you type `in` or `mm`.

### Assemblies

- **Insert** your parts and the supplied components.
- **Fix** the base part (or ground it per the drawing's assembly reference).
- **Mates** connect **mate connectors** (points with orientation on faces, edges or vertices):
  - **Fastened** (no motion), **revolute** (rotation about one axis), **slider**, **cylindrical**, **planar**, **ball**, **parallel**, **tangent**.
  - Use **offsets** for gaps specified on the drawing.
- Check **Mass properties** for the **assembly's center of mass** and compare against any values you can sanity-check.
- If parts move, confirm the assembly is in the **position** the drawing shows (angles, slider positions). Use mate limits or fastened mates.

### Collaboration

Onshape is cloud-based, so you and your partner can work in the same document **simultaneously**. Split the work: each person takes half the parts in separate Part Studios (or the same studio), then one person assembles while the other double-checks dimensions. Don't edit the same feature at the same time.

## Accuracy checklist

- **Units:** inch vs millimeter is the most common, catastrophic error (volume off by 25.4³ ≈ 16,387×).
- **Every dimension:** re-check each one after modeling. A wrong hole diameter changes volume a little; a wrong overall length changes it a lot.
- **Hidden features:** dashed lines reveal pockets and holes you might miss.
- **Through vs blind** holes and their depths.
- **Symmetry:** if the drawing shows a centerline, model symmetrically about the origin.
- **Materials:** wrong material = wrong mass and wrong assembly CoM.
- **Part names:** must match exactly so the grader finds them.
- **Assembly position:** right orientation, origin, and mate offsets.
- **Submit early and often:** only your **last submission** is graded, and the clock for the tiebreaker stops at your last submit. Submit once everything is complete, then again after each improvement.

## Practice plan

1. **Weeks 1–2:** Onshape Learning Center (free) courses: "Introduction to CAD", "Part Design", "Assembly Design". Learn keyboard shortcuts (S for sketch, L line, R rectangle, C circle, D dimension, Shift-E extrude).
2. **Weeks 3–4:** model parts from engineering drawings in textbooks or online practice drawings (search "CAD practice drawings"). Time yourself.
3. **Weeks 5+:** full mock events with your partner: 4–8 parts plus an assembly in 50 minutes, then compare volumes and CoM against a reference model.
4. Practice **drawing reading** separately: given three views, sketch the isometric (and vice versa).

## On competition day

- Laptop fully charged, charger, a mouse (a 3-button mouse makes rotating and panning much faster).
- Log in to Onshape **before** the event and check your browser works (Chrome or Firefox, WebGL enabled).
- Read the whole drawing packet first (2–3 minutes), divide the parts, then start.
- Leave 10 minutes for the assembly and final checks.

## Common pitfalls

- Modeling in the wrong units or reading a dimension in the wrong unit.
- Missing a hidden pocket or through hole.
- Forgetting to assign materials.
- Leaving parts unconstrained in the assembly so they're in the wrong position.
- Not submitting, or making last-minute changes after the final submit (they aren't graded).

## Test yourself

<details><summary>1. Your part's volume is 10,450 mm³ and the correct value is 10,000 mm³. What's the IPS?</summary>

Δ = 0.045, so IPS = 100 × (1 − 0.045) = 95.5.

</details>

<details><summary>2. In third-angle projection, where is the top view relative to the front view?</summary>

Directly above it.

</details>

<details><summary>3. Does changing a part's material change its volume score?</summary>

No. Volume is purely geometric, but material changes the mass and therefore the assembly's center of mass.

</details>

<details><summary>4. What does "4X ⌀6 THRU" mean?</summary>

Four holes, each 6 units in diameter, going all the way through.

</details>

## Resources

- [Official event page and rules (soinc.org)](https://www.soinc.org/engineering-cad-c)
- [Onshape for Education](https://www.onshape.com/en/education/) and the free [Onshape Learning Center](https://learn.onshape.com/)
- [Scioly.org wiki: Engineering CAD](https://scioly.org/wiki/index.php/Engineering_CAD)
