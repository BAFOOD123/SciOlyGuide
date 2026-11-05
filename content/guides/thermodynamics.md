---
title: Thermodynamics
type: Build + test
summary: Build a passive solar box that heats water under a heat lamp, predict the temperature rise, and take a thermodynamics test.
---

## At a glance

| | |
|---|---|
| **Team** | Up to 2 |
| **Time** | About 50 minutes |
| **Type** | Written test (50%) + heat-collecting device (**impounded**) |
| **Calculator** | Class III |
| **You may bring** | Writing utensils, two Class III calculators, **unlimited paper notes**, your **device**, spare parts, tools and prepared graphs/tables |
| **Device must** | Heat 100 mL of room-temperature water in a **9 oz plastic cup** under a heat lamp; fit a **30 × 30 × 30 cm** cube; be at **room temperature** when impounded |
| **Not allowed in the device** | Hazardous materials (asbestos, mineral wool, fiberglass), thermometers/probes, commercial thermoses/coolers/vacuum devices, **any energy source** (no electricity, batteries, chemical reactions). No part may touch the water. |
| **Score** | Exam 50 + Temperature gain 30 + Prediction 20 = 100 |
| **Tiebreakers** | Best Temperature Score, then Exam Score, then preselected questions |

> [!NOTE]
> This guide summarizes the 2026–27 rules. Read the official manual, the Building Policy and the scoring spreadsheet on soinc.org.

## The device task

The supervisor provides a **clamp lamp with a 100–125 W (non-tinted, non-LED, non-halogen, non-ceramic) heat bulb**, mounted face-down **40–65 cm** above the table (the exact height is announced). Your passive device sits centered under it with a cup of water inside, and must get the water as hot as possible in the **Heating Time** (10 min Regional; 10–15 min State/National).

**Rules for the device:**

