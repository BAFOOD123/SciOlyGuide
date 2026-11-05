---
title: Remote Sensing
type: Core knowledge
summary: Climate change through satellite data. Sensors and physics, interpreting imagery from named missions, climate processes and Earth's energy balance.
---

## At a glance

| | |
|---|---|
| **Team** | Up to 2 |
| **Time** | About 50 minutes |
| **Format** | Written test with imagery, data and calculations |
| **You may bring** | Writing utensils, **two Class II calculators**, **two protractors, two rulers**, and **one three-ring binder** (any size, any content, ring-bound; sheet protectors, tabs, labels OK). At lab stations, nothing may be removed from the binder. |
| **Scoring** | Highest score wins; preselected tiebreakers |
| **2027 theme** | **Climate change** processes in the Earth system |
| **Sponsor** | IEEE Geoscience and Remote Sensing Society |

**Test weighting:** instrumentation and physics ~25%, image/data interpretation ~35%, climate processes ~20%, energy balance ~20%. No calculus.

> [!NOTE]
> This guide summarizes the 2026–27 rules. Confirm the mission list and scope in the official manual on soinc.org.

## How the event runs

Expect physics and math problems (blackbody laws, orbits, equilibrium temperature, resolution), plus a lot of **reading satellite imagery and graphs**: identify a feature, say which band or instrument shows it, interpret a trend. Build a **binder** organized by the four topic areas, with a satellite/instrument reference table, formula pages with worked examples, and example images from each mission.

Split the work: one partner owns **physics and math**, the other owns **missions, imagery and climate processes**. Both learn the energy balance.

## Remote sensing instrumentation and physics (~25%)

### Active vs passive sensors

- **Passive** sensors measure natural radiation (reflected sunlight or emitted heat): cameras, radiometers, spectrometers. They need the Sun (for visible) or rely on Earth's own emission (for thermal IR).
- **Active** sensors send out their own energy and measure the return: **radar**, **LIDAR**, altimeters, scatterometers. They work day or night and can see through clouds (radar).

| Instrument | Active/Passive | Measures |
|---|---|---|
| Optical/IR imager, radiometer | Passive | Reflected light, emitted heat |
| **LIDAR** (light) | Active | Cloud/aerosol layers, surface height (CALIPSO) |
| **Radar altimeter** | Active | Sea surface height (JASON) |
| **Precipitation radar** | Active | 3D rain structure (GPM) |
| **Doppler radar** | Active | Motion (wind, precipitation) via frequency shift |
| **Space-based gravimetry** | Active (ranging) | Mass/water changes via gravity (GRACE) |

### Light and the atmosphere

As radiation passes through the atmosphere it is **reflected, refracted, transmitted, absorbed, scattered** and attenuated.

- **Scattering:** **Rayleigh** (particles ≪ wavelength, scatters blue most, makes the sky blue), **Mie** (particles ~ wavelength, aerosols and haze), **non-selective** (large particles, clouds scatter all visible light, so clouds look white).
- **Atmospheric windows:** wavelengths that pass through easily (much of visible, parts of IR, microwave). Greenhouse gases absorb in specific IR bands.
- **Albedo:** fraction of incoming light reflected (fresh snow ~0.8–0.9, ocean ~0.06, forest ~0.1–0.15, clouds ~0.5–0.7, Earth average ~0.30).

### Spectroscopy

![The electromagnetic spectrum](img:rs-em-spectrum)

- **EM spectrum** (long to short wavelength): radio, microwave, infrared, visible (red→violet, ~700→400 nm), ultraviolet, X-ray, gamma. Energy **E = hc/λ** (shorter wavelength = higher energy).
- **Spectra types:** **continuous** (a hot dense body, all wavelengths), **emission** (bright lines from excited gas), **absorption** (dark lines where a cool gas absorbs). Each gas has a fingerprint of lines.
- **Spectral signatures:** materials reflect and absorb differently by wavelength. Healthy vegetation reflects strongly in near-IR and absorbs red (the basis of NDVI); water absorbs IR; snow is bright in visible but dark in shortwave IR.
- **Band ratios:** dividing one band by another highlights features. **NDVI = (NIR − Red) / (NIR + Red)** measures vegetation (−1 to +1; high = green, healthy plants).

