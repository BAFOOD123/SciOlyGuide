---
title: Hovercraft
type: Build
summary: Build an air-cushion vehicle that carries up to about 1 kg of nickels down a 185 cm track in a target time.
---

## At a glance

| | |
|---|---|
| **Team** | Up to 2 |
| **Time** | About 10 minutes; **8 minutes** of competition time for **2 runs** (no practice runs) |
| **Type** | Build, **impounded** (vehicle, spare parts, any notes; batteries stored separately) |
| **Eye protection** | **B** (impact-rated Z87+) during setup and operation |
| **Size** | Fits in a **40 × 40 × 40 cm** box when levitated |
| **Electrical parts allowed** | Batteries, wires, mechanical switches, relays, resistors (including potentiometers and rheostats), capacitors, **up to two motors**. **No integrated circuits** (except those built into a commercial motor). No lasers. |
| **Batteries** | Commercial, original labels, **no lithium or lead**, **≤ 12.0 V** between any two points |
| **Target Time** | 6.0–26.0 s (1.0 s steps regional, 0.5 s state/national); the same for all teams |
| **Score** | **High score wins.** Best of 2 runs; max 100 = Distance 40 + Time 40 + Mass 20 |
| **Bring** | Tools (not impounded, no lasers) and two Class III calculators |

> [!NOTE]
> This guide summarizes the 2026–27 rules. Check the official manual, Building Policy and track diagrams on soinc.org.

## The task

Put your hovercraft behind the start line on a walled track 45 cm wide. The supervisor holds it with a wood block while you turn on the motors. After your countdown ("3, 2, 1, launch"), the block is removed and the vehicle glides **185.0 cm** from the start line to the finish line. Timing runs from when the **front dowel** crosses the start line until it crosses the finish line.

![A hovercraft on its air cushion](img:hover-diagram)

**The track:** 45.0 ± 0.5 cm wide, at least 240 cm long, with side rails at least 30 mm tall, on a smooth hard floor or countertop. There's a cushioned barrier at least 5 cm past the finish. Photogates are recommended, with beams at **17 ± 2 cm** height, so your dowel is what trips them.

**Optional ramp:** 5 cm tall, 41 cm long, exiting 4 cm behind the start line. Using it **halves your Distance Score and zeroes your Mass Score** for that run. It's a last resort.

## Construction rules

- **Levitation:** the vehicle must ride on a cushion of air. The supervisor may push it down to check that it rises back. It may touch the track surface and the **inside** of the rails, but **not the top or outside** of the rails.
- **All thrust and lift come from air pressure.** Non-electric energy (e.g., a wind-up timer) may power other functions.
- **Dowel:** a wooden dowel ¼″ or larger, mounted vertically **within 3.0 cm of the front edge**, with its top **≥ 20.0 cm** above the track when levitated. It must be the first part to break a timing beam.
- **Safety (fail any and you get participation points only):**
  - Every propeller and impeller, including under the vehicle, must be **shielded** so a 3/8″ dowel can't touch it.
  - Commercial batteries, original labels, no lithium or lead, ≤ 12.0 V across any two points.
  - Every motor has an accessible, **manually operated mechanical switch** (no starting by plugging in batteries or twisting wires).
- **No ICs** means no microcontrollers, motor speed controllers with chips, or timers with chips. You control speed with resistors, potentiometers, gearing, prop choice and mechanical switches or relays.

## Scoring

**Run Score = DS + TS + MS**

| Part | Complete run | Incomplete run |
|---|---|---|
| **Distance (DS)** | 40 | 40 × (185 − distance from finish) / 185 |
| **Time (TS)** | 40 × (1 − \|Runtime − TT\| / TT), minimum 0 | 0 |
| **Mass (MS)** | (4R + 0.1N), max 20 | (4R + 0.1N) × (185 − distance from finish) / 185 |
| Ramp used | DS × 0.5 | MS = 0 |