- Holds a supervisor-provided **9 oz clear plastic party cup** with **100 mL** of water; you can insert and remove the cup.
- Fits a 30 cm cube **including the cup**.
- **No part touches the water**; nothing added to the water.
- **No energy sources** (it's purely passive solar collection).
- Impounded at **room temperature** (a warm device would cheat the start).

## Scoring

**Final Score = Exam + Temperature + Prediction (max 100)**

| Part | Formula |
|---|---|
| **Exam (ES)** | (your Part I score / highest Part I score) × 50 |
| **Temperature (TS)** | (your Temperature Gain / highest TG) × 30 |
| **Prediction (PS)** | (your PE / highest PE) × 20, where **PE = 1 − \|actual − predicted\| / actual** |

- **Temperature Gain (TG)** = final − starting water temp (°C). Higher is better; it's scored **relative to the best team**.
- **Prediction:** you must submit a predicted final temperature (°C) **before the Heating Time ends**. Accuracy is rewarded.
- **Penalties:** ×0.9 per competition violation, ×0.7 per construction violation (on TS and PS). Banned materials or touching the device during heating → TS and PS = 0.

**Strategy:** the device is worth 30 points, but the **prediction (20 points) is fully in your control** — a well-calibrated device plus careful prediction can beat a slightly hotter but unpredictable one. And the exam is **half the score**, so study the theory hard.

## Building the heat collector

![A passive solar water heater box](img:thermo-device)

The device is essentially a **passive solar oven** using the lamp as the "sun." Maximize **absorbed radiation** and **minimize heat loss**.

### Absorbing the lamp's energy

- **Black surfaces** absorb radiation best (high absorptivity). Line the inside and the area around the cup with **matte black** (black paper, paint on a non-plastic surface, black foil).
- **Concentrate the light:** a **reflective cone, parabola or funnel** of aluminum foil or a Mylar-lined collar around the top gathers the lamp's spread-out light onto the cup. Shape it so light bounces down onto the black absorber and cup.
- **Greenhouse effect:** a clear window (plastic wrap or a clear lid) lets visible light in but traps the warm air and re-radiated IR. A double layer (an air gap) traps more.
- **Thermal mass vs speed:** you only have 10–15 minutes, so don't add heavy mass that heats slowly. Focus energy on the **water and the air immediately around the cup**.

### Minimizing heat loss

Heat leaves by **conduction, convection and radiation**:

- **Conduction:** surround the cup with **insulation** (not fiberglass/mineral wool — use foam board, cardboard with air gaps, cotton, wool, cork, or crumpled paper). The cup should rest on an insulating stand, not bare table.
- **Convection:** **seal gaps** so warm air doesn't escape or circulate. A lid over the cup (not touching the water) cuts evaporative and convective loss. (Evaporation also cools the water, so covering the top helps a lot.)
- **Radiation:** reflective inner walls (foil) bounce IR back toward the cup, while the absorber captures the lamp.

### Design pattern

A common winning design: an **insulated box** (foam board, ~25 cm) with a **black interior**, a **reflective funnel** at the top aimed at the cup, a **clear lid** over the cup for the greenhouse effect, and the cup sitting on an insulating pedestal with black foil around it. Everything must still fit the 30 cm cube and let you drop the cup in and pull it out.

> [!TIP]
> Balance absorption and loss: a tiny black cavity heats fast but holds little; a big insulated box loses less but takes longer to warm. Test both and time them.

## Making the prediction

You get the **starting water temperature, room temperature, bulb wattage, height and heating time**. Build a **calibration curve** from your own testing: final temperature (or ΔT) vs heating time, for the announced conditions. Bring graphs and a simple model.

A rough energy model:

**Q = mcΔT**, so **ΔT = Q / (mc)**

- m = 100 g of water, c = 4.18 J/(g·°C), so heating 100 g of water by 1 °C needs 418 J.
- The lamp delivers maybe 100–125 W, but only a fraction reaches and stays in the water (geometry, absorption, losses). Your device's **efficiency** is what you measure in practice.

> [!TIP]
> Example: if your device captures 15% of a 100 W bulb for 600 s, Q ≈ 0.15 × 100 × 600 = 9,000 J. ΔT ≈ 9,000 / (100 × 4.18) ≈ 21.5 °C. Calibrate the 15% from real tests.

**Prediction method:** from your calibration graph for that height and time, read off the expected ΔT, add the announced starting temperature, and adjust for the announced room temperature (warmer room = less loss). Submit before the heating time ends.

## Part I: Written test (50% of score)

At least three questions from each area.

### Systems and temperature

- **System** (what you study) vs **surroundings**; **open** (exchanges matter and energy), **closed** (energy only), **isolated** (neither).
- **Intensive properties** don't depend on amount (temperature, pressure, density); **extensive** do (mass, volume, total energy).
- **Temperature** measures average molecular kinetic energy. **Zeroth law:** if A is in thermal equilibrium with C and B is too, then A and B are in equilibrium (the basis of thermometers).
- **Scales:** K = °C + 273.15; °F = °C × 9/5 + 32; °C = (°F − 32) × 5/9. **Absolute zero** = 0 K = −273.15 °C.
- **Heat units:** joule, calorie (1 cal = 4.184 J), Calorie (food, = 1 kcal), BTU.

### Phases and the ideal gas law

![A phase diagram](img:thermo-phase-diagram)

- **Phases:** solid, liquid, gas (plasma). **Transitions:** melting/freezing, vaporization/condensation, sublimation/deposition.
- **Sensible heat** changes temperature (Q = mcΔT). **Latent heat** changes phase at constant temperature (Q = mL): **heat of fusion** (ice: 334 J/g), **heat of vaporization** (water: 2,260 J/g).
- **Phase diagrams:** pressure vs temperature, with the **triple point** (all three phases) and **critical point** (gas/liquid distinction disappears). Water's solid–liquid line slopes **left** (ice is less dense than water).
- **Ideal gas law:** PV = nRT (R = 8.314 J/mol·K). Combined gas law PV/T = constant.

### Heat transfer

![Three modes of heat transfer](img:thermo-heat-transfer)

| Mode | How | Example |
|---|---|---|
| **Conduction** | Through direct contact (molecular collisions) | Metal spoon in hot soup; rate = kAΔT/L |
| **Convection** | Bulk movement of fluid | Warm air rising; boiling water |
| **Radiation** | Electromagnetic waves (no medium needed) | The heat lamp; the Sun |

- **Thermal conductivity (k):** high for metals, low for air, foam, wood (insulators). **Fourier's law:** Q/t = kAΔT/L.
- **Heat capacity** (C) = heat to raise an object 1 °C. **Specific heat** (c) = per gram. Water's high specific heat (4.18 J/g·°C) is why it heats and cools slowly.
- **Q = mcΔT** for temperature change. **Calorimetry:** heat lost = heat gained (Q₁ + Q₂ = 0).

### Processes, laws and engines

- **Processes:** **isothermal** (constant T), **isobaric** (constant P), **isochoric/isovolumetric** (constant V), **adiabatic** (no heat exchange, Q = 0).
- **First law:** ΔU = Q − W (energy conservation; internal energy change = heat added minus work done by the system). Sign conventions matter.
- **Second law:** heat flows spontaneously from hot to cold; **entropy** of an isolated system tends to increase; no process is 100% efficient.
- **Heat engines:** convert heat to work. **Efficiency = W/Q_hot = 1 − Q_cold/Q_hot.** **Carnot (maximum) efficiency = 1 − T_cold/T_hot** (kelvin). **Carnot cycle:** two isothermal and two adiabatic steps.
- **Refrigerators and heat pumps** move heat from cold to hot using work (coefficient of performance).

> [!TIP]
> Example: a Carnot engine between 500 K and 300 K has max efficiency 1 − 300/500 = 0.40 (40%).

### History

| Scientist | Contribution |
|---|---|
| **Joseph Black** | Latent heat, specific heat, calorimetry |
| **James Joule** | Mechanical equivalent of heat (work ↔ heat); the joule |
| **Sadi Carnot** | The Carnot cycle and ideal engine efficiency |
| **Lord Kelvin (William Thomson)** | Absolute temperature scale; statements of the second law |
| **Rudolf Clausius** | Entropy; the second law |
| **Ludwig Boltzmann** | Statistical mechanics; entropy S = k ln W |
| **James Clerk Maxwell** | Kinetic theory; the Maxwell–Boltzmann distribution; Maxwell's demon |
| **Max Planck** | Blackbody radiation; quantum theory; the third law |

### State and National additions

- **Radiant exitance and blackbody radiation:** **Stefan–Boltzmann law** M = εσT⁴ (σ = 5.67 × 10⁻⁸ W/m²K⁴). **Wien's law** λ_max = b/T. A hotter body radiates much more (T⁴) and peaks at shorter wavelengths. This is why a black absorber heats up and the lamp's filament glows.
- **Entropy (S):** disorder; ΔS = Q/T for a reversible process; the universe's entropy increases.
- **Enthalpy (H = U + PV):** heat at constant pressure; ΔH for reactions and phase changes.
- **Third law:** entropy approaches a constant (zero for a perfect crystal) as T → 0 K; absolute zero is unreachable.

**Math scope:** arithmetic, ratios, exponents, absolute value, algebra (multi-step derivations), geometry (areas, volumes). **No trig or calculus.**

## How to study

1. **Build and test the device early.** Make a calibration graph of ΔT vs time at several heights, with the real bulb type if you can get one.
2. **Optimize** by changing one thing at a time (insulation, reflector, lid, absorber color) and measuring.
3. **Study the theory**: it's half the score. Work problems on Q = mcΔT, calorimetry, efficiency, gas law, heat transfer.
4. **Organize your notes** (unlimited paper) by topic with worked examples and your calibration graphs.
5. Practice the **prediction** routine until it's fast and accurate.

## Common pitfalls

- A device warmer than room temperature at impound.
- Any banned material (fiberglass, a thermos) → TS and PS = 0.
- Part of the device touching the water.
- Losing heat to evaporation (cover the cup, not touching the water).
- Forgetting to submit the prediction before heating ends.
- Using Celsius vs Kelvin incorrectly in efficiency problems.

## Test yourself

<details><summary>1. How much heat raises 100 g of water from 22.0 °C to 45.0 °C?</summary>

Q = mcΔT = 100 × 4.18 × 23.0 = 9,614 J ≈ 9.6 kJ.

</details>

<details><summary>2. A Carnot engine runs between 600 K and 300 K. Maximum efficiency?</summary>

1 − 300/600 = 0.50 (50%).

</details>

<details><summary>3. Which heat transfer mode carries energy from the lamp to your device?</summary>

Radiation.

</details>

<details><summary>4. Your device raised the water from 21.5 to 39.5 °C. You predicted 42.0 °C. What's your PE?</summary>

PE = 1 − |39.5 − 42.0| / 39.5 = 1 − 0.0633 = 0.937.

</details>

<details><summary>5. Why does covering the cup (without touching the water) help?</summary>

It cuts convective and evaporative heat loss and traps re-radiated IR (greenhouse effect).

</details>

## Resources

- [Official event page, rules, scoring spreadsheet (soinc.org)](https://www.soinc.org/thermodynamics-c)
- [Scioly.org wiki: Thermodynamics](https://scioly.org/wiki/index.php/Thermodynamics)
- [OpenStax *University Physics Vol. 2*](https://openstax.org/details/books/university-physics-volume-2) (free): ch. 1–4 (temperature, heat, kinetic theory, thermodynamics)