### Blackbody radiation

- **Wien's law:** λ_max = b / T, b = 2.898 × 10⁻³ m·K. The Sun (~5,800 K) peaks in visible (~500 nm); Earth (~288 K) peaks in thermal IR (~10 µm). This split is why the greenhouse effect works.
- **Stefan–Boltzmann law:** radiated power per area **F = σT⁴**, σ = 5.67 × 10⁻⁸ W m⁻² K⁻⁴. For a non-ideal emitter, F = εσT⁴ (ε = emissivity). Thermal-IR sensors use this to retrieve surface temperature.

### Orbits

![Satellite orbit types](img:rs-orbits)

- **Kepler's laws:** elliptical orbits; equal areas in equal times; **P² ∝ a³**. For Earth orbits, v = √(GM/r), and orbital period depends on altitude.
- **Orbit types:**

| Orbit | Altitude | Use |
|---|---|---|
| **LEO** (low Earth) | ~160–2,000 km | Most imaging satellites (MODIS, CALIPSO); high resolution, small swath |
| **MEO** | ~2,000–35,786 km | GPS navigation |
| **GEO / geostationary** | **35,786 km**, equatorial, matches Earth's rotation (period 24 h) | Weather satellites (**GOES**); stare at one hemisphere continuously |
| **Geosynchronous** | 24 h period, any inclination | |
| **Polar** | LEO, passes near the poles | Global coverage over time |
| **Sun-synchronous** | Polar LEO, precesses to cross the equator at the **same local solar time** each pass | Consistent lighting for land imaging (Terra, Aqua, Suomi NPP) |

### Imaging quality and resolution

- **Spatial resolution / Ground Sample Distance (GSD):** the ground size of one pixel. **IFOV** (instantaneous field of view) is the sensor's angular resolution; GSD ≈ IFOV (radians) × altitude.
- **Spectral resolution:** number and width of bands (multispectral = few bands; hyperspectral = hundreds).
- **Radiometric resolution:** bits per pixel (how many brightness levels).
- **Temporal resolution / revisit period:** how often the satellite re-images a spot. Geostationary = minutes; polar LEO = days.
- **Swath:** the width imaged in one pass; wider swath → shorter revisit.
- **Field of view (FOV):** the full angular extent the sensor sees.

> [!TIP]
> Example: a sensor with IFOV = 0.1 mrad at 700 km altitude has GSD ≈ 0.0001 × 700,000 m = 70 m per pixel.

## Interpreting images from the listed missions (~35%)

Know **what each mission measures, which the exam uses for which climate variable, and what its images look like.**

| Mission / instrument | Platform | Measures |
|---|---|---|
| **MODIS** | Terra & Aqua | Clouds, vegetation (NDVI), sea surface temperature, fires, aerosols; wide swath, daily global |
| **CALIPSO** | (A-train) | **LIDAR** vertical profiles of clouds and aerosols |
| **CloudSat** | (A-train) | Cloud-profiling **radar** (3D cloud structure) |
| **GOES** | Geostationary | Continuous weather imagery of the Americas (clouds, storms, temperature) |
| **Suomi NPP** | Polar | VIIRS imagery; **CrIS** (temperature sounding); **CERES** (energy flux) |
| **GPM** | — | **Precipitation radar + microwave** (global rain and snow, 3D) |
| **PACE** | — | Ocean color, aerosols, clouds (hyperspectral) |
| **JASON** (-3, etc.) | — | **Radar altimetry: sea level rise**, surface waves |
| **GRACE / GRACE-FO** | Twin satellites | **Gravimetry:** water mass changes (ice sheets, groundwater), indirectly sea level |
| **OCO-2** | — | **Atmospheric CO₂** (column) |
| **Aura** | — | Ozone and trace gases (OMI, MLS) |
| **TROPOMI** | Sentinel-5P | Trace gases: NO₂, SO₂, CO, CH₄, ozone, aerosols |
| **ASTER** | Terra | High-res visible/IR; surface temperature, emissivity |
| **ECOSTRESS** | ISS | Land surface temperature, plant water stress |
| **CERES** | Aqua & Suomi NPP | **Radiative energy flux** at the top of the atmosphere |