- **R** = number of nickel rolls (the half roll counts as 0.5), **N** = loose nickels.
- Supervisor provides **4 full rolls (40 nickels, ~200 g each), 1 half roll (20 nickels, ~100 g) and 20 loose nickels (~5 g each)**. All of it gives 4(4.5) + 0.1(20) = **20**, the max: about **1 kg**.
- No tape or adhesive on the nickels, and you can't open the rolls. If your vehicle needs those to carry them, you can't carry mass.
- An **incomplete run:** the vehicle stops for 3 seconds before the finish, or takes longer than **2 × TT**.
- If the dowel doesn't cross the start line within 3 s of launch, it isn't a run.
- **Multipliers:** ×0.8 per construction violation (including anything falling off), ×0.9 per competition violation, ×0.7 for missing impound. **Touching or interfering** during a run → that run scores 0.
- **Tiebreakers:** best Time Score, fewest construction violations, best Mass Score, second-best run score.

> [!TIP]
> Worked example: TT = 15.0 s, runtime 15.8 s, all nickels carried, complete run. DS = 40, TS = 40 × (1 − 0.8/15) = 37.87, MS = 20. Score = **97.87**.

**Strategy:** design to carry **all the nickels** (20 points) and complete every run (40 points). Then the competition is entirely about **time accuracy**: each 1% time error costs 0.4 points.

## Hovercraft physics

### Lift

![Hovercraft lift: plenum chamber and skirt](img:hover-lift)

A **lift fan** blows air into a **plenum** (the space under the hull), sealed around the edge by a **skirt**. Pressure builds until it can hold up the vehicle's weight, then air escapes under the skirt's edge, making a thin cushion.

**Cushion pressure:** P = W / A (weight / footprint area).

> [!TIP]
> Example: a 1.5 kg vehicle (with nickels) on a 35 × 35 cm footprint. W = 1.5 × 9.81 = 14.7 N, A = 0.1225 m², P = 120 Pa, only about 0.12% of atmospheric pressure. A small fan can supply it, as long as the skirt doesn't leak too much.

- **A larger footprint** means lower pressure for the same weight (easier lift). Use most of the 40 × 40 cm limit, with the width under 45 cm so it fits between the rails.
- **Skirt types:** a **bag skirt** (inflated tube around the edge), a **plenum skirt** (flexible curtain), or a **"momentum curtain"**. For Science Olympiad, a simple sheet of plastic (trash bag, ripstop nylon, or a commercial hovercraft skirt material) around a foam or foamboard hull works well. Holes in a bag skirt let air out under the hull evenly.
- **Even weight distribution** is critical: the center of mass should be at the center of the cushion, or the craft will tilt, drag on one side and turn.

### Thrust and speed

