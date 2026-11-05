---
title: Mission Possible
type: Build
summary: Build a Rube Goldberg–style device that starts with a coin, runs up to 12 scorable actions and drops a pack of gum on a tray at the target time.
---

## At a glance

| | |
|---|---|
| **Team** | Up to 2 |
| **Time** | About 40 minutes (including up to 30 minutes of setup) |
| **Type** | Build. **Impound at State and National only.** |
| **Eye protection** | **C** (chemical splash goggles), worn at all times |
| **Size** | ≤ **80.0 × 80.0 × 80.0 cm** during operation; top and at least two sides open or transparent |
| **Electronics** | **No Arduinos, Raspberry Pis or other ICs.** Electricity only in the **first 30 seconds**. Batteries ≤ 9 V. Timing can't be powered by electricity or springs. |
| **Not allowed** | Open flames, cell phones, hazardous liquids, gases or materials (rat traps, lead, fuses, dry ice, liquid nitrogen), flammable gases |
| **Target Operation Time** | **60 s** Regional/Invitational; **61–90 s** State; **91–120 s** National |
| **Score** | **High score wins** (points for actions, start, finish, time, size, documentation; minus penalties) |

> [!NOTE]
> This guide summarizes the 2026–27 rules. Read the official manual, the Action Sequence List (ASL) example, the Battery Policy and the Building Policy on soinc.org.

## How the event runs

1. **(State/National) Impound** your device, ASL, and any tools or parts for setup.
2. **Check-in and safety inspection.** You'll learn the **Target Time** and the **Coin Drop Order** (nickel–dime–quarter or dime–nickel–quarter) when setup starts.
3. **Setup:** up to 30 minutes. Fast setup earns points.
4. **Official run:** the supervisor drops coins into the slot one at a time in the announced order. Timing starts when the **first action** visibly begins.
5. Your actions run in sequence, ending with a **pack of gum** dropping onto a small platform.
6. Timing stops when the gum comes to rest on the platform (or at 2 × Target Time).

## Scoring breakdown

| Item | Points |
|---|---|
| **Setup time** | 50 if ≤ 30 min; at State/National **75 if ≤ 15 min** |
| **ASL submitted on time** | 25 |
| **ASL proper format** | 25 |
| **ASL complete and accurate** | 25 |
| **Device labeled to match the ASL** | 25 |
| **Each unique scorable action** (up to 12) | **50 each** (max 600) |
| **Start action** | 25 (1st coin), 50 (2nd coin), **200 (quarter, after the other two fail)** |
| **Final Action** (gum on tray) | **250** |
| **Running time** | **2 points per full second** up to the Target Time (0 if it runs 2 × TT) |
| **Water timer bonus** | 1 point per full second it runs before the Target Time |
| **Size bonus** | 0.1 point per 0.1 cm under 80 cm, per dimension, up to 30 each (max 90; in person only) |
| **No adjustments** | 75 |

| Penalty | Points |
|---|---|
| Each full second past the Target Time (up to 2 × TT) | −2 |
| Each dimension over 80 cm | −25 (over 82 cm → Tier 2) |
| Top and 2 walls not open or transparent | −25 |
| Each touch/adjustment (max 3; device stopped after the 3rd → time scored 0) | −25 |
| Solid or liquid leaving the device (except the ping pong ball in action iv) | −50 (once) |
| Electricity used after 30 s | −250, and that action doesn't count |

**Tiers:** Tier 1 has no violations. Tier 2 has unpenalized construction or run violations (or any dimension over 82 cm). Tier 3: late impound, no eye protection, or failing build questions. **Tiebreakers:** fewest penalty points, then smallest L + W + H.

> [!TIP]
> A Regional device that does everything right: 50 setup + 100 ASL + 600 actions + 200 start + 250 final + 120 time + ~60 water timer + size bonus + 75 no adjustments ≈ **1,450+** points.

## The start: coin slot

The slot must be **vertical**, on one side, and only big enough for one coin at a time. The supervisor drops a nickel or dime first, then the other, then a quarter.

| Coin | Diameter | Thickness | Mass |
|---|---|---|---|
| Dime | 17.91 mm | 1.35 mm | 2.268 g |
| Nickel | 21.21 mm | 1.95 mm | 5.000 g |
| Quarter | 24.26 mm | 1.75 mm | 5.670 g |

