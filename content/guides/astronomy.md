---
title: Astronomy
type: Core knowledge
summary: Stellar evolution in normal and starburst galaxies, plus the 2027 deep-sky objects and the math of distances and orbits.
---

## At a glance

| | |
|---|---|
| **Team** | Up to 2 |
| **Time** | About 50 minutes |
| **Format** | Written test, usually built around images, spectra, light curves and graphs of the listed deep-sky objects (DSOs) |
| **You may bring** | **One** of: a laptop/tablet plus a 3-ring binder; two laptops/tablets; or two 3-ring binders. Each team member can bring a Class IV (graphing) calculator. |
| **Devices** | Must work with no internet and no AI tools; it's on you to have everything saved locally |
| **Scoring** | Highest score wins; preselected questions break ties |
| **2027 theme** | Stellar evolution in normal and starburst galaxies |

> [!NOTE]
> This guide summarizes the 2026–27 rules. The official rules manual (soinc.org) is the final word. The DSO list and topics change each year, so check that your materials match this season.

## How the event runs

Astronomy is the most resource-heavy test in Science Olympiad. Almost every test has three parts:

1. **Concept questions** on stars, spectra, galaxies and distance measures.
2. **DSO identification and facts:** you're shown an image (optical, X-ray, infrared, radio or a composite), a spectrum or a light curve, and you identify the object and answer what it shows.
3. **Calculations:** distance modulus, parallax, Kepler's laws, Stefan–Boltzmann, Wien, Hubble's law, rotation curves. These are often worth the most points and decide ties.

Because you can bring a binder and a laptop, the test isn't about memorization. It's about **speed of lookup** and **doing the math correctly**. Strong teams have: a well-indexed binder with tabbed sections for each DSO, a formula sheet, and a laptop with offline copies of key papers, NASA/ESA press releases and a spreadsheet or calculator program for the formulas.

A typical split: one partner owns the DSOs and image ID, the other owns the math. Both should know the core stellar evolution concepts.

## What the 2027 rules cover

**Concepts**

- **Stars:** spectral classification (OBAFGKM, luminosity classes), spectral features, luminosity, blackbody radiation, the H-R diagram, and the life cycle from protostar to remnant.
- **Variable stars and standard candles:** Cepheids, RR Lyrae, Type Ia supernovae.
- **Compact objects and high-energy phenomena:** neutron stars, pulsars, ultraluminous X-ray sources (ULXs), gravitational waves.
- **Galaxies:** normal and starburst galaxy morphology, stellar populations, globular clusters, and how galaxy interactions trigger star formation.
- **Math:** orbital motion (Kepler's laws), rotation curves, distance methods (parallax, spectroscopic parallax, distance modulus, period–luminosity relations, Tully–Fisher, Type Ia supernovae, Hubble's law), Stefan–Boltzmann and Wien's laws.

**2027 deep-sky objects**

M31 (Andromeda) · Sombrero Galaxy (M104) · M51 (Whirlpool) · NGC 4536 · MCG+07-33-027 · NGC 1569 · Antennae Galaxies (NGC 4038/4039) · Arp 143 · Arp 147 · Cartwheel Galaxy · M82 (with M82 X-1, M82 X-2 and SN 2014J) · GW170817 · Terzan 5

## Stellar evolution

### Spectral classification

![The Hertzsprung–Russell diagram](img:astro-hr)

Stars are sorted by surface temperature into classes **O B A F G K M** (hottest to coolest), each split into subclasses 0–9. The Sun is G2. Mnemonic: "Oh Be A Fine Girl/Guy, Kiss Me."

| Class | Temperature (K) | Color | Strongest absorption lines | Example |
|---|---|---|---|---|
| O | > 30,000 | Blue | Ionized helium (He II) | Stars in starburst clusters |
| B | 10,000–30,000 | Blue-white | Neutral helium (He I), hydrogen | Rigel, Spica |
| A | 7,500–10,000 | White | **Hydrogen Balmer lines strongest** | Vega, Sirius |
| F | 6,000–7,500 | Yellow-white | Hydrogen weaker, ionized metals (Ca II) | Procyon |
| G | 5,200–6,000 | Yellow | Ca II H & K, neutral metals | Sun |
| K | 3,700–5,200 | Orange | Neutral metals | Arcturus |
| M | < 3,700 | Red | Molecular bands (TiO) | Betelgeuse, Proxima Centauri |