- Thrust comes from a **propeller** or ducted fan pushing air backward (Newton's third law).
- Your speed is **low**: 185 cm in 6–26 s means about **7–31 cm/s**. The vehicle accelerates from rest, so it has to balance thrust against drag (air resistance, skirt and rail friction) to reach a steady speed quickly.
- With almost no friction, any steady thrust keeps it **accelerating**, so a hovercraft with constant thrust can be hard to control. Ways to set speed:
  - **Low thrust** set by a **potentiometer or resistor** in series with the thrust motor (no ICs needed).
  - **A deliberate drag source:** a little skirt contact with the track, or contact with the rail sides (allowed), so the vehicle reaches a steady terminal speed.
  - **Combined lift and thrust from one fan** (a split duct), simpler but harder to tune.
  - **Mechanical or non-electric timing** (a wind-up timer or a switch tripped by a lever) to cut thrust at the right moment and coast.
- **Calibrate:** make a table of potentiometer setting (or resistor) vs run time for each Target Time, with your full nickel load. Battery voltage drops as batteries drain, so use fresh or freshly charged cells and recheck.

### Steering and stability

- The rails keep it on the track, but bumping them adds drag and changes timing. Aim for **straight, centered** travel: balanced weight, thrust aligned with the center line, symmetric skirt.
- **Rail guides** (small low-friction bumpers on the sides) let it slide along a rail consistently instead of bouncing.
- A **low center of mass** (nickels as low and central as possible) prevents tipping.

### Carrying the nickels

- Build **cradles or slots** that hold the rolls snugly without tape (U-channels, foam cutouts, a tray with sides), plus a cup or box for the loose nickels.
- Place the mass **symmetrically** around the center of lift.
- The loaded craft must still fit in the 40 cm cube and lift properly (test with ~1 kg of real nickels).

## Building tips

| Part | Common choice |
|---|---|
| Hull | Foam board, XPS foam or thin plywood |
| Skirt | Plastic sheet, ripstop nylon, or a bag skirt from a trash bag |
| Lift fan | Small DC motor with a propeller, or a computer fan (brushless with built-in electronics is fine, since it's part of a commercial motor) |
| Thrust | DC motor with a propeller in a **shielded duct** |
| Power | AA or 9 V NiMH/alkaline packs, ≤ 12 V total |
| Speed control | Potentiometer, rheostat or fixed resistors; switches; relays |
| Dowel | ¼″ (or larger) wood dowel, ≥ 20 cm tall, at the front |

**Shielding:** wire mesh or 3D-printed grilles over every fan, tight enough that a 3/8″ (9.5 mm) dowel can't reach the blades.

## Testing and logging

Build a practice track: two 2×4s 45 cm apart on a smooth floor, start and finish lines 185 cm apart.

| Run | Load | Speed setting | Battery V | Runtime (s) | Notes |
|---|---|---|---|---|---|
| 1 | Full (20 pts) | Pot at 40% | 11.8 V | 13.6 | Touched left rail twice |
| 2 | Full | Pot at 35% | 11.7 V | 16.2 | Straight |

Test **every** Target Time from 6 to 26 s and build a **calibration curve** (setting vs time). Test on different surfaces (tile, gym floor, a countertop) because the event surface varies. Practice the 8-minute routine: switch on, place, launch, measure, adjust, second run.

## On competition day

- Impound the vehicle, spare parts and your calibration notes. You **can't bring papers in later**.
- Bring tools, fresh batteries (stored separately), calculators and safety glasses.
- At the start of your time you get the TT. Look up your setting, adjust, check, launch.
- Hands off once it's launched, until the supervisor says so.
- Use run 1 to confirm your calibration on that track, and adjust for run 2.

## Common pitfalls

- An unshielded propeller (participation only).
- A lithium battery pack, or more than 12 V.
- A microcontroller or speed controller chip (not allowed).
- Nickels falling off (×0.8 and they don't count).
- Calibrating only with a light load or on one surface.
- Using the ramp when you didn't need it.

## Test yourself

<details><summary>1. TT is 10.0 s and your run takes 11.5 s, complete, carrying 3 rolls and 10 loose nickels. Run score?</summary>

DS 40 + TS 40 × (1 − 1.5/10) = 34 + MS 4(3) + 0.1(10) = 13. Total 87.

</details>

<details><summary>2. Your vehicle stops 37 cm short of the finish with all nickels. What's the score?</summary>

Incomplete: DS = 40 × 148/185 = 32; TS = 0; MS = 20 × 148/185 = 16. Total 48.

</details>

<details><summary>3. What cushion pressure holds a 1.2 kg craft with a 0.12 m² footprint?</summary>

P = (1.2 × 9.81)/0.12 ≈ 98 Pa.

</details>

<details><summary>4. Can you use an Arduino to time the thrust motor?</summary>

No. Integrated circuits aren't allowed (except those built into a commercial motor).

</details>

## Resources

- [Official event page, rules, track and ramp plans (soinc.org)](https://www.soinc.org/hovercraft-c)
- [Scioly.org wiki: Hovercraft](https://scioly.org/wiki/index.php/Hovercraft)
- Scoring spreadsheet on soinc.org
