---
title: Boomilever
type: Build
summary: Build the lightest wooden cantilever that holds up to 15 kg at 40–45 cm from a wall. Score is load divided by mass.
---

## At a glance

| | |
|---|---|
| **Team** | Up to 2 |
| **Time** | About 10 minutes (6 minutes to set up and load) |
| **Type** | Build event: you bring one structure. No impound. |
| **Eye protection** | **B** (impact-rated, ANSI **Z87+** marking) |
| **Materials** | **Wood and adhesive only** |
| **Load** | Sand poured into a bucket, up to 15,000 g counted |
| **Score** | **(Load Supported + Bonus) ÷ Structure Mass** (grams). High score wins. |
| **Bonus** | +7,500 g if your structure touches the wall only above the **10 cm** line and holds the full 15 kg |
| **Tiebreakers** | 1) Lower mass, 2) closest Estimated Load Supported |

> [!NOTE]
> This guide summarizes the 2026–27 Division C rules. Read the official rules manual and check the clarifications on soinc.org before you build. Supervisors grade against those, not this page.

## How the event runs

1. **Check-in:** once you start, you can't leave, get help or touch your phone. You can't change the structure. The supervisor checks eye protection and the construction rules and takes your **Estimated Load Supported** (a tiebreaker).
2. **Weigh-in:** your structure is weighed to 0.01 g.
3. **Setup (6 minutes total):** you hang the structure on the **Mounting Bolt** and put the **Loading Block** on it. The chain and bucket hang from the block.
4. **Inspection:** before sand goes in, the supervisor checks contact zones, load position and that the block sits above the bolt's centerline.
5. **Loading:** you pour sand. You can steady the bucket only with the tips of the **Bucket Stabilizing Sticks**, never by lifting or pushing.
6. **Stop:** loading stops when the structure fails, anything else supports the load, or time runs out. The bucket, chain and sand are weighed together, to the gram.

## The testing setup

![Cantilever truss loaded at its tip](img:boom-cantilever)

**Testing Wall:** a vertical plywood face at least 40 cm wide × 30 cm tall. Markings:

- **Mounting Bolt hole** about 5 cm below the top, centered left to right.
- **Horizontal Contact Depth Lines** at 10, 15 and 20 cm below the bolt's center.
- **Vertical Contact Width Lines** 4 cm left and right of the bolt's center.

**Mounting Bolt Assembly:** a ¼″-20 × 60 mm furniture connector bolt (17 mm head, 20 mm unthreaded section). It sticks out with **3.0 ± 0.1 cm** of clearance between the wall and the inside of the bolt's head. You hook your structure over this bolt. You can buy the same bolt (Hillman, Everbilt, Midwest Fastener, in the "furniture parts" drawer) to build an identical test wall at home.

**Loading Assembly** (≤ 1,500 g): a 5 × 5 × ~2 cm wooden **Loading Block** with a ¼″ eyebolt through its center and a wing nut, a chain with an S-hook, and a 5-gallon bucket. The full assembly plus sand used is 15,100–15,200 g, but only 15,000 g counts.

## Construction rules

| Rule | Requirement |
|---|---|
| Materials | Only wood (no bark, plywood, particleboard, bamboo, paper, or painted, soaked or coated wood) bonded with adhesive (any glue: CA/super glue, wood glue, epoxy, hot melt). **No tape.** You may laminate wood yourself. |
| Piece sizes | No limits on cross-section |
| One piece | No loose, separate or detachable parts |
| Attachment | Rests on the Mounting Bolt; nothing else may hold it vertically |
| Load point | Supports only the **Loading Block**. The chain's centerline must be **40.0–45.0 cm** horizontally from the wall and within **2.5 cm** of the wall's centerline (left/right) |
| Height | Before loading, the **bottom of the Loading Block** must be **above** the horizontal plane through the bolt's centerline |
| Wall contact | Only on the wall face, **outside the two vertical lines** (more than 4 cm from center), not the wall's sides, top or bottom |
| Base option | Touches the wall only above the **15 cm** line (otherwise Tier 2) |
| Bonus option | Touches only above the **10 cm** line **and** holds the full 15 kg → +7,500 g |