**Luminosity classes** describe size at a given temperature: Ia/Ib (supergiants), II (bright giants), III (giants), IV (subgiants), V (main sequence, "dwarfs"). The Sun is G2 V. Giants have narrower absorption lines than dwarfs because their low-density atmospheres have less pressure broadening.

### Blackbody radiation

Stars are close to blackbodies: their spectrum depends only on temperature.

- **Wien's law:** λ_max = b / T, with b = 2.898 × 10⁻³ m·K. The Sun (5,772 K) peaks near 500 nm.
- **Stefan–Boltzmann law:** flux at the surface F = σT⁴, and **luminosity L = 4πR²σT⁴**, with σ = 5.67 × 10⁻⁸ W m⁻² K⁻⁴.
- In solar units: **L/L☉ = (R/R☉)² (T/T☉)⁴**.

> [!TIP]
> Example: a star twice the Sun's radius and half its temperature has L = 2² × 0.5⁴ = 4 × 0.0625 = 0.25 L☉.

### The H-R diagram

The H-R diagram plots luminosity (or absolute magnitude) against temperature (or spectral class or color index). Temperature increases **to the left**.

- **Main sequence:** stars fusing hydrogen in their cores, about 90% of a star's life. Mass sets position: L ∝ M^3.5 roughly, so lifetime t ∝ M/L ∝ M^−2.5. The Sun lives about 10 billion years; a 10 M☉ star only about 20–30 million years.
- **Giants and supergiants:** upper right (cool but luminous because huge).
- **White dwarfs:** lower left (hot but tiny).
- **Instability strip:** a nearly vertical band crossing the giant branch where stars pulsate. Cepheids and RR Lyrae live here.
- **Turnoff point:** in a star cluster, the point where stars are leaving the main sequence gives the cluster's age. Older clusters have lower turnoffs.

### Life cycles

| Mass | Path | Remnant |
|---|---|---|
| < 0.5 M☉ | Red dwarf, burns slowly for trillions of years | Helium white dwarf (none yet exist) |
| ~0.5–8 M☉ | Main sequence → red giant (hydrogen shell burning) → helium flash/core helium burning (horizontal branch or red clump) → asymptotic giant branch → **planetary nebula** | Carbon–oxygen **white dwarf**, held up by electron degeneracy pressure; max mass is the **Chandrasekhar limit, ~1.4 M☉** |
| ~8–20+ M☉ | Supergiant, fuses up to iron in shells ("onion layers") → iron core collapses → **core-collapse supernova** (Type II, Ib, Ic) | **Neutron star**, held up by neutron degeneracy (~1.4–2+ M☉, ~20 km across) |
| > ~20–25 M☉ | Same, but the core is too massive | **Black hole** |

Iron is the end point because fusing it absorbs energy rather than releasing it.

### Supernova types

| Type | Spectrum | Cause | Where |
|---|---|---|---|
| **Ia** | **No hydrogen**, strong silicon (Si II at 615 nm) | **White dwarf** in a binary reaches ~1.4 M☉ (by accretion or merger) and explodes by thermonuclear runaway | Any galaxy, including ellipticals with old stars |
| Ib | No H, has helium | Core collapse of a massive star that lost its H envelope | Star-forming regions |
| Ic | No H, no He | Core collapse of a star stripped of H and He | Star-forming regions |
| II | **Hydrogen lines** | Core collapse of a massive star with its H envelope (subtypes II-P with a plateau, II-L linear) | Star-forming regions, spiral arms |

**Type Ia supernovae are standard candles.** They peak at about M ≈ −19.3 in B and V. Brighter ones fade slower (the **Phillips relation**), so measuring the decline rate calibrates the peak. Their light curve is powered by radioactive decay: ⁵⁶Ni → ⁵⁶Co → ⁵⁶Fe.

### Variable stars

- **Classical (Type I) Cepheids:** young, massive, metal-rich (Population I) supergiants. Periods of about 1–100 days. **Leavitt's law:** longer period means more luminous. Pulsation is driven by the **κ (kappa) mechanism**: a layer of partly ionized helium traps heat when compressed, then expands and releases it.
- **Type II Cepheids:** old, metal-poor (Population II) stars, about 1.5 magnitudes fainter than classical Cepheids at the same period. Mixing up the two led to early errors in Hubble's distance scale.
- **RR Lyrae:** old horizontal-branch stars, periods under a day, all with absolute magnitude M_V ≈ +0.6. Common in **globular clusters**, they're good for distances within the Milky Way and nearby galaxies.