**The quarter start is worth 200 points**, eight times the first-coin start. So design the mechanism to **ignore dimes and nickels and trigger only on a quarter**. For example, a coin chute with a **gap about 22.5–23 mm wide**: dimes and nickels fall through the gap into a catch box, while the wider quarter bridges it and rolls on to the trigger. A trigger by mass alone is harder, since the nickel (5.0 g) and quarter (5.67 g) are close.

All coins must be **returned** to the supervisor afterward, so make them retrievable (competition violation otherwise).

## The 12 scorable actions (50 points each)

Each must be done **exactly as described** and must **initiate the next action**.

| # | Action | Key requirements and tips |
|---|---|---|
| **i** | **Vinegar + baking soda balloon** | The balloon expands **20 cm** and strikes an object that was originally **≥ 20 cm above** it, which triggers the next action. Pre-measure the reactants; tip a cup of baking soda into a bottle of vinegar with the balloon on the neck. Watch for leaks. |
| **ii** | **Endothermic action** | The **temperature drop** itself must trigger the next action. E.g., ammonium nitrate or citric acid + baking soda dissolving, cooling a liquid that contracts or a bimetallic strip that bends to close a gap. This is one of the hardest to make reliable. |
| **iii** | **Two Alka-Seltzer tablets in water** | The reaction (gas, pressure, bubbles, lifting a float) triggers the next action. Tablets can dissolve unevenly, so give a margin. |
| **iv** | **First-class lever launches a ping pong ball** | The ball goes **completely out of the top**, travels **≥ 20 cm horizontally** (a 20 cm guide is required at the top), re-enters, triggers the next action and **stays in** the device. The lever counts toward device size. |
| **v** | **Infrared beam** | **IR LED transmitter and photodiode-based receiver** at least **20 cm apart**. Breaking (or completing) the beam triggers the next action. No ICs, so the receiver circuit uses a photodiode and a transistor or relay. Must happen in the **first 30 s**. |
| **vi** | **Inclined plane, IMA > 2** | Push or pull a **> 400 g** removable mass up an incline with ideal mechanical advantage **> 2** (length / height > 2, i.e., angle under 30°), raising it **≥ 10 cm vertically**. |
| **vii** | **Pulley system, IMA ≥ 3** | Lift a **> 400 g** removable mass **≥ 10 cm**. IMA = number of rope segments supporting the moving block (e.g., a block and tackle with 3 supporting strands). |
| **viii** | **All 3 classes of levers** | Use first-, second- and third-class levers (in any order) to initiate the next action. |
| **ix** | **Gravity-driven screw** | Gravity turns a screw **at least 2 full rotations** (marked so rotation is visible), moving an object **≥ 2 cm** linearly, which triggers the next action. E.g., a falling weight on a string wrapped around a threaded rod's pulley drives a nut along the rod. |
| **x** | **Archimedes screw** | Raise a marble **≥ 20 cm**; fully visible. Driven by a falling weight, a spring set before the run, or electricity in the first 30 s. |
| **xi** | **Electricity breaks a string or fishing line** | E.g., a nichrome wire heated by a battery burns through fishing line, dropping an object that starts the next action. **First 30 s only**. No open flame. |
| **xii** | **Remove a magnet** | Pull a magnet away from a surface so a magnetic object falls (due to losing the magnetic force) and triggers the next action. |

**Rules about actions:**

- Every action must contribute to completing the Final Action. **Parallel and dead-end actions don't count.**
- Each movable object can be used in **at most one** action (an object ending one action may start the next, but nothing beyond that).
- **Non-scorable actions** are allowed (connecting steps) but must be on the ASL.
- If an action happens **out of order** vs the ASL, all skipped actions score zero.
- If you touch the device to complete an action (or an adjustment directly completes it), that action doesn't count.

### Simple machines refresher

![The three classes of levers](img:mp-levers)

| Lever | Arrangement | Example | Mechanical advantage |
|---|---|---|---|
| **First class** | **Fulcrum** in the middle (effort and load on opposite sides) | Seesaw, crowbar | Can be > 1, = 1, or < 1 |
| **Second class** | **Load** in the middle | Wheelbarrow, nutcracker | Always > 1 |
| **Third class** | **Effort** in the middle | Tweezers, fishing rod, human forearm | Always < 1 (gains speed and distance) |

**Ideal mechanical advantage (IMA):** no friction. **Lever:** effort arm / load arm. **Inclined plane:** length / height. **Pulley system:** number of supporting rope segments. **Screw:** circumference of the turning handle / pitch. **Actual MA** = output force / input force, always less than IMA because of friction. **Efficiency** = AMA / IMA.