**Climate variable → mission (from the rules):**

- Clouds, precipitation, extreme weather → MODIS, CALIPSO, CloudSat, GOES, Suomi NPP, GPM.
- Sea level and surface waves → PACE, JASON, GRACE.
- Greenhouse gases, trace gases, aerosols → OCO-2, Aura, MODIS/Aqua, GOES, Suomi NPP, CALIPSO, PACE, TROPOMI, ASTER.
- Atmospheric and sea surface temperature → MODIS/Aqua, ECOSTRESS, ASTER, GOES, CrIS.
- Radiative energy flux → CERES, PACE.

**Reading imagery tips:** check the caption for the sensor, bands and date. True-color vs false-color (near-IR as red makes vegetation glow red). Thermal images: usually dark = cold, bright = warm (or a color scale). CALIPSO curtains show altitude vs latitude. Look for the color-bar units.

## Climate processes (~20%)

### Greenhouse gases and influences

- **Major greenhouse gases:** CO₂, H₂O (a feedback, the strongest absorber), CH₄, N₂O, O₃, CFCs and HFCs. Trace gases and aerosols (SO₂, NO₂, NH₄, halogenated gases) also matter. A gas absorbs IR only if its vibration changes its **dipole moment** (so N₂ and O₂ don't).
- **Global warming potential:** CO₂ = 1, CH₄ ~28–30, N₂O ~265+, CFCs thousands (per 100 years).
- **Natural influences:** solar activity (sunspot cycles, small), volcanic eruptions (SO₂ aerosols cause short-term cooling, e.g., Pinatubo 1991), **Milankovitch cycles** (eccentricity ~100 kyr, obliquity ~41 kyr, precession ~26 kyr drive ice ages), seasons, ocean and atmospheric circulation.
- The **Keeling curve** (Mauna Loa CO₂ since 1958): a rising trend from ~315 to over 420 ppm, with a yearly sawtooth from Northern Hemisphere plant growth.

### ENSO

![El Niño and La Niña Pacific conditions](img:rs-enso)

The **El Niño–Southern Oscillation** is a cycle in the tropical Pacific:

- **El Niño:** trade winds weaken, warm water shifts east, the thermocline flattens, upwelling off South America drops. Effects: wetter southern U.S. and Peru, drought in Australia and Indonesia, fewer Atlantic hurricanes.
- **La Niña:** stronger trade winds, cooler eastern Pacific, warm water piles in the west. Roughly opposite effects.
- **Neutral** in between. Monitored by sea surface temperature (MODIS), sea level (JASON) and the **Southern Oscillation Index** (pressure difference Tahiti − Darwin). Satellites track the warm-water pool and sea-level bulge.

### Carbon and nitrogen cycles

- **Carbon cycle:** photosynthesis and ocean uptake remove CO₂; respiration, decay, fires and **fossil-fuel burning** add it. Oceans and land each absorb roughly a quarter of human emissions; the rest stays in the air. Satellites (OCO-2) map CO₂ sources and sinks.
- **Nitrogen cycle:** fixation (bacteria, lightning, the Haber process), nitrification, assimilation, ammonification, denitrification. Fertilizers add reactive nitrogen; N₂O is a greenhouse gas; NO₂ (TROPOMI) traces combustion and pollution.

### Effects of climate change

- Changes to clouds and rainfall (more intense downpours, shifting patterns), flooding, **sea level rise** (thermal expansion + melting ice), heat waves, and wildfire smoke aerosols.
- **Ecological impacts:** shifting vegetation and biome boundaries, earlier springs, coral bleaching, species range shifts (tracked by MODIS NDVI, PACE ocean color).

## Earth's energy balance (~20%)

![Earth's energy balance](img:rs-energy-balance)

### Equilibrium temperature

Earth is in balance when **absorbed sunlight = emitted thermal radiation.**

- Incoming absorbed = **(1 − A) × S × πR²**, where S is the solar constant (~1,361 W/m²), A is albedo (~0.30), πR² is the disk area that intercepts sunlight.
- Outgoing = **σT⁴ × 4πR²** (emitted from the whole sphere).

Setting them equal and canceling:

**T = [ S(1 − A) / (4σ) ]^¼**

> [!TIP]
> With S = 1,361, A = 0.30: T = [1,361 × 0.70 / (4 × 5.67×10⁻⁸)]^¼ = [4.20×10⁹]^¼ ≈ **255 K (−18 °C)**. Earth's actual surface is ~288 K; the **33 K difference is the greenhouse effect**.

- **Raising albedo** (more ice or clouds) lowers T; **lowering albedo** (melting ice, darker surface) raises it.
- Adding greenhouse gases raises the altitude from which IR escapes to space, warming the surface (the **effective emission temperature** stays near 255 K but at higher altitude).
- With greenhouse gases, add their effect: a rough one-layer model gives a surface temperature a factor of 2^¼ ≈ 1.19 above the no-atmosphere case.

### Radiative forcing and feedbacks

- **Radiative forcing (W/m²):** a change in the energy balance from a factor (e.g., doubling CO₂ gives ~+3.7 W/m²). Positive = warming.
- **Feedbacks:**
  - **Positive (amplifying):** **ice-albedo** (warming melts ice → darker surface → more absorption), **water vapor** (warmer air holds more vapor, a greenhouse gas), permafrost methane release.
  - **Negative (damping):** more warming → more thermal emission (the basic Stefan–Boltzmann response); some cloud effects.
  - **Clouds** are the biggest uncertainty: low clouds cool (reflect sunlight), high thin clouds warm (trap IR).
- **CERES** measures the actual radiative fluxes at the top of the atmosphere to test this balance.

### Heating and cooling over time

Interpreting temperature or energy trends: **linear** (steady change), **piecewise-linear** (a change in rate, like a trend break), and **exponential** (a process like CO₂ growth or a relaxation toward equilibrium). Read slopes and units from graphs.

## How to study

1. **Build the mission table** and learn each one's job and imagery.
2. **Do the math:** Wien, Stefan–Boltzmann, equilibrium temperature, GSD, orbital period. Put worked examples in your binder.
3. **Practice imagery:** NASA Earth Observatory and Worldview have real images with captions. Learn to read false color, thermal and LIDAR curtains.
4. **Learn the climate processes** (ENSO, carbon cycle, feedbacks) and the energy balance.
5. Take practice tests; add missed facts and image types to the binder.

**Notes sheet/binder:** mission table, formula sheet, resolution definitions, orbit table, albedo values, greenhouse gas table, equilibrium temperature derivation, ENSO diagram, feedback list.

## Common pitfalls

- Mixing up spatial, spectral, radiometric and temporal resolution.
- Forgetting the factor of 4 in the equilibrium temperature (disk absorbs, sphere emits).
- Using Celsius in blackbody formulas (use kelvin).
- Confusing geostationary (fixed over one spot) with sun-synchronous (consistent lighting).
- Not knowing which mission measures a given variable.

## Test yourself

<details><summary>1. Earth emits most strongly near what wavelength (T ≈ 288 K)?</summary>

λ_max = 2.898×10⁻³ / 288 ≈ 1.0×10⁻⁵ m = 10 µm (thermal IR).

</details>

<details><summary>2. If Earth's albedo rose from 0.30 to 0.35, would the equilibrium temperature rise or fall?</summary>

Fall (less sunlight absorbed), to about [1361×0.65/(4σ)]^¼ ≈ 251 K.

</details>

<details><summary>3. Which satellite would you use to measure column atmospheric CO₂?</summary>

OCO-2.

</details>

<details><summary>4. During El Niño, what happens to the eastern Pacific sea surface temperature?</summary>

It warms (weaker trade winds push warm water east, reducing upwelling).

</details>

<details><summary>5. What orbit lets GOES stare continuously at the Americas?</summary>

Geostationary.

</details>

## Resources

- [Official event page and rules (soinc.org)](https://www.soinc.org/remote-sensing-c)
- [NASA Earth Observatory](https://earthobservatory.nasa.gov/) and [Worldview](https://worldview.earthdata.nasa.gov/)
- [NASA Earthdata mission pages](https://www.earthdata.nasa.gov/)
- [Scioly.org wiki: Remote Sensing](https://scioly.org/wiki/index.php/Remote_Sensing)