### Neutron stars, pulsars and X-ray sources

- **Neutron stars:** spin fast (conservation of angular momentum) and have huge magnetic fields (~10⁸–10¹⁵ G). **Pulsars** beam radio waves along their magnetic axis and we see pulses as the beam sweeps past.
- **Millisecond pulsars:** old neutron stars "recycled" (spun up) by accreting matter from a companion. They're common in dense globular clusters like **Terzan 5**.
- **Magnetars:** neutron stars with the strongest magnetic fields.
- **X-ray binaries:** a compact object accretes from a companion. High-mass X-ray binaries (massive companion, young) vs low-mass X-ray binaries (old).
- **Ultraluminous X-ray sources (ULXs):** off-nucleus X-ray sources brighter than ~10³⁹ erg/s, the **Eddington limit** for a ~10 M☉ black hole. Explanations: an intermediate-mass black hole (IMBH), beamed emission, or super-Eddington accretion. The discovery that **M82 X-2 pulses** proved some ULXs are neutron stars accreting far beyond their Eddington limit.
- **Eddington luminosity:** L_Edd ≈ 1.26 × 10³¹ W × (M/M☉), the luminosity where radiation pressure balances gravity.

### Gravitational waves

Ripples in spacetime from accelerating masses, predicted by general relativity and first detected by LIGO in 2015 (GW150914, two black holes merging). Merging compact binaries produce a **chirp**: frequency and amplitude rise until the merger. The chirp mass is set by how fast the frequency changes. The amplitude, compared with the chirp mass, gives the distance directly, so a gravitational-wave source is a "standard siren."

## Galaxies

### Morphology