**Tiers:** Tier 1 meets every rule. Tier 2 breaks any rule, and every Tier 2 team ranks below every Tier 1 team. A structure that can't be loaded, can't hold the Loading Assembly, or has no eye protection scores participation only.

## Scoring math

**Score = (Load Supported + Bonus) / Mass**

| Case | Load scored | Mass | Score |
|---|---|---|---|
| Holds 15 kg, 15 cm contact, 12 g | 15,000 | 12.0 | 1,250 |
| Holds 15 kg, 10 cm contact, 15 g | 22,500 | 15.0 | 1,500 |
| Holds 9 kg, 10 cm contact, 15 g | 9,000 (no bonus) | 15.0 | 600 |

Two lessons: **the bonus is worth 50% more score**, so build for it if your structure can still hold 15 kg. And **failing early is very costly**. Over-engineering by a gram or two is much safer than coming in light and breaking at 9 kg.

## The physics

### How a cantilever carries load

A boomilever is a cantilever: one end is fixed to the wall and the load hangs off the other. The load W creates a **moment** about the wall: M = W × L, where L ≈ 42.5 cm. The wall has to push back with an equal and opposite moment, and it does that with two forces:

- **Tension** at the top: the structure pulls outward on the bolt.
- **Compression** at the bottom: the structure presses into the wall at the contact point.

The simplest design has two main members:

- A **tension chord** from the bolt out to the tip.
- A **compression member** from the wall contact point up to the tip.

They meet at the tip, under the Loading Block.

### Worked force calculation

At 15 kg, W = 15 × 9.81 ≈ 147 N. Suppose the tension chord runs horizontally from the bolt, and the compression member runs from a wall point at depth d below the bolt to the tip at L = 42.5 cm.

The compression member's angle above horizontal is θ = arctan(d / L). At the tip, its vertical component must hold up the load:

- **C = W / sin θ** (compression force)
- **T = C cos θ = W × L / d** (tension force)

| Contact depth d | θ | Compression C | Tension T |
|---|---|---|---|
| 15 cm (base) | 19.4° | ≈ 443 N | ≈ 417 N |
| 10 cm (bonus) | 13.2° | ≈ 643 N | ≈ 625 N |

Moving the contact up from 15 to 10 cm raises member forces about 45–50%. So the bonus structure has to be heavier, but because the bonus adds 50% more scored load, a well-built bonus structure usually still wins. Always push the contact point as close as possible to its limit line: deeper is stronger.

### Tension members

Wood is very strong in tension along the grain. The tension chord is usually tiny, like a thin strip of balsa or basswood. The **joints** fail before the wood does, so:

- Give joints large glue surfaces (gussets, long overlaps).
- The bolt hook is the most stressed spot. A common solution is a hardwood or laminated block with a slot or hole that rests on the bolt, with the tension chords glued along it.

Stress = force / area. Balsa's tensile strength along the grain is roughly 7–20 MPa depending on density, so a 625 N load needs about 0.3–0.9 cm² cross-section **in the weakest piece**, but it's spread over two chords. Test your actual wood.

### Compression members and buckling

![Euler buckling with different end conditions](img:boom-buckling)

Long thin compression members don't crush; they **buckle** sideways. Euler's formula gives the critical load:

**P_cr = π² E I / (K L)²**

- E: stiffness of the wood (balsa ≈ 1–6 GPa depending on density; basswood ≈ 10 GPa).
- I: second moment of area. For a rectangle b × h, **I = b h³ / 12**, about the axis it bends around. For a hollow box, I is much larger for the same mass.
- L: unbraced length. K: end condition (1.0 for pinned ends, 0.5 for fixed).

The key insight is **P_cr ∝ 1/L²**. Halve the unbraced length with cross-bracing and the member holds **4× more**. That's why winning boomilevers have long, light compression members tied together with a lattice of tiny braces.

**Common compression designs:**