![A block and tackle pulley system](img:mp-pulley)

## Timing: hitting the Target Time

You earn **2 points per second up to the Target Time** and **lose 2 per second** past it. Finishing early leaves points on the table; finishing late costs points. So the device should finish **just at or slightly before** the Target Time.

- **Water timer:** water draining from a container (through an adjustable valve or a hole of chosen size) into a cup that becomes heavy enough to tip or trigger. It must run **over 10 seconds**, can't be a scorable action, and must initiate the next action. It earns 1 point per second it runs before the Target Time, so a long water timer is a great way to fill time.
- **State/National:** the Target Time varies (61–90 s or 91–120 s), so you must **show how the water timer adjusts** (e.g., a marked fill line or an adjustable valve). Build a table: fill level vs time.
- Remember **electricity is limited to the first 30 seconds**. Put the IR beam (v) and string-burning (xi) actions early.
- Don't use electricity or springs to power timing.

## The Final Action: gum drop (250 points)

- Drop a **commercially purchased, unaltered 5-stick pack of gum** (you supply it) at least **50 cm vertically** onto a platform.
- The platform is flat, rigid, solid and unpadded, no more than **12 × 12 × 0.5 cm**, with **no sides** and no barriers within 4 cm of its edge, and its top is at least 2 cm above the base.
- The gum must be the **only** thing on the platform, supported only by it, clearly visible.
- There must be an opening **on the coin slot's side** big enough to reach in and **remove the gum** (the Final Action doesn't count unless it's removed).
- Don't touch the action that releases the gum.

A gum pack falling 50 cm **bounces**. Guide it down a short chute or drop it flat, and test many times so it reliably stays on a 12 × 12 cm tray.

## The Action Sequence List (100 points)

Use the **format on soinc.org**. It's a table where:

- **Column 1:** the ordinal number (1, 2, 3…), matching **labels on the device**.
- **Column 2:** the object moved (by name), and a description of the action.
- **Column 3:** the rule number for scorable actions (e.g., **4.b.iv**), as a roman numeral (i–xii).

Include the start, the coin-triggered action, the water timer, every scorable and non-scorable action, and the gum drop. Bring copies. Submit at impound (State/National) or at check-in (Regional).

## Design and building process

1. **Plan the chain on paper:** list your chosen actions in order and how each triggers the next. Put the electrical ones in the first 30 seconds.
2. **Build each action as a separate module** on a shared base and test it **20+ times**. A module that works 80% of the time will sink your run.
3. **Connect the modules** and test the full chain repeatedly. Time each action.
4. **Make the size small** (bonus points), but not so cramped that it's hard to set up.
5. **Practice setup** with a timer: aim for under 15 minutes at State/National. Use labeled bins and a checklist.
6. **Keep a log** of every full run: which action failed and why.

**Reliability tips:** use guides and funnels for balls and marbles, deliberate trigger thresholds (not hair triggers that go off early), sturdy mounting (hot glue and screws), consistent chemical quantities (pre-measured containers), and pre-made, labeled reset kits.

## Common pitfalls

- An action that doesn't actually trigger the next action (or becomes parallel).
- Electricity after 30 s (−250).
- Liquid or a solid escaping the device (−50).
- The gum bouncing off the tray.
- Over 80 cm in any dimension, including a lever that sticks out.
- A messy or incomplete ASL, or labels that don't match.
- Using an Arduino or any IC (not allowed).

## Test yourself

<details><summary>1. Target Time 60 s; the device finishes at 72 s. Time points?</summary>

120 for the 60 s, minus 2 × 12 = 24, so 96.

</details>

<details><summary>2. A pulley system has 4 rope segments supporting the moving block. What is its IMA, and does it qualify for action vii?</summary>

IMA = 4, which is ≥ 3, so it qualifies (with a > 400 g mass lifted ≥ 10 cm).

</details>

<details><summary>3. Why might a team want a dime and a nickel to fail to start the device?</summary>

A quarter start is worth 200 points vs 25 or 50.

</details>

<details><summary>4. An incline is 60 cm long and rises 25 cm. Does it meet IMA > 2?</summary>

IMA = 60/25 = 2.4 > 2, yes.

</details>

## Resources

- [Official event page, rules, ASL format (soinc.org)](https://www.soinc.org/mission-possible-c)
- [Scioly.org wiki: Mission Possible](https://scioly.org/wiki/index.php/Mission_Possible)
- Science Olympiad Battery Policy and Building Policy (soinc.org)
