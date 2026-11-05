---
title: Electric Vehicle
type: Build
summary: Build an AA-powered vehicle that pushes a water bottle past a line, reverses to stop on a target and hits a target time.
---

## At a glance

| | |
|---|---|
| **Team** | Up to 2 |
| **Time** | About 12 minutes; **8 minutes of Event Time** to adjust and make **2 runs** |
| **Type** | Build, **impounded** before the first time slot |
| **Power** | Up to **8 AA batteries**, each 1.2–1.5 V; **no lithium or lead**; no capacitors or springs that add energy |
| **Size** | ≤ **80.0 cm** long, ≤ **35.0 cm** wide |
| **Score** | **Low score wins.** Best of 2 runs. |
| **Target Distance** | 5.00–9.00 m (steps: 0.25 m regional, 0.10 m state, 0.01 m national) |
| **Target Time** | 10.0–20.0 s, in 0.5 s steps |
| **Bottle Line** | 1.00–3.00 m beyond the Target Point (same step sizes) |
| **Water Bottle** | Starts on the centerline at **2.0 m** (regional/invitational), **3.0 m** (state), **4.0 m** (national) from the Start |

> [!NOTE]
> This guide summarizes the 2026–27 Division C rules. Read the official manual, the Building Policy and the clarifications on soinc.org before building.

## The task

1. Your vehicle starts with its **Measurement Point (MP)**, its rearmost point, over the Start Point.
2. It drives forward and catches a **water bottle** in its **Bottle Pusher**.
3. It pushes the bottle past the **Target Point** and ideally **fully past the Bottle Line**.
4. It **reverses** and stops with its MP as close as possible to the Target Point.
5. It should finish in exactly the **Target Time**.

![The Electric Vehicle track layout](img:ev-track)

**The track:** a smooth, level, hard floor 2.0 m wide, extending at least 1.0 m past the Target Point.

- **Start Point** and **Target Point**: small tape marks, with an imaginary centerline between them.
- **Bottle Line**: ≥ 1 m wide tape, perpendicular to the centerline. Its edge nearest the Target defines the line.

**The bottle:** a clear 500 mL (16.9 oz) plastic water bottle, 6–7 cm across and 18–22 cm tall, weighted to 80–100 g with metal BBs (no liquid).

**Bottle rules:** it must stay **upright** and **on the floor**, may only be **pushed** (nothing under it), and only the Bottle Pusher, inside its measured opening, may touch it. Breaking these rules counts the bottle distance as 400 cm.

## Scoring

**Run Score = 100 + Distance Score + Time Score + Bonuses + Penalties**