- **Two members (a "V")**: one from each side of the wall (both outside the 4 cm lines) up to the tip. They form a triangle in plan view that resists sideways buckling.
- **Braced pair:** the two compression members joined by Warren or X bracing so each brace point cuts the effective length.
- **Box or triangular truss:** stiffest, most work to build.

### Sideways (lateral) stability

The load must stay within 2.5 cm of the centerline, and any twist or sideways movement makes the structure buckle sideways. Spreading the compression feet wide on the wall (both just outside the 4 cm lines, or farther) and bracing between the left and right halves keeps it stable.

## Design process for beginners

1. **Pick the bonus geometry.** Contact just above the 10 cm line (like 9.5 cm, with a safety margin), load point at about 41 cm from the wall (inside 40–45 with margin), block bottom a little above the bolt line.
2. **Draw the design full size** on paper, from the top and side. Mark the 40/45 cm limits, the 10 cm line and the 4 cm width lines.
3. **Build a jig:** pin the drawing to a flat board (foam or cork) and build on it with pins and wax paper so every structure is identical.
4. **Pick the wood:** weigh and sort balsa by density. Use denser, stiffer pieces for compression members and light pieces for bracing. Many builders measure the stiffness of each stick.
5. **Build heavy first.** Your first structure should hold 15 kg easily. Then make each new structure lighter in one place only, and test.
6. **Build a test wall** to the exact rule dimensions, and test with sand or a bucket of water. Write down every result.

### Testing log

Record every test like this:

| # | Mass (g) | Contact depth | Load held (g) | Where it failed | Change made next time |
|---|---|---|---|---|---|
| 1 | 22.4 | 9.5 cm | 15,000+ | — | Thinner bracing |
| 2 | 18.1 | 9.5 cm | 12,300 | Left compression member buckled between brace 2 and 3 | Add a brace in that span |

Failure location tells you where to add mass. Places that never fail are places to cut mass.

## On competition day

- Bring **two or three structures** in a padded box (you can only test one, so pick the best). Bring spare eye protection.
- Know your structure's mass and a realistic **Estimated Load Supported**. For a structure you trust, say 15,000 g.
- During setup, check that the block is centered (±2.5 cm), the chain is at 40–45 cm, and nothing touches the wall inside the 4 cm lines or below the 10 cm line.
- Pour sand **slowly and steadily**. A swinging bucket adds dynamic load. Use the stabilizing sticks.
- Be ready to answer **design questions** on how it works and how it was built: supervisors can ask.

## Common pitfalls

- Touching the wall inside the 4 cm lines (Tier 2).
- The Loading Block sitting below the bolt's centerline before loading.
- The load point measured from the wrong spot: it's the **chain centerline**, horizontally from the wall face.
- Loose or detachable parts, or tape anywhere.
- Glue soaking the wood ("coated in glue" isn't allowed). Use small glue joints.
- Testing only once. Wood varies a lot, so you need data from many tests.

## Test yourself

<details><summary>1. Your structure weighs 14.2 g, earns the bonus and holds 15 kg. What's the score?</summary>

(15,000 + 7,500) / 14.2 ≈ 1,585.

</details>

<details><summary>2. If you add a brace at the middle of a pinned compression member, how much does its buckling load go up?</summary>

Unbraced length halves, so P_cr goes up 4×.

</details>

<details><summary>3. Which members are in tension and which are in compression?</summary>

The top chord from the bolt to the tip is in tension. The members from the lower wall contact up to the tip are in compression.

</details>

<details><summary>4. Why do forces go up when the wall contact moves from 15 cm to 10 cm deep?</summary>

The moment W × L is the same, but the lever arm d between the tension and compression reactions is shorter, so each force (≈ W L / d) is larger.

</details>

## Resources

- [Official event page and rules (soinc.org)](https://www.soinc.org/boomilever-c)
- [Scioly.org wiki: Boomilever](https://scioly.org/wiki/index.php/Boomilever)
- Scioly.org forums: Boomilever threads with designs, wood tips and test logs
- [Wikipedia: Euler's critical load](https://en.wikipedia.org/wiki/Euler%27s_critical_load)
