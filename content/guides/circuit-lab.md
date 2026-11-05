---
title: Circuit Lab
type: Lab
summary: A written test on DC circuits, semiconductors and digital logic, plus hands-on breadboard and multimeter tasks.
---

## At a glance

| | |
|---|---|
| **Team** | Up to 2 |
| **Time** | About 50 minutes |
| **Format** | **Part I:** written test (50–75% of score). **Part II:** at least one hands-on task (25–50%). |
| **You may bring** | Writing utensils, **two Class III calculators**, and **unlimited paper notes** (binders, books, tabs and labels are all fine). You may bring your own basic multimeter if the supervisor allows it. |
| **Supervisor provides** | All supplies and measuring devices for the hands-on tasks |
| **Scoring** | Highest score wins; preselected questions break ties |
| **Units** | Metric with appropriate significant figures, unless told otherwise |

> [!NOTE]
> This guide summarizes the 2026–27 rules. Check the official rules manual and clarifications on soinc.org for the exact scope.

## How the event runs

You'll get a written test and one or more lab stations with breadboards, resistors, batteries, LEDs, switches and multimeters. Many teams have one partner start the hands-on task while the other works the test, then switch.

**In scope (at least one question from each):** history of electricity; electric charges, fields and static; AC vs DC; current, voltage, resistance, power and energy; DC circuits (series, parallel, open, short, schematics, Ohm's law); PN junctions, diodes and LEDs; Kirchhoff's laws; digital logic.

**State and National add:** clocks, timing diagrams and flip-flops; BJT transistors (biasing, gain, transistor logic gates); ideal op-amps.

**Explicitly out of scope:** AC circuit theory, frequency analysis, capacitance, inductance, other nonlinear devices, 3-phase power, Thévenin/Norton equivalents, oscilloscopes. The math has no calculus, complex numbers or matrices. Binary is limited to whole numbers and addition.

## History of electricity

| Person | Contribution |
|---|---|
| **Charles-Augustin de Coulomb** (1785) | **Coulomb's law** of electric force, measured with a torsion balance; unit of charge (C) |
| **Alessandro Volta** (1800) | **Voltaic pile**, the first battery (zinc and copper discs with brine-soaked cloth); unit of voltage (V) |
| **André-Marie Ampère** (1820s) | Forces between current-carrying wires; electrodynamics; unit of current (A) |
| **Georg Ohm** (1827) | **Ohm's law** V = IR; unit of resistance (Ω) |
| **Gustav Kirchhoff** (1845) | **Kirchhoff's current and voltage laws** |
| **George Boole** (1854) | **Boolean algebra** (*The Laws of Thought*), the basis of digital logic |
| **Heinrich Hertz** (1887) | Generated and detected **radio waves**, proving Maxwell's electromagnetic waves; unit of frequency (Hz) |

## Charge, fields and static electricity

- **Charge** comes in multiples of e = 1.602 × 10⁻¹⁹ C. Like charges repel and opposite charges attract. Charge is conserved.
- **Coulomb's law:** F = k q₁q₂ / r², with k = 8.99 × 10⁹ N·m²/C². Force is a vector, so add components when several charges act. That's why the rules allow trigonometry for resolving vectors.
- **Electric field:** E = F / q = kQ / r² (N/C or V/m). Field lines point away from positive charges and toward negative ones.
- **Static electricity:** charge builds up by friction (triboelectric effect), conduction or induction. Sources include walking on carpet, clothes in a dryer, and lightning (cloud charge separation). Hazards: sparks igniting fuel vapor or dust; damage to electronics (electrostatic discharge, so use wrist straps); lightning strikes. Protection: grounding, lightning rods, humidity, antistatic materials.

## Current, voltage, resistance, power and energy

| Quantity | Symbol | Unit | Meaning |
|---|---|---|---|
| Charge | Q | coulomb (C) | |
| Current | I | ampere (A) = C/s | Rate of charge flow (conventional current goes + to −; electrons move the other way) |
| Voltage | V | volt (V) = J/C | Energy per charge (potential difference) |
| Resistance | R | ohm (Ω) = V/A | Opposition to current |
| Power | P | watt (W) = J/s | Rate of energy use |
| Energy | E | joule (J); kWh = 3.6 × 10⁶ J | |

**Key equations:**

- **Ohm's law:** V = IR
- **Power:** P = IV = I²R = V²/R
- **Energy:** E = Pt
- **Resistance of a wire:** R = ρL/A (resistivity × length / cross-section area). Copper's ρ ≈ 1.7 × 10⁻⁸ Ω·m.
- **Battery capacity:** in mAh (milliamp-hours). Energy in Wh = capacity (Ah) × voltage.

> [!TIP]
> Example: a 3,000 mAh, 3.7 V phone battery holds 3.0 × 3.7 = 11.1 Wh. A 10 W charger at roughly 85% efficiency fills it in about 11.1 / (10 × 0.85) ≈ 1.3 hours.

**Resistor color code:** Black 0, Brown 1, Red 2, Orange 3, Yellow 4, Green 5, Blue 6, Violet 7, Gray 8, White 9. Bands: digit, digit, multiplier (power of 10), tolerance (gold ±5%, silver ±10%, brown ±1%). Example: brown-black-red-gold = 10 × 10² = 1 kΩ ±5%.

## AC vs DC

| | DC | AC |
|---|---|---|
| Direction | One way | Reverses periodically (60 Hz in the Americas, 50 Hz in most of the world) |
| Sources | Batteries, solar cells, USB, power supplies | Generators, power grid, wall outlets (120 V or 230 V RMS) |
| Uses | Electronics, phones, cars, LED lighting | Power transmission, motors, household appliances |
| Why it matters | Easy to store; what electronics need | Easy to step up/down with **transformers**; high voltage reduces transmission loss (P_loss = I²R) |

**Edison vs Westinghouse/Tesla** ("War of the Currents," 1880s–90s): AC won for power distribution. Today high-voltage DC (HVDC) lines are used for very long distances and undersea cables.

**Hazards:** current through the body is what's dangerous. About 1 mA is felt; ~10–20 mA prevents letting go; **~100 mA across the heart can cause ventricular fibrillation**. Body resistance drops greatly when wet. AC at 50–60 Hz is especially good at causing fibrillation. Protection includes fuses, circuit breakers, grounding, **GFCIs** (they trip when current going out and coming back differ by ~5 mA) and insulation.

## DC circuits

### Series and parallel

![Series and parallel resistors](img:circ-series-parallel)

| | Series | Parallel |
|---|---|---|
| Current | **Same** through each | Splits: I = I₁ + I₂ + … |
| Voltage | Splits: V = V₁ + V₂ + … | **Same** across each |
| Equivalent resistance | R = R₁ + R₂ + … (always bigger than the largest) | 1/R = 1/R₁ + 1/R₂ + … (always smaller than the smallest) |
| Two resistors | R₁ + R₂ | **R₁R₂ / (R₁ + R₂)** |

- **n equal resistors** R in parallel: R/n.
- **Voltage divider:** V_out = V_in × R₂ / (R₁ + R₂).
- **Current divider (two branches):** I₁ = I × R₂ / (R₁ + R₂).
- **Open circuit:** a break; no current flows, but the full voltage appears across the gap.
- **Short circuit:** a zero-resistance path; huge current (limited by the source's internal resistance), and components it bypasses get zero voltage.
- **Real batteries** have internal resistance r: terminal voltage V = ε − Ir.

> [!TIP]
> Example: 12 V across R₁ = 4 Ω in series with (6 Ω ∥ 3 Ω). 6 ∥ 3 = 18/9 = 2 Ω, total 6 Ω, I = 2 A. V across R₁ = 8 V, across the parallel pair = 4 V. Branch currents: 4/6 = 0.667 A and 4/3 = 1.333 A (adding to 2 A ✓). Power from the source: 24 W.

### Kirchhoff's laws

- **KCL (current law):** current into a node = current out. (Charge is conserved.)
- **KVL (voltage law):** voltages around any closed loop add to zero. (Energy is conserved.)

**Solving a circuit with KVL/KCL:**

1. Label a current in each branch and pick a direction (if it comes out negative, it flows the other way).
2. Write KCL at the nodes.
3. Write KVL around enough loops: going through a resistor in the current's direction is a drop of −IR; going through a battery from − to + is a rise of +ε.
4. Solve the system of equations (substitution or the calculator's equation solver).

### Measuring with a multimeter

![A digital multimeter](img:circ-multimeter)

- **Voltage:** connect in **parallel** across the part. A voltmeter has very high resistance.
- **Current:** break the circuit and connect in **series**. An ammeter has very low resistance. **Never put the meter in current mode across a voltage source** (you'll blow its fuse).
- **Resistance:** with the **power off** and the part removed from the circuit (otherwise parallel paths change the reading).
- **Continuity mode** beeps for a closed path, great for troubleshooting.
- **Diode test mode** shows a diode's forward voltage (about 0.5–0.7 V for silicon, more for LEDs).

### Breadboards

![Breadboard internal connections](img:circ-breadboard)

The holes in each short **row of 5** (on one side of the center trench) are connected. The long **power rails** along the edges are connected along their length (on some boards they're split in the middle, so check or ask the supervisor). Chips (ICs) straddle the center trench so each pin gets its own row. **You may ask the supervisor how the breadboard is wired internally.**

## Diodes and LEDs (PN junctions)

![Diode symbol and current–voltage curve](img:circ-diode)

- A **PN junction** joins p-type silicon (doped with boron, extra "holes") and n-type silicon (doped with phosphorus, extra electrons). At the junction, a **depletion region** forms with a built-in voltage.
- **Forward bias** (anode/p positive): above the **forward voltage** (~0.7 V for silicon, ~0.3 V for germanium or Schottky), current rises steeply.
- **Reverse bias:** almost no current, until **breakdown**. **Zener diodes** are designed to break down at a precise voltage and are used as voltage references.
- The diode symbol's arrow points in the direction of conventional current; the bar is the **cathode** (the banded end on a real diode).
- **LEDs** emit light when electrons and holes recombine. The forward voltage depends on color: red ~1.8–2.0 V, yellow/green ~2.0–2.2 V, blue and white ~3.0–3.3 V. The long leg is the anode (+); the flat side of the case is the cathode.
- **LED current-limiting resistor:** **R = (V_supply − V_f) / I**. Example: 5 V supply, red LED (2.0 V) at 20 mA → R = 3.0 / 0.020 = 150 Ω.
- **Uses:** rectifiers (AC → DC; a bridge rectifier uses four diodes), reverse-polarity protection, flyback protection, indicators, solar cells (a PN junction run in reverse: light generates current), photodiodes.

**Two LEDs equally bright** (a sample task): put them in series (same current), or in parallel with **separate** resistors. Two LEDs directly in parallel sharing one resistor won't share current evenly because their forward voltages differ.

## Digital logic

### Gates and truth tables

![Logic gate symbols](img:circ-logic-gates)

| Gate | Expression | Output is 1 when |
|---|---|---|
| NOT | A′ (or Ā) | A = 0 |
| AND | A · B | Both are 1 |
| OR | A + B | At least one is 1 |
| NAND | (A · B)′ | Not both are 1 |
| NOR | (A + B)′ | Both are 0 |
| XOR | A ⊕ B | Inputs differ |
| XNOR | (A ⊕ B)′ | Inputs are the same |

| A | B | AND | OR | NAND | NOR | XOR | XNOR |
|---|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 1 | 1 | 0 | 1 |
| 0 | 1 | 0 | 1 | 1 | 0 | 1 | 0 |
| 1 | 0 | 0 | 1 | 1 | 0 | 1 | 0 |
| 1 | 1 | 1 | 1 | 0 | 0 | 0 | 1 |

### Boolean algebra

- **Identities:** A + 0 = A, A · 1 = A, A + 1 = 1, A · 0 = 0, A + A = A, A · A = A, A + A′ = 1, A · A′ = 0, (A′)′ = A.
- **Distributive:** A(B + C) = AB + AC, and also A + BC = (A + B)(A + C).
- **Absorption:** A + AB = A, A(A + B) = A, A + A′B = A + B.
- **De Morgan's laws:** **(A · B)′ = A′ + B′** and **(A + B)′ = A′ · B′**. "Break the bar, change the sign."

**Universal gates:** **NAND alone** (or NOR alone) can build any logic function.

- NOT A = A NAND A.
- A AND B = (A NAND B) NAND (A NAND B).
- A OR B = (A NAND A) NAND (B NAND B).

**From a truth table to a circuit:** write a **sum of products**. For each row where the output is 1, AND the inputs (with NOT on any input that's 0), then OR all those terms together. Simplify with Boolean algebra or a **Karnaugh map**.

### Combinational circuits

- **Half adder:** Sum = A ⊕ B, Carry = A · B.
- **Full adder:** Sum = A ⊕ B ⊕ C_in, C_out = AB + C_in(A ⊕ B). Chain them to make a ripple-carry adder.
- **Multiplexer (MUX):** a select line chooses which input goes to the output. 2:1 MUX: Y = S′A + SB.
- **Decoders and encoders:** decoders turn an n-bit code into one of 2ⁿ outputs (e.g., a 7-segment display driver).

**Binary:** whole numbers only. 1101₂ = 8 + 4 + 0 + 1 = 13. Adding: 0110 + 0111 = 1101 (6 + 7 = 13). n bits represent 0 to 2ⁿ − 1.

### State and National: sequential logic

![D flip-flop timing diagram](img:circ-timing)

- **Clock signals:** a square wave. Frequency f = 1/T (period). **Duty cycle** = time high / period.
- **Timing diagrams:** show inputs and outputs over time. Read edges carefully: most flip-flops change on the **rising edge**.
- **Propagation delay:** the time from an input change to the output change (nanoseconds). The slowest path through a circuit sets the maximum clock speed. **Rise and fall times:** usually measured 10% → 90% of the swing.
- **Race conditions and glitches:** if two signals that should change together arrive at different times, the output can briefly glitch.
- **Latches and flip-flops:**
  - **SR latch** (two cross-coupled NOR or NAND gates): Set, Reset, Hold, and an invalid state (S = R = 1 for NOR).
  - **D flip-flop:** on the clock edge, Q takes D's value. Used for registers and memory.
  - **JK flip-flop:** like SR, but J = K = 1 **toggles**.
  - **T flip-flop:** toggles when T = 1. Chained T flip-flops make a **counter** (each stage divides the frequency by 2).

### State and National: BJT transistors

![NPN transistor symbol](img:circ-bjt)

- **NPN and PNP** bipolar junction transistors have three terminals: **base, collector, emitter**. The arrow on the emitter points in the direction of conventional current (out of an NPN, into a PNP: "**N**ot **P**ointing i**N**").
- **NPN in the active region:** V_BE ≈ 0.7 V, I_C = **β I_B** (β or h_FE ≈ 50–300), I_E = I_B + I_C.
- **Regions:** cutoff (off, switch open), active (amplifier), saturation (fully on, switch closed, V_CE ≈ 0.2 V).
- **Biasing:** the voltage divider bias circuit sets the base voltage. Find V_B with the divider formula, then V_E = V_B − 0.7, I_E = V_E / R_E ≈ I_C, and V_C = V_CC − I_C R_C.
- **Transistor as a switch:** pick a base resistor so the transistor saturates: I_B > I_C(load) / β, with margin.
- **Transistor logic gates:** an NPN with a pull-up resistor on the collector is a **NOT** gate (input high → transistor on → output pulled low). Two NPNs in **series** with a pull-up → **NAND**. Two in **parallel** → **NOR**.

### State and National: op-amps

![Inverting op-amp circuit](img:circ-opamp)

**Ideal op-amp rules** (with negative feedback):

1. No current flows into the inputs.
2. The output adjusts so the two inputs are at the **same voltage** (V₊ = V₋).

| Circuit | Gain or output |
|---|---|
| **Inverting amplifier** | V_out = −(R_f / R_in) V_in |
| **Non-inverting amplifier** | V_out = (1 + R_f / R_g) V_in |
| **Voltage follower (buffer)** | V_out = V_in (gain 1, very high input resistance) |
| **Summing amplifier (inverting)** | V_out = −R_f (V₁/R₁ + V₂/R₂ + …) |
| **Difference amplifier** | With equal resistor ratios: V_out = (R_f/R_in)(V₂ − V₁) |
| **Comparator** (no feedback) | Output swings to the + or − supply depending on which input is higher |

The output can't go past the supply rails: an amplifier with gain −10 and 2 V in, powered from ±12 V, **saturates** at about −12 V instead of −20 V.

## Hands-on tasks: how to do them

Sample tasks from the rules and how to approach them:

| Task | Approach |
|---|---|
| **Mystery resistor using only voltage measurements** | Put it in series with a known resistor R. Same current, so R_x = R × V_x / V_R. |
| **Power supplied to a circuit** | P = V × I (measure V across the source, I in series), or P = V²/R_eq. |
| **Two LEDs equally bright** | Same current: series, or separate resistors calculated for each LED's V_f. |
| **USB charger label** | Labels list outputs like 5 V ⎓ 3 A, 9 V ⎓ 2 A, 15 V/20 V (USB Power Delivery). Power = V × A. Charge time ≈ battery Wh / (charger W × efficiency). |
| **Build a logic circuit from a truth table** | Write the sum of products, simplify, wire with given gate chips (check the chip's pinout: VCC and GND pins!). |
| **Troubleshoot a faulty circuit** | Check power, then use voltage drops and continuity to find the open, short or wrong part. |
| **3-way switch with SPDT switches** | Connect the two switches' common terminals to the supply and lamp; connect their two "travelers" to each other. Either switch toggles the lamp (an XOR function). |
| **Create a given equivalent resistance** | Combine available resistors in series and parallel; verify with the meter. |

## Your binder

Because notes are unlimited, organize for speed: tabs for **formulas**, **history**, **AC/DC/safety**, **semiconductors**, **logic (with truth tables and De Morgan)**, **sequential logic**, **transistors**, **op-amps**, and **worked examples**. Include a resistor color chart, common IC pinouts (74HC00 NAND, 74HC02 NOR, 74HC04 NOT, 74HC08 AND, 74HC32 OR, 74HC86 XOR), and USB-PD voltage levels. Put an index on the first page.

## Common pitfalls

- Measuring resistance with the circuit powered, or in the circuit.
- Measuring current in parallel (blows the meter's fuse).
- LEDs backwards (no light) or without a resistor (burned out).
- Forgetting the breadboard's split power rails.
- Rounding too early in multi-step calculations; ignoring sig figs and units.
- Assuming an op-amp can output beyond its supply voltage.

## Test yourself

<details><summary>1. Three 6 Ω resistors in parallel, in series with a 4 Ω resistor, across 12 V. Total current?</summary>

6/3 = 2 Ω; total 6 Ω; I = 2 A.

</details>

<details><summary>2. Simplify (A + B)′ + A′B′ using De Morgan.</summary>

(A + B)′ = A′B′, so the expression is A′B′ + A′B′ = A′B′.

</details>

<details><summary>3. What resistor runs a blue LED (3.2 V) at 15 mA from 9 V?</summary>

(9 − 3.2) / 0.015 ≈ 387 Ω (use the next standard value, 390 Ω).

</details>

<details><summary>4. An inverting amplifier has R_in = 2 kΩ and R_f = 10 kΩ. What is V_out for 0.5 V in?</summary>

−(10/2)(0.5) = −2.5 V.

</details>

<details><summary>5. An NPN has β = 100 and I_B = 20 µA in the active region. What are I_C and I_E?</summary>

I_C = 2.0 mA, I_E = 2.02 mA.

</details>

<details><summary>6. What is 1011₂ + 0110₂ in binary and decimal?</summary>

10001₂ = 17 (11 + 6).

</details>

## Resources

- [Official event page and rules (soinc.org)](https://www.soinc.org/circuit-lab-c)
- [Scioly.org wiki: Circuit Lab](https://scioly.org/wiki/index.php/Circuit_Lab)
- [OpenStax *University Physics Vol. 2*](https://openstax.org/details/books/university-physics-volume-2) (free): ch. 5 (charges, fields), 9–10 (current, DC circuits)
- [All About Circuits textbook](https://www.allaboutcircuits.com/textbook/) (free): DC, semiconductors, digital
- Practice: build circuits in a free simulator such as Falstad's Circuit Simulator or Tinkercad Circuits