| Part | Formula |
|---|---|
| **Distance Score** | 2.0 pt/cm × **Vehicle Distance** (MP to Target) + 1.0 pt/cm × **Bottle Distance** (Bottle Line to bottle's closest side) |
| Bottle not past the Target Point, or bottle rules broken | Bottle Distance = 400 cm |
| Failed run | Distance Score = 2,500; Run Time = 0.00 s |
| **Time Score** | 0.5 pt/s × \|Target Time − Run Time\| |
| **Bottle Bonus** | −20 if the bottle is **fully beyond** the Bottle Line |
| **Pusher Bonus** | (Pusher's widest opening − 35.0 cm) × 1.5 pt/cm (narrower is better; no designated pusher = 35.0 cm) |
| **Event Time Bonus** (National only) | (Event Time used − 480 s) / 30, applied to the Final Score |
| **Competition violation** | +150 |
| **Construction violation** | +300 |
| **Kit non-modification penalty** | +50 |
| **Not impounded** | +5,000 to the Final Score |

**Tiebreakers:** better Distance Score, then lower Time Score, then better Vehicle Distance, then smaller Bottle Pusher.

> [!TIP]
> Worked example: Target Time 14 s, pusher opening 12 cm. The vehicle stops 4.0 cm from the Target at 14.21 s, and the bottle is 2.5 cm fully past the Bottle Line. Score = 100 + (8.0 + 2.5) + 0.11 − 20 + (12 − 35)(1.5) = 100 + 10.5 + 0.11 − 20 − 34.5 = **56.11**.

**What matters most:**

- Vehicle distance costs **2 points per cm**, the biggest lever.
- Bottle distance costs 1 point per cm, so aim to put the bottle **just** past the line.
- The bottle bonus and pusher bonus are free points you design in.
- Time is only 0.5 points per second, but it's easy to nail with electronics.

## Construction rules

- **Energy:** all electrical energy from **≤ 8 AA batteries** with original manufacturer labels, individually removable, 1.2–1.5 V each when fully charged. NiMH rechargeables are fine. **Lithium or lead-acid batteries = participation only.** Sighting/alignment electronics may have their own separate power source.
- **No lasers** anywhere (including in sensors). **No cameras** of any kind.
- **No remote control or tethers.** A microcontroller is allowed, and you may talk to it over Wi-Fi, Bluetooth or USB to program it between runs. You can't access your programming tool from the start of a run until you retrieve the vehicle.
- **Bottle Pusher:** must be the **foremost** part of the vehicle; rigid, no moving parts, no flexing, fixed size and location; only one may be impounded; front edges rounded to about the diameter of a #2 pencil or larger; must work on bottles that aren't perfectly round. The bottle doesn't have to fit fully inside it.
- **Measurement Point:** the **rearmost** point, ≤ 1.0 cm above the floor, easy to measure (a skewer tip, nail, wedge corner).
- **One piece:** nothing may fall off (construction violation). Only wheels or treads, and parts already touching the floor at the start, may touch the floor.
- **Kits** are allowed, but you must make **at least two functional modifications** documented on the **Kit Modification Form** (impounded), design and build your own Bottle Pusher, and use only common, generally available kit parts (no custom circuit boards; 3D-printed parts are fine). Otherwise you get the non-modification penalty.
- **Programs** must be written by at least one member of your team. You may start from blank shells or small examples, but **single-source programs are prohibited** (construction penalty).
- **No AI** during your Event Time (by you or the device). AI may help with design and programming **before** competition day.

## Competition day

1. **Impound** (before the first time slot): the vehicle, batteries (stored **separately**), spare parts, alignment device, Kit Modification Form and any papers. Tools aren't impounded. Anyone on your 15-person team can impound.
2. The **Target Distance, Target Time and Bottle Line Distance** are announced after impound. They're the same for every team.
3. **Check-in:** the supervisor inspects the vehicle and measures the pusher's widest opening to 0.1 cm. You can fix violations using your Event Time.
4. **8 minutes of Event Time** for both runs. You may verify track dimensions with your own tools (no tape on the floor). Don't roll the vehicle on the track except for runs. No AC outlets.
5. **Each run:** place the MP over the Start (within ~1 cm), with the body toward the Target. Tell the supervisor you're ready. Start with a **vertical motion** of an unsharpened #2 pencil (only the pencil touches it).
6. Don't follow the vehicle down the track until called (competition violation).
7. **Run Time** runs from actuation until the vehicle is still for 3 seconds (the 3 seconds don't count). Pauses and oscillations count.
8. **Failed runs:** wrong direction, starting before the supervisor is ready, picking it up before measurement, pushing it, or not making a second run before time runs out.

## Designing the vehicle

### Drive system

![DC motor with gearbox](img:ev-motor)

| Option | Pros | Cons |
|---|---|---|
| **Geared DC motor + encoder** | Cheap, strong, smooth; encoder gives position feedback | Needs a motor driver (H-bridge) and closed-loop control |
| **Stepper motor** | Precise open-loop positioning (count steps) | Heavier, power-hungry; can skip steps if overloaded |
| Brushless motor + ESC | Efficient | Overkill; harder to control at low speed |

**You'll almost certainly want a microcontroller** (Arduino, ESP32, Raspberry Pi Pico): it measures distance with a **wheel encoder**, controls speed for the time target, reverses, and brakes. An **H-bridge** motor driver (like a TB6612FNG or DRV8833) lets you reverse the motor.

**Batteries:** 8 AA NiMH ≈ 9.6 V nominal; alkalines start at about 12 V but sag under load. Pick motors and a regulator to match. Rechargeable NiMH cells hold voltage more consistently, which helps repeatability. Always run with **fresh, fully charged** cells.

### Distance control

- **Wheel encoder math:** distance = (counts / counts per revolution) × π × wheel diameter. Calibrate on the actual floor type: measure the real distance after a long run and adjust the effective wheel diameter.
- Use an encoder on a **non-driven wheel** if you can, so wheel slip doesn't fool it.
- **Plan the motion:** accelerate gently (avoid slip), cruise, **decelerate to a precise stop** at the turnaround, then reverse to the target with the same care.
- **PID control** on position and speed gives repeatable stops.
- Thin rubber tires (O-rings) or hard narrow wheels; high wheel accuracy (true, round, equal diameters) keeps it straight.

### Path planning: how far to go forward

Let:

- **L** = vehicle length from MP to the pusher's front edge.
- **D** = Target Distance.
- **B** = Bottle Line Distance (beyond the Target).
- **d** = depth from the pusher's front to the back of its pocket, where the bottle sits.
- **w** = bottle diameter (~6.5 cm).

The bottle's rear side (toward the Start) must be **past D + B** at the turnaround. So at its forward-most point, the MP must be at about **D + B − L + d + margin** from the Start. Then reverse to **D**. Bottles slide a little after the vehicle stops, so test and calibrate the margin. Aim for the bottle just past the line, to get the −20 bonus with a tiny Bottle Distance.

The forward travel has to **catch the bottle** at 2, 3 or 4 m. The vehicle hits it at speed, so accelerate gently before contact and push at a moderate, steady speed so it doesn't tip.

### Time control

Total path = forward travel + reverse travel. Set the cruise speed so the whole run (including acceleration, deceleration and the stop at the turnaround) equals the Target Time. A microcontroller can **adjust speed in real time** based on elapsed time and remaining distance. Remember that the 3-second stillness at the end isn't counted, but any pause before moving is.

### Bottle Pusher design

![A V-shaped pusher guiding a bottle to the center](img:ev-pusher)

- **Narrow opening = bonus**, but it must reliably catch and center a bottle that may be off-center, wobbly or slightly out of round. A **V-shape** or curved pocket guides the bottle to the center.
- Example trade-off: a 10 cm opening earns (10 − 35) × 1.5 = **−37.5**; a 20 cm opening earns −22.5. Since the bottle is 6–7 cm wide, a narrow pusher needs very accurate steering.
- Contact low on the bottle so it doesn't tip; rounded front edges (pencil diameter or more) are required.
- Nothing outside the measured opening may touch the bottle. Make sure the vehicle's frame stays behind and inside the pusher.

### Going straight

- Rigid, square chassis; wheels aligned parallel; equal wheel diameters.
- Fine **steering adjustment** (a slotted axle mount or adjustable caster), so you can trim the path.
- A **sighting/alignment device** (no lasers) to aim the vehicle at the Target. It must be inside the track area, not taped to the floor, and moved behind the Start before the run.
- A stiff, low **center of mass** prevents wobble.

### Stopping accurately

- **Active braking** (short the motor terminals with the H-bridge, or reverse briefly) stops a DC motor sharply.
- Approach the final point slowly ("creep" phase) for precision.
- Backlash in gears can cause error when reversing; take it up with a short slow move.

## Testing and logging

Build a practice track on a floor like the competition's (gym, tile, or hallway). Record every run:

| Run | Target D / T / B | Vehicle distance (cm) | Bottle distance (cm), past? | Run time (s) | Notes |
|---|---|---|---|---|---|
| 1 | 7.00 m / 15.0 s / 2.00 m | 6.3 short | 4.1, past | 15.22 | Bottle slid after stop |
| 2 | 7.00 / 15.0 / 2.00 | 1.2 long | 1.8, past | 15.04 | Reduced push speed |

Test across the **whole range** of targets (5–9 m, 10–20 s, bottle lines 1–3 m, bottle at 2/3/4 m). Calibrate for battery voltage and floor surface. Practice the full routine under a **timed 8 minutes** so setup is fast and calm.

## On competition day

- Bring: fully charged batteries plus spares, tools, a tape measure (to verify track dimensions), your alignment device, a printed **settings table** (encoder counts for every target distance), a laptop or phone to program, and your Kit Modification Form if needed.
- Enter the posted values carefully. Have your partner double-check the numbers before each run.
- The first run should be **safe and measurable**. Use the second to improve.
- Watch out for pieces falling off, the pusher not being foremost, or the MP not being rearmost (construction violations: +300).

## Common pitfalls

- Lithium batteries (participation only).
- Vehicle over 80 cm long or 35 cm wide, including the pusher.
- The bottle tipping over or riding up on the pusher (bottle distance becomes 400 cm).
- Forgetting the bottle slides after the push.
- Testing only on one floor surface.
- Running out of Event Time before the second run (an automatic Failed Run).

## Test yourself

<details><summary>1. Vehicle stops 10 cm from the target, bottle 5 cm past the line (fully), run time 13.0 s vs target 12.0 s, pusher 15 cm. Run score?</summary>

100 + (20 + 5) + 0.5 − 20 + (15 − 35)(1.5) = 100 + 25 + 0.5 − 20 − 30 = 75.5.

</details>

<details><summary>2. Is a 2 cm improvement in Vehicle Distance worth more than a 3-second improvement in time?</summary>

Yes: 2 cm = 4 points; 3 s = 1.5 points.

</details>

<details><summary>3. Can you use a laser pointer to aim the vehicle?</summary>

No. Lasers are prohibited, including in sensors.

</details>

<details><summary>4. Why put the encoder on a non-driven wheel?</summary>

Driven wheels can slip, so their rotation overstates or understates distance. A free-rolling wheel tracks the true distance.

</details>

## Resources

- [Official event page and rules (soinc.org)](https://www.soinc.org/electric-vehicle-c)
- Kit Modification Form and Building Policy on soinc.org
- [Scioly.org wiki: Electric Vehicle](https://scioly.org/wiki/index.php/Electric_Vehicle)
- [Arduino documentation](https://docs.arduino.cc/) (encoders, motor drivers)
