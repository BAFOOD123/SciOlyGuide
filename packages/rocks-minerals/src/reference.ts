/** Reference tables for study. Rock names map to specimen ids where they're in the kit. */
export const REFERENCE = {
  igneous: {
    columns: ["Felsic", "Intermediate", "Mafic", "Ultramafic"],
    rows: [
      { texture: "Phaneritic (coarse, intrusive)", rocks: ["granite", "diorite", "gabbro", "peridotite"] },
      { texture: "Aphanitic (fine, extrusive)", rocks: ["rhyolite", "andesite", "basalt", null] },
      { texture: "Glassy", rocks: ["obsidian", null, null, null] },
      { texture: "Vesicular", rocks: ["pumice", null, "scoria", null] },
      { texture: "Pyroclastic", rocks: ["tuff", null, null, null] },
    ],
    note: "Syenite is an intermediate, alkali-rich phaneritic rock with little or no quartz.",
  },
  sedimentary: [
    { group: "Clastic: gravel (> 2 mm)", rocks: ["conglomerate", "breccia"], note: "Rounded clasts → conglomerate; angular → breccia" },
    { group: "Clastic: sand (1/16–2 mm)", rocks: ["sandstone", "arkose", "graywacke"], note: "Quartz-rich → sandstone; > 25% feldspar → arkose; muddy matrix → graywacke" },
    { group: "Clastic: clay and silt (< 1/16 mm)", rocks: ["shale"], note: "Fissile, formed in quiet water" },
    { group: "Chemical", rocks: ["rock-salt", "travertine", "oolitic-limestone", "dolostone", "banded-iron-formation", "chert-flint"], note: "Precipitated from water" },
    { group: "Biochemical (organic)", rocks: ["chalk", "coquina", "fossil-limestone", "diatomite", "bituminous", "anthracite"], note: "Made from the remains of organisms" },
  ],
  metamorphic: [
    { group: "Foliated (increasing grade →)", rocks: ["slate", "phyllite", "mica-schist", "garnet-schist", "gneiss"] },
    { group: "Foliated or weakly foliated", rocks: ["amphibolite", "talc-schist"] },
    { group: "Nonfoliated", rocks: ["marble", "quartzite", "serpentinite"] },
  ],
  bowen: {
    discontinuous: ["Olivine", "Pyroxene", "Amphibole", "Biotite"],
    continuous: ["Calcium-rich plagioclase", "…", "Sodium-rich plagioclase"],
    last: ["Potassium feldspar", "Muscovite", "Quartz"],
    note: "High temperature (≈1200 °C, mafic) at the top; low temperature (≈700 °C, felsic) at the bottom.",
  },
  grainSizes: [
    { name: "Boulder", size: "> 256 mm" },
    { name: "Cobble", size: "64–256 mm" },
    { name: "Pebble", size: "4–64 mm" },
    { name: "Granule", size: "2–4 mm" },
    { name: "Sand", size: "1/16–2 mm" },
    { name: "Silt", size: "1/256–1/16 mm" },
    { name: "Clay", size: "< 1/256 mm" },
  ],
  lusters: [
    { term: "Metallic", meaning: "Shines like polished metal; opaque" },
    { term: "Submetallic", meaning: "Dull metallic shine" },
    { term: "Vitreous", meaning: "Glassy (quartz, most silicates)" },
    { term: "Adamantine", meaning: "Brilliant, diamond-like (corundum)" },
    { term: "Pearly", meaning: "Like a pearl, often on cleavage faces (talc, mica)" },
    { term: "Silky", meaning: "Fibrous sheen (satin spar, ulexite)" },
    { term: "Resinous", meaning: "Like resin or tree sap (sulfur)" },
    { term: "Waxy / greasy", meaning: "Like wax or oil (agate, chert)" },
    { term: "Earthy / dull", meaning: "No reflection (kaolinite, bauxite)" },
  ],
} as const;