![Hubble's tuning-fork classification of galaxies](img:astro-tuning-fork)

The **Hubble sequence** sorts galaxies by shape:

- **Ellipticals (E0–E7):** the number is 10 × (1 − b/a), with b/a the axis ratio. Old red stars, little gas, little star formation.
- **Lenticulars (S0):** a disk with no spiral arms.
- **Spirals (Sa–Sd) and barred spirals (SBa–SBd):** "a" means a big bulge and tightly wound arms; "d" means a small bulge and loose arms. The **de Vaucouleurs** system adds rings "(r)" or "(s)" and intermediate bars "SAB."
- **Irregulars (Irr):** no clear structure, often gas-rich and star-forming.
- **Peculiar and interacting galaxies:** rings, tails and bridges (the Arp catalog collects many).

### Stellar populations

| | Population I | Population II |
|---|---|---|
| Age | Young | Old |
| Metals | Metal-rich | Metal-poor |
| Where | Disks and spiral arms | Halos, bulges, globular clusters |
| Examples | Sun, OB stars, classical Cepheids | RR Lyrae, Type II Cepheids, globular cluster stars |

"Population III" stars, the hypothesized first stars with no metals, haven't been observed directly.

### Globular clusters

Dense balls of ~10⁵–10⁶ old stars bound by gravity, orbiting in galaxy halos and bulges. Their H-R diagrams show a low main-sequence turnoff (old age), a red giant branch and a horizontal branch. The Milky Way has about 150–160, and big ellipticals and the Sombrero have thousands. Close encounters in their cores create binaries, X-ray sources and millisecond pulsars.

### Starburst galaxies

A **starburst** forms stars much faster than the galaxy could sustain over its lifetime (gas depletion in under ~100 million years). Signatures:

- Strong infrared emission (dust heated by young stars), strong Hα and other emission lines, blue colors.
- Many **super star clusters** (very massive young clusters).
- **Superwinds:** outflows of hot gas driven by many supernovae (M82's cone of red hydrogen filaments).
- Lots of supernovae, X-ray binaries and ULXs.

**Triggers:** galaxy collisions and close passes (tidal forces compress gas), mergers, bars funneling gas to the center. Some starbursts (MCG+07-33-027) have no obvious trigger.

**Star formation tracers:** Hα (ionized gas around O stars), UV light (young stars), far-infrared (dust warmed by young stars), radio continuum (supernova remnants).

### Galaxy interactions

- **Tidal tails and bridges:** long streams of stars pulled out by gravity (the Antennae).
- **Ring galaxies:** a smaller galaxy plunges through a disk's center, sending out a ripple of compressed gas that forms stars (the Cartwheel, Arp 147).
- **Mergers:** major mergers of similar-size galaxies can form ellipticals; the Milky Way and M31 will merge in a few billion years.

## Orbits and rotation curves

### Kepler's laws

1. Orbits are ellipses with the central body at one focus.
2. A line from the body to the planet sweeps equal areas in equal times (conservation of angular momentum), so the planet moves fastest at periapsis.
3. **P² ∝ a³.** In Newton's form: **P² = 4π²a³ / [G(M₁ + M₂)]**. With P in years, a in AU and M in solar masses: **P² = a³ / (M₁ + M₂)**.

Useful: G = 6.674 × 10⁻¹¹ N m² kg⁻², 1 AU = 1.496 × 10¹¹ m, M☉ = 1.989 × 10³⁰ kg.

Circular velocity: **v = √(GM/r)**. Escape velocity: **v_esc = √(2GM/r)**.

> [!TIP]
> Example: a binary has a = 10 AU and P = 20 years. M₁ + M₂ = a³ / P² = 1,000 / 400 = 2.5 M☉.

### Rotation curves and dark matter

![Rotation curve of a spiral galaxy](img:astro-rotation-curve)

A **rotation curve** plots orbital speed vs radius in a galaxy. If most mass were in the visible bulge, speeds far out would drop as v ∝ 1/√r ("Keplerian decline"). Instead, real spiral galaxies have **flat rotation curves**: speed stays nearly constant far beyond the visible disk. This is key evidence for **dark matter** halos. Mass inside radius r: **M(r) = v²r / G**.

Measured with the **21-cm line** of neutral hydrogen (radio) and Doppler shifts of emission lines. Doppler formula: **v = c Δλ / λ₀** for v ≪ c.

## Distances: the cosmic distance ladder

Each rung calibrates the next.

| Method | Range | How |
|---|---|---|
| **Parallax** | Up to a few kpc (Gaia) | d (pc) = 1 / p (arcseconds) |
| **Spectroscopic parallax** | Up to ~10 kpc | Spectral type + luminosity class → absolute magnitude → distance modulus |
| **Main-sequence fitting** | Clusters in the Milky Way and nearest galaxies | Shift a cluster's H-R diagram to match a calibrated main sequence |
| **RR Lyrae** | Milky Way and Local Group | M_V ≈ +0.6 |
| **Cepheids (Leavitt law)** | Up to ~40 Mpc with HST/JWST | Period → absolute magnitude |
| **Tip of the red giant branch** | Up to ~20 Mpc | Red giants top out at a known brightness (M_I ≈ −4.0) |
| **Tully–Fisher** | Up to ~100+ Mpc | Spiral galaxies: rotation speed (21-cm line width) correlates with luminosity, L ∝ v⁴ |
| **Faber–Jackson** | Ellipticals | Velocity dispersion vs luminosity |
| **Type Ia supernovae** | Up to billions of light-years | Calibrated peak M ≈ −19.3 |
| **Hubble's law** | Cosmological | v = H₀d |

### Magnitudes and the distance modulus

- Magnitudes are backward: smaller is brighter. A difference of 5 magnitudes is a factor of 100 in brightness: **m₁ − m₂ = −2.5 log(F₁/F₂)**.
- **Apparent magnitude m:** how bright it looks. **Absolute magnitude M:** how bright it would look from 10 pc.
- **Distance modulus:** **m − M = 5 log₁₀(d) − 5**, with d in parsecs. Rearranged: **d = 10^((m − M + 5)/5)**.
- With dust extinction A: m − M = 5 log d − 5 + A.
- **Color index B − V:** bigger means redder and cooler. **Reddening** E(B−V) = (B−V)observed − (B−V)intrinsic, and A_V ≈ 3.1 E(B−V).

> [!TIP]
> Example: a Cepheid has m = 24.0 and, from its period, M = −5.0. m − M = 29.0, so d = 10^(34/5) = 10^6.8 ≈ 6.3 Mpc.

### Hubble's law and redshift

- **v = H₀d**. H₀ ≈ 67–73 km/s/Mpc (the "Hubble tension": the early-universe value from the cosmic microwave background is about 67, while the distance-ladder value from Cepheids and Type Ia is about 73).
- **Redshift:** z = Δλ / λ₀. For small z, v ≈ cz.
- **Hubble time** 1/H₀ ≈ 14 billion years (an estimate of the universe's age).

## The 2027 deep-sky objects

![M82, the Cigar Galaxy, a starburst galaxy with a superwind](img:astro-m82)

| Object | Type | Distance | What to know |
|---|---|---|---|
| **M31 (Andromeda)** | SA(s)b spiral | ~2.5 million ly (~770 kpc) | Nearest large spiral; Local Group's biggest member; Hubble used its Cepheids in 1923–24 to prove galaxies lie outside the Milky Way; ring of star formation at ~10 kpc; satellites M32, M110; ~450 globular clusters; approaching us (blueshift), merger in ~4–5 billion years |
| **Sombrero (M104)** | Sa / S0 spiral, nearly edge-on | ~29–31 million ly | Huge bright bulge and dramatic dust lane; **~1,200–2,000 globular clusters**; supermassive black hole ~10⁹ M☉; little current star formation (a "normal" comparison galaxy) |
| **M51 (Whirlpool)** | Grand-design spiral, Sc | ~23–31 million ly | Interacting with companion **NGC 5195**; the interaction sharpens spiral arms and triggers star formation; first galaxy where spiral structure was seen (Lord Rosse, 1845); several supernovae (2005cs, 2011dh, 2019) |
| **NGC 4536** | Barred spiral (SAB(rs)bc) in Virgo (M61 group) | ~15 Mpc (~50 million ly) | **Starburst ring** around the bar and nucleus; hosted **Type Ia SN 1981B**; its Cepheids (HST Key Project, SH0ES) calibrate Type Ia supernovae and H₀ |
| **MCG+07-33-027** | Face-on spiral starburst | ~300–330 million ly | **Isolated field galaxy**, so its starburst has no obvious trigger (no companion); imaged by Hubble's ACS; hosted SN 2005bk (Type Ic) |
| **NGC 1569** | Dwarf irregular starburst | ~11 million ly | One of the nearest starbursts; **super star clusters** (NGC 1569 A and B); galactic wind blowing gas out; low metallicity; star formation rate ~100× the Milky Way's per unit mass at its peak |
| **Antennae (NGC 4038/4039)** | Merging pair of spirals | ~45–65 million ly | Two long **tidal tails** like insect antennae; thousands of young super star clusters in the overlap region; many ULXs (Chandra); a template for a major merger in progress |
| **Arp 143 (NGC 2445/2444)** | Interacting pair | ~190 million ly | NGC 2445 is a starbursting ring-like galaxy whose star formation was triggered by its collision with NGC 2444, which is mostly gas-poor older stars |
| **Arp 147** | Ring galaxy pair in Cetus | ~430 million ly | A blue ring of new stars formed after a smaller elliptical (left) passed through a spiral's disk; the reddish knot in the ring is likely the original nucleus; ring has many ULXs (Chandra) |
| **Cartwheel (ESO 350-40)** | Ring galaxy in Sculptor | ~500 million ly | Classic collisional ring: an expanding outer ring of star formation plus an inner ring and "spokes"; ~200 million years after a collision; many X-ray sources in the ring; JWST imaged it in 2022 |
| **M82 (Cigar Galaxy)** | Edge-on irregular starburst | ~12 million ly | Prototype starburst, triggered by an encounter with **M81** (~100 million years ago); **superwind** of red Hα filaments perpendicular to the disk; super star clusters; ~1 supernova every ~10 years in infrared and radio |
| **M82 X-1** | ULX | (in M82) | The brightest X-ray source in M82, one of the strongest **intermediate-mass black hole** candidates (~400 M☉ estimated from quasi-periodic oscillations) |
| **M82 X-2** | **ULX pulsar** | (in M82) | NuSTAR (2014) found **1.37-second pulses**, proving it's a **neutron star** shining far above its Eddington limit |
| **SN 2014J** | **Type Ia supernova** | (in M82) | The closest Type Ia in decades (~3.5 Mpc); found January 2014 by students at University College London; heavily reddened by M82's dust; detected in gamma rays from ⁵⁶Co decay |
| **GW170817** | Binary neutron star merger | ~40 Mpc (~130 million ly), in **NGC 4993** | First **gravitational waves from neutron stars** (LIGO/Virgo, 17 Aug 2017); short gamma-ray burst **GRB 170817A** 1.7 s later (Fermi, INTEGRAL); **kilonova AT 2017gfo** showed heavy r-process elements (gold, platinum); confirmed gravity waves travel at light speed; a "standard siren" estimate of H₀ |
| **Terzan 5** | Globular cluster-like system in the Milky Way's bulge | ~19,000–22,000 ly | Heavily reddened by dust; **at least two stellar populations with different iron content and ages** (~12 and ~4.5 billion years), so it may be a fossil building block of the bulge; holds **the most known millisecond pulsars of any cluster (40+)**, including PSR J1748−2446ad, the fastest-spinning known pulsar (716 Hz) |

> [!TIP]
> On image questions, learn what each object looks like in **several wavelengths**: Chandra X-ray (point sources, hot gas), Spitzer/JWST infrared (dust, often red), Hubble optical, and radio. Make a page of thumbnails for each DSO in your binder.

## How to study

1. **Week 1:** stars and the H-R diagram. Be able to sketch it with labels.
2. **Week 2:** life cycles, supernova types, compact objects.
3. **Week 3:** galaxies and starbursts. Read the NASA/ESA/Chandra press release for **every DSO**, saving the images and captions.
4. **Week 4:** every formula, with several worked examples of each. Put a "formula + example" page in your binder.
5. **From week 5:** timed practice tests. Track the questions you couldn't find in your binder and add them.

**Binder and laptop setup:**

- A tab for each DSO: images in several wavelengths, press releases, key numbers (distance, type, discoveries).
- A tab for formulas with units and worked examples.
- A tab for concepts (H-R diagram, spectral classes, supernova types, galaxy classes).
- On the laptop: PDFs of key papers and the NASA/ESA pages, and a spreadsheet that solves the distance modulus, Kepler and Stefan–Boltzmann for you. Test everything with Wi-Fi off.

## Common pitfalls

- Getting magnitude signs backwards (smaller = brighter).
- Using light-years where the formula needs parsecs (1 pc = 3.26 ly).
- Forgetting the total mass is M₁ + M₂ in Kepler's third law.
- Confusing Type Ia (white dwarf, no hydrogen) with core-collapse types.
- Confusing classical and Type II Cepheids.
- Spending too long on one question with no answer in your binder. Mark it and move on.

## Test yourself

<details><summary>1. A star has twice the Sun's temperature and the same radius. How luminous is it?</summary>

L = 1² × 2⁴ = 16 L☉.

</details>

<details><summary>2. A star's parallax is 0.004″. What's its distance, and what's its distance modulus?</summary>

d = 1/0.004 = 250 pc. m − M = 5 log 250 − 5 ≈ 5(2.398) − 5 ≈ 6.99.

</details>

<details><summary>3. Why was the detection of pulses from M82 X-2 important?</summary>

Pulses mean it's a spinning neutron star, so some ULXs are neutron stars accreting far above their Eddington limit, not intermediate-mass black holes.

</details>

<details><summary>4. A galaxy's Hα line (656.3 nm) is observed at 662.9 nm. Find its velocity and distance (H₀ = 70 km/s/Mpc).</summary>

z = 6.6/656.3 ≈ 0.01006, so v ≈ 3,017 km/s and d ≈ 43 Mpc.

</details>

<details><summary>5. What formed the ring in the Cartwheel Galaxy?</summary>

A smaller galaxy passed through the disk near its center, sending a density wave outward that compressed gas and triggered a ring of star formation.

</details>

<details><summary>6. What three signals came from GW170817?</summary>

Gravitational waves (LIGO/Virgo), a short gamma-ray burst (GRB 170817A) and a kilonova (AT 2017gfo) in optical, infrared, X-ray and radio.

</details>

<details><summary>7. Where in the H-R diagram is the instability strip, and which stars lie in it?</summary>

A nearly vertical band crossing the giant and horizontal branches, holding Cepheids and RR Lyrae.

</details>

## Resources

- [Official event page and rules (soinc.org)](https://www.soinc.org/astronomy-c)
- [Scioly.org wiki: Astronomy](https://scioly.org/wiki/index.php/Astronomy)
- [NASA Chandra X-ray Observatory: astronomy event resources and images](https://chandra.harvard.edu/edu/olympiad.html)
- [OpenStax *Astronomy 2e*](https://openstax.org/details/books/astronomy-2e) (free): chapters 17–23 (stars), 25–28 (galaxies)
- ESA/Hubble and NASA press releases for each DSO
