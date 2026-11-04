/**
 * The 92 specimens of the official Science Olympiad Rocks & Minerals kit
 * (Ward's kit 470359-836, specimen list linked from soinc.org/rocks-and-minerals-c),
 * with standard identification properties. Values are typical reference values;
 * real specimens vary. Kit numbers match the Ward's packing list.
 */

export type ChemClass =
  | "Native element"
  | "Sulfide"
  | "Oxide"
  | "Hydroxide"
  | "Halide"
  | "Carbonate"
  | "Sulfate"
  | "Phosphate"
  | "Borate"
  | "Silicate"
  | "Mineraloid";

export type Test =
  | "effervesces"
  | "effervesces-powdered"
  | "magnetic"
  | "salty-taste"
  | "fluorescent"
  | "double-refraction"
  | "soapy-feel"
  | "marks-paper"
  | "thin-sheets"
  | "iridescent-tarnish"
  | "striations"
  | "play-of-color"
  | "chatoyancy"
  | "fiber-optic"
  | "malleable"
  | "high-density"
  | "earthy-smell"
  | "floats";

export const TEST_LABEL: Record<Test, string> = {
  effervesces: "fizzes in cold dilute HCl",
  "effervesces-powdered": "fizzes in dilute HCl only when powdered",
  magnetic: "is attracted to a magnet",
  "salty-taste": "tastes salty",
  fluorescent: "often fluoresces under UV light",
  "double-refraction": "shows double refraction in clear pieces",
  "soapy-feel": "feels soapy or greasy",
  "marks-paper": "leaves a mark on paper",
  "thin-sheets": "peels into thin flexible sheets",
  "iridescent-tarnish": "tarnishes to iridescent purple and blue",
  striations: "has parallel striations on cleavage faces",
  "play-of-color": "shows a flash of blue-green color (labradorescence)",
  chatoyancy: "shows a moving band of light (chatoyancy)",
  "fiber-optic": "transmits an image through its fibers",
  malleable: "bends and flattens instead of breaking (malleable)",
  "high-density": "feels unusually heavy for its size",
  "earthy-smell": "smells earthy when breathed on",
  floats: "can float on water",
};

export type Luster = "metallic" | "submetallic" | "nonmetallic";

export interface Mineral {
  id: string;
  n: number;
  kind: "mineral";
  name: string;
  aliases?: string[];
  varietyOf?: string;
  chemClass: ChemClass;
  group?: string;
  formula: string;
  hardness: [number, number];
  sg: [number, number];
  streak: string;
  luster: Luster;
  lusterDesc: string;
  colors: string[];
  system: string;
  breakage: string;
  tests: Test[];
  ore?: string;
  uses: string[];
  tip: string;
}

export type RockType = "igneous" | "sedimentary" | "metamorphic";

export interface Rock {
  id: string;
  n: number;
  kind: "rock";
  name: string;
  aliases?: string[];
  rockType: RockType;
  /** intrusive/extrusive · clastic/chemical/biochemical · foliated/nonfoliated */
  subtype: string;
  texture: string;
  /** Igneous composition (felsic … ultramafic) or dominant material. */
  composition: string;
  minerals: string[];
  parent?: string;
  grade?: "low" | "low–medium" | "medium" | "medium–high" | "high";
  /** Clastic sedimentary rocks: depositional energy 1 (low) … 5 (high). */
  energy?: number;
  environment: string;
  tests?: Test[];
  uses: string[];
  tip: string;
}

export type Specimen = Mineral | Rock;

const m = (s: Omit<Mineral, "kind">): Mineral => ({ kind: "mineral", ...s });
const r = (s: Omit<Rock, "kind">): Rock => ({ kind: "rock", ...s });

export const MINERALS: readonly Mineral[] = [
  m({ id: "ulexite", n: 1, name: "Ulexite", chemClass: "Borate", formula: "NaCaB₅O₆(OH)₆·5H₂O", hardness: [2.5, 2.5], sg: [1.9, 2.0], streak: "white", luster: "nonmetallic", lusterDesc: "silky", colors: ["white", "colorless"], system: "Triclinic", breakage: "fibrous; one perfect cleavage", tests: ["fiber-optic"], ore: "boron", uses: ["source of boron for borax, glass and detergents"], tip: "“TV rock”: polished pieces project the text underneath to the top surface." }),
  m({ id: "tourmaline", n: 2, name: "Tourmaline", aliases: ["schorl"], chemClass: "Silicate", group: "Cyclosilicate", formula: "(Na,Ca)(Mg,Fe,Li,Al)₃Al₆(BO₃)₃Si₆O₁₈(OH)₄", hardness: [7, 7.5], sg: [3.0, 3.3], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["black", "green", "pink"], system: "Hexagonal (trigonal)", breakage: "no cleavage; uneven to conchoidal fracture", tests: ["striations"], uses: ["gemstone", "piezoelectric pressure gauges"], tip: "Long prisms with a rounded triangular cross-section and lengthwise striations." }),
  m({ id: "azurite", n: 3, name: "Azurite", chemClass: "Carbonate", formula: "Cu₃(CO₃)₂(OH)₂", hardness: [3.5, 4], sg: [3.7, 3.9], streak: "light blue", luster: "nonmetallic", lusterDesc: "vitreous to dull", colors: ["deep blue"], system: "Monoclinic", breakage: "good cleavage; conchoidal fracture", tests: ["effervesces"], ore: "copper", uses: ["minor copper ore", "historic blue pigment"], tip: "Deep azure blue, often with green malachite; both fizz in acid." }),
  m({ id: "calcite", n: 4, name: "Calcite", chemClass: "Carbonate", formula: "CaCO₃", hardness: [3, 3], sg: [2.7, 2.7], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["white", "colorless", "yellow", "orange"], system: "Hexagonal (trigonal)", breakage: "perfect rhombohedral cleavage in 3 directions not at 90°", tests: ["effervesces", "double-refraction", "fluorescent"], uses: ["cement and lime", "agricultural lime", "optical crystals (Iceland spar)"], tip: "Breaks into rhombs, scratches with a knife, and fizzes in cold acid." }),
  m({ id: "dolomite", n: 5, name: "Dolomite", chemClass: "Carbonate", formula: "CaMg(CO₃)₂", hardness: [3.5, 4], sg: [2.8, 2.9], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous to pearly", colors: ["white", "pink", "gray"], system: "Hexagonal (trigonal)", breakage: "perfect rhombohedral cleavage in 3 directions", tests: ["effervesces-powdered"], ore: "magnesium", uses: ["source of magnesium", "building stone", "steel flux"], tip: "Looks like calcite, but only fizzes once scratched to powder; crystals are often curved (“saddle” shape)." }),
  m({ id: "malachite", n: 6, name: "Malachite", chemClass: "Carbonate", formula: "Cu₂CO₃(OH)₂", hardness: [3.5, 4], sg: [3.6, 4.0], streak: "light green", luster: "nonmetallic", lusterDesc: "silky to dull", colors: ["green"], system: "Monoclinic", breakage: "rarely seen cleavage; usually banded masses", tests: ["effervesces"], ore: "copper", uses: ["copper ore", "ornamental stone", "historic green pigment"], tip: "Banded light and dark green, with a light green streak." }),
  m({ id: "copper", n: 7, name: "Copper", chemClass: "Native element", formula: "Cu", hardness: [2.5, 3], sg: [8.9, 8.9], streak: "copper-red, shiny", luster: "metallic", lusterDesc: "metallic", colors: ["copper-red", "brown (tarnished)"], system: "Isometric", breakage: "no cleavage; hackly fracture", tests: ["malleable", "high-density"], ore: "copper", uses: ["electrical wire", "plumbing", "alloys (brass, bronze)"], tip: "Very heavy, bends instead of breaking, and may have a green tarnish." }),
  m({ id: "graphite", n: 8, name: "Graphite", chemClass: "Native element", formula: "C", hardness: [1, 2], sg: [2.1, 2.3], streak: "gray-black", luster: "metallic", lusterDesc: "metallic to dull", colors: ["steel gray", "black"], system: "Hexagonal", breakage: "perfect basal cleavage in 1 direction", tests: ["marks-paper", "soapy-feel"], ore: "carbon", uses: ["pencil “lead”", "lubricant", "batteries and electrodes"], tip: "Soft and greasy, and writes on paper. Compare hematite and magnetite, which are much harder." }),
  m({ id: "sulfur", n: 9, name: "Sulfur", chemClass: "Native element", formula: "S", hardness: [1.5, 2.5], sg: [2.0, 2.1], streak: "pale yellow", luster: "nonmetallic", lusterDesc: "resinous to greasy", colors: ["yellow"], system: "Orthorhombic", breakage: "brittle; conchoidal to uneven fracture", tests: [], uses: ["sulfuric acid", "fertilizer", "rubber vulcanization"], tip: "Bright yellow, very light, and may smell faintly of rotten eggs." }),
  m({ id: "fluorite", n: 10, name: "Fluorite", chemClass: "Halide", formula: "CaF₂", hardness: [4, 4], sg: [3.0, 3.3], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["purple", "green", "colorless", "yellow", "blue"], system: "Isometric", breakage: "perfect octahedral cleavage in 4 directions", tests: ["fluorescent"], uses: ["flux in steelmaking", "hydrofluoric acid", "toothpaste fluoride"], tip: "Cubic crystals, often purple or green, hardness 4 on the Mohs scale." }),
  m({ id: "halite", n: 11, name: "Halite", chemClass: "Halide", formula: "NaCl", hardness: [2.5, 2.5], sg: [2.1, 2.2], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["colorless", "white", "pink"], system: "Isometric", breakage: "perfect cubic cleavage in 3 directions at 90°", tests: ["salty-taste"], uses: ["table salt", "road salt", "chemical industry"], tip: "Cubic cleavage plus a salty taste. Calcite also cleaves well, but not at 90°." }),
  m({ id: "bauxite", n: 12, name: "Bauxite", chemClass: "Mineraloid", formula: "mixture of Al(OH)₃ and AlO(OH) minerals", hardness: [1, 3], sg: [2.0, 2.5], streak: "white to reddish brown", luster: "nonmetallic", lusterDesc: "earthy, dull", colors: ["reddish brown", "tan", "white"], system: "None (mixture)", breakage: "earthy; often pisolitic (pea-sized grains)", tests: ["earthy-smell"], ore: "aluminum", uses: ["the main ore of aluminum"], tip: "Earthy rock with rounded pea-like grains. Forms by tropical weathering." }),
  m({ id: "corundum", n: 13, name: "Corundum", chemClass: "Oxide", formula: "Al₂O₃", hardness: [9, 9], sg: [3.9, 4.1], streak: "none (harder than the streak plate)", luster: "nonmetallic", lusterDesc: "adamantine to vitreous", colors: ["gray", "brown", "red", "blue"], system: "Hexagonal (trigonal)", breakage: "no cleavage; parting; conchoidal fracture", tests: ["high-density"], uses: ["abrasives (emery)", "gemstones: ruby and sapphire"], tip: "Barrel-shaped hexagonal crystals, hardness 9: it scratches everything on the list." }),
  m({ id: "limonite-goethite", n: 14, name: "Limonite/Goethite", aliases: ["Limonite", "Goethite"], chemClass: "Hydroxide", formula: "FeO(OH)·nH₂O", hardness: [4, 5.5], sg: [3.3, 4.3], streak: "yellow-brown", luster: "submetallic", lusterDesc: "earthy to submetallic", colors: ["yellow-brown", "dark brown"], system: "Orthorhombic (goethite); limonite is amorphous", breakage: "earthy to uneven fracture", tests: [], ore: "iron", uses: ["iron ore", "yellow ochre pigment"], tip: "Rusty brown masses with a yellow-brown streak. Hematite's streak is red-brown." }),
  m({ id: "hematite", n: 15, name: "Hematite", chemClass: "Oxide", formula: "Fe₂O₃", hardness: [5, 6.5], sg: [4.9, 5.3], streak: "red-brown", luster: "metallic", lusterDesc: "metallic to earthy", colors: ["steel gray", "red", "black"], system: "Hexagonal (trigonal)", breakage: "no cleavage; uneven fracture", tests: ["high-density"], ore: "iron", uses: ["the main iron ore", "red pigment", "polishing powder"], tip: "Gray-black or red, but its streak is always red-brown. Usually not magnetic." }),
  m({ id: "magnetite", n: 16, name: "Magnetite", chemClass: "Oxide", formula: "Fe₃O₄", hardness: [5.5, 6.5], sg: [5.2, 5.2], streak: "black", luster: "metallic", lusterDesc: "metallic", colors: ["black"], system: "Isometric", breakage: "no cleavage; uneven fracture", tests: ["magnetic", "high-density"], ore: "iron", uses: ["iron ore", "lodestones and compasses"], tip: "Black, heavy, black streak, and it attracts a magnet." }),
  m({ id: "apatite", n: 17, name: "Apatite", chemClass: "Phosphate", formula: "Ca₅(PO₄)₃(F,Cl,OH)", hardness: [5, 5], sg: [3.1, 3.2], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["green", "blue", "yellow", "brown"], system: "Hexagonal", breakage: "poor cleavage; conchoidal fracture", tests: ["fluorescent"], ore: "phosphorus", uses: ["phosphate fertilizer", "the mineral of teeth and bones"], tip: "Hexagonal prisms at hardness 5, the Mohs index mineral that a knife just scratches." }),
  m({ id: "barite", n: 18, name: "Barite", chemClass: "Sulfate", formula: "BaSO₄", hardness: [3, 3.5], sg: [4.3, 4.6], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous to pearly", colors: ["white", "colorless", "blue", "tan"], system: "Orthorhombic", breakage: "perfect cleavage", tests: ["high-density"], ore: "barium", uses: ["drilling mud", "barium for X-ray contrast", "white pigment"], tip: "Looks ordinary but feels surprisingly heavy for a light-colored mineral." }),
  m({ id: "alabaster", n: 19, name: "Alabaster (Gypsum)", aliases: ["Alabaster"], varietyOf: "Gypsum", chemClass: "Sulfate", formula: "CaSO₄·2H₂O", hardness: [2, 2], sg: [2.3, 2.3], streak: "white", luster: "nonmetallic", lusterDesc: "dull to sugary", colors: ["white", "pink"], system: "Monoclinic", breakage: "massive, fine-grained; uneven fracture", tests: [], uses: ["carving stone"], tip: "Fine-grained massive gypsum. Your fingernail scratches it." }),
  m({ id: "satin-spar", n: 20, name: "Satin Spar (Gypsum)", aliases: ["Satin Spar"], varietyOf: "Gypsum", chemClass: "Sulfate", formula: "CaSO₄·2H₂O", hardness: [2, 2], sg: [2.3, 2.3], streak: "white", luster: "nonmetallic", lusterDesc: "silky", colors: ["white"], system: "Monoclinic", breakage: "fibrous", tests: [], uses: ["ornamental"], tip: "Fibrous gypsum with a silky sheen. Unlike ulexite, it doesn't transmit an image." }),
  m({ id: "selenite", n: 21, name: "Selenite (Gypsum)", aliases: ["Selenite"], varietyOf: "Gypsum", chemClass: "Sulfate", formula: "CaSO₄·2H₂O", hardness: [2, 2], sg: [2.3, 2.3], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous to pearly", colors: ["colorless", "white"], system: "Monoclinic", breakage: "perfect cleavage in 1 direction into thin flexible (non-elastic) plates", tests: [], uses: ["plaster and drywall (gypsum)"], tip: "Clear gypsum plates. They bend but don't spring back the way mica does." }),
  m({ id: "bornite", n: 22, name: "Bornite", aliases: ["peacock ore"], chemClass: "Sulfide", formula: "Cu₅FeS₄", hardness: [3, 3], sg: [5.0, 5.1], streak: "gray-black", luster: "metallic", lusterDesc: "metallic", colors: ["bronze (fresh)", "purple", "blue"], system: "Orthorhombic", breakage: "no cleavage; uneven fracture", tests: ["iridescent-tarnish"], ore: "copper", uses: ["copper ore"], tip: "“Peacock ore”: a purple-blue iridescent tarnish over a bronze interior." }),
  m({ id: "beryl", n: 23, name: "Beryl", chemClass: "Silicate", group: "Cyclosilicate", formula: "Be₃Al₂Si₆O₁₈", hardness: [7.5, 8], sg: [2.6, 2.8], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["green", "pale blue", "yellow", "white"], system: "Hexagonal", breakage: "poor cleavage; conchoidal fracture", tests: [], ore: "beryllium", uses: ["ore of beryllium", "gems: emerald, aquamarine"], tip: "Six-sided prisms with flat ends, harder than quartz." }),
  m({ id: "epidote", n: 24, name: "Epidote", chemClass: "Silicate", group: "Sorosilicate", formula: "Ca₂(Al,Fe)₃(SiO₄)(Si₂O₇)O(OH)", hardness: [6, 7], sg: [3.3, 3.5], streak: "grayish white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["pistachio green", "yellow-green"], system: "Monoclinic", breakage: "perfect cleavage in 1 direction", tests: ["striations"], uses: ["collector specimens", "indicator of low-grade metamorphism"], tip: "A distinctive pistachio green, often in metamorphic rocks." }),
  m({ id: "kaolinite", n: 25, name: "Kaolinite", aliases: ["kaolin"], chemClass: "Silicate", group: "Phyllosilicate (clay)", formula: "Al₂Si₂O₅(OH)₄", hardness: [2, 2.5], sg: [2.6, 2.6], streak: "white", luster: "nonmetallic", lusterDesc: "earthy, dull", colors: ["white", "cream"], system: "Triclinic", breakage: "earthy; crumbly masses", tests: ["earthy-smell"], uses: ["porcelain and ceramics", "paper coating", "cosmetics"], tip: "Chalky white clay that smells earthy and gets plastic when wet. It doesn't fizz the way chalk does." }),
  m({ id: "kyanite", n: 26, name: "Kyanite", chemClass: "Silicate", group: "Nesosilicate", formula: "Al₂SiO₅", hardness: [4.5, 7], sg: [3.5, 3.7], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous to pearly", colors: ["blue", "gray"], system: "Triclinic", breakage: "perfect cleavage in 1 direction; bladed", tests: [], uses: ["refractories and spark plugs", "high-pressure metamorphic index mineral"], tip: "Blue blades whose hardness changes with direction: about 4.5 along the blade and 6.5–7 across it." }),
  m({ id: "olivine", n: 27, name: "Olivine", aliases: ["peridot"], chemClass: "Silicate", group: "Nesosilicate", formula: "(Mg,Fe)₂SiO₄", hardness: [6.5, 7], sg: [3.2, 4.4], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["olive green", "yellow-green"], system: "Orthorhombic", breakage: "no good cleavage; conchoidal fracture", tests: [], uses: ["gem peridot", "refractory sand"], tip: "Glassy green grains, the first mineral to crystallize in Bowen's reaction series." }),
  m({ id: "sodalite", n: 28, name: "Sodalite", chemClass: "Silicate", group: "Tectosilicate (feldspathoid)", formula: "Na₈Al₆Si₆O₂₄Cl₂", hardness: [5.5, 6], sg: [2.1, 2.3], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous to greasy", colors: ["royal blue", "white veins"], system: "Isometric", breakage: "poor cleavage; uneven fracture", tests: ["fluorescent"], uses: ["ornamental stone and beads"], tip: "Royal blue with white veins and a white streak. Azurite is softer and fizzes." }),
  m({ id: "staurolite", n: 29, name: "Staurolite", chemClass: "Silicate", group: "Nesosilicate", formula: "Fe₂Al₉Si₄O₂₃(OH)", hardness: [7, 7.5], sg: [3.7, 3.8], streak: "white to grayish", luster: "nonmetallic", lusterDesc: "vitreous to resinous", colors: ["reddish brown", "dark brown"], system: "Monoclinic (pseudo-orthorhombic)", breakage: "poor cleavage; subconchoidal fracture", tests: [], uses: ["“fairy cross” souvenirs", "medium-grade metamorphic index mineral"], tip: "Brown prisms, often twinned into crosses at 90° or 60°." }),
  m({ id: "stilbite", n: 30, name: "Stilbite", chemClass: "Silicate", group: "Tectosilicate (zeolite)", formula: "NaCa₄(Si₂₇Al₉)O₇₂·28H₂O", hardness: [3.5, 4], sg: [2.1, 2.2], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous to pearly", colors: ["white", "peach", "pink"], system: "Monoclinic", breakage: "perfect cleavage in 1 direction", tests: [], uses: ["collector specimens"], tip: "Bow-tie shaped clusters of crystals, often lining holes in basalt." }),
  m({ id: "talc", n: 31, name: "Talc", chemClass: "Silicate", group: "Phyllosilicate", formula: "Mg₃Si₄O₁₀(OH)₂", hardness: [1, 1], sg: [2.7, 2.8], streak: "white", luster: "nonmetallic", lusterDesc: "pearly to greasy", colors: ["white", "pale green", "gray"], system: "Monoclinic", breakage: "perfect cleavage in 1 direction", tests: ["soapy-feel"], uses: ["talcum powder", "paint, paper and plastic filler"], tip: "Hardness 1, the softest mineral on the Mohs scale. It feels soapy." }),
  m({ id: "topaz", n: 32, name: "Topaz", chemClass: "Silicate", group: "Nesosilicate", formula: "Al₂SiO₄(F,OH)₂", hardness: [8, 8], sg: [3.5, 3.6], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["colorless", "yellow", "light blue", "brown"], system: "Orthorhombic", breakage: "perfect basal cleavage in 1 direction", tests: [], uses: ["gemstone"], tip: "Hardness 8, harder than quartz, with one perfect cleavage across the crystal." }),
  m({ id: "hornblende", n: 33, name: "Hornblende", chemClass: "Silicate", group: "Inosilicate (amphibole)", formula: "Ca₂(Mg,Fe,Al)₅(Al,Si)₈O₂₂(OH)₂", hardness: [5, 6], sg: [3.0, 3.4], streak: "pale gray-green", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["black", "dark green"], system: "Monoclinic", breakage: "2 cleavages at about 56° and 124°", tests: [], uses: ["rock-forming mineral (granite, diorite, amphibolite)"], tip: "Black and elongated. Cleavages at 56°/124° tell it apart from augite (about 90°)." }),
  m({ id: "tremolite", n: 34, name: "Tremolite", chemClass: "Silicate", group: "Inosilicate (amphibole)", formula: "Ca₂Mg₅Si₈O₂₂(OH)₂", hardness: [5, 6], sg: [2.9, 3.1], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous to silky", colors: ["white", "gray", "pale green"], system: "Monoclinic", breakage: "2 cleavages at about 56° and 124°; often fibrous", tests: [], uses: ["a form of asbestos (hazardous)", "metamorphosed dolomite indicator"], tip: "A light-colored amphibole, often in long fibrous or bladed crystals." }),
  m({ id: "albite", n: 35, name: "Albite", chemClass: "Silicate", group: "Tectosilicate (plagioclase feldspar)", formula: "NaAlSi₃O₈", hardness: [6, 6.5], sg: [2.6, 2.6], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["white", "colorless"], system: "Triclinic", breakage: "2 cleavages at about 90°", tests: ["striations"], uses: ["ceramics and glass"], tip: "White sodium plagioclase. Look for fine parallel striations on cleavage faces." }),
  m({ id: "labradorite", n: 36, name: "Labradorite", chemClass: "Silicate", group: "Tectosilicate (plagioclase feldspar)", formula: "(Ca,Na)(Al,Si)₄O₈", hardness: [6, 6.5], sg: [2.7, 2.7], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["dark gray", "blue-gray"], system: "Triclinic", breakage: "2 cleavages at about 90°", tests: ["play-of-color", "striations"], uses: ["ornamental and building stone"], tip: "Gray plagioclase that flashes blue and green when you tilt it." }),
  m({ id: "amazonite", n: 37, name: "Amazonite", varietyOf: "Microcline", chemClass: "Silicate", group: "Tectosilicate (potassium feldspar)", formula: "KAlSi₃O₈", hardness: [6, 6.5], sg: [2.6, 2.6], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["blue-green", "green"], system: "Triclinic", breakage: "2 cleavages at about 90°", tests: [], uses: ["ornamental stone and beads"], tip: "The blue-green variety of microcline, often with white streaks." }),
  m({ id: "microcline", n: 38, name: "Microcline", chemClass: "Silicate", group: "Tectosilicate (potassium feldspar)", formula: "KAlSi₃O₈", hardness: [6, 6.5], sg: [2.5, 2.6], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["salmon pink", "white", "tan"], system: "Triclinic", breakage: "2 cleavages at about 90°", tests: [], uses: ["ceramics and glass", "rock-forming mineral in granite and pegmatite"], tip: "Pink potassium feldspar with blocky cleavage and no striations." }),
  m({ id: "almandine", n: 39, name: "Almandine", aliases: ["Almandine garnet", "Garnet"], chemClass: "Silicate", group: "Nesosilicate (garnet)", formula: "Fe₃Al₂(SiO₄)₃", hardness: [7, 7.5], sg: [4.1, 4.3], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["deep red", "reddish brown"], system: "Isometric", breakage: "no cleavage; conchoidal fracture", tests: [], uses: ["abrasives (garnet sandpaper, waterjet cutting)", "gemstone"], tip: "Dark red, ball-shaped crystals (dodecahedra) harder than quartz. Common in schist." }),
  m({ id: "biotite", n: 40, name: "Biotite", aliases: ["black mica"], chemClass: "Silicate", group: "Phyllosilicate (mica)", formula: "K(Mg,Fe)₃AlSi₃O₁₀(OH,F)₂", hardness: [2.5, 3], sg: [2.8, 3.4], streak: "white to gray", luster: "nonmetallic", lusterDesc: "vitreous to pearly", colors: ["black", "dark brown"], system: "Monoclinic", breakage: "perfect basal cleavage in 1 direction", tests: ["thin-sheets"], uses: ["rock-forming mineral"], tip: "Black mica: it peels into thin sheets that spring back when bent." }),
  m({ id: "muscovite", n: 41, name: "Muscovite", aliases: ["white mica"], chemClass: "Silicate", group: "Phyllosilicate (mica)", formula: "KAl₂(AlSi₃O₁₀)(OH)₂", hardness: [2, 2.5], sg: [2.8, 2.9], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous to pearly", colors: ["colorless", "silvery", "pale brown"], system: "Monoclinic", breakage: "perfect basal cleavage in 1 direction", tests: ["thin-sheets"], uses: ["electrical insulators", "glitter and cosmetics"], tip: "Clear-to-silvery mica in thin elastic sheets." }),
  m({ id: "augite", n: 42, name: "Augite", chemClass: "Silicate", group: "Inosilicate (pyroxene)", formula: "(Ca,Na)(Mg,Fe,Al,Ti)(Si,Al)₂O₆", hardness: [5.5, 6], sg: [3.2, 3.6], streak: "gray-green to white", luster: "nonmetallic", lusterDesc: "vitreous to dull", colors: ["dark green", "black"], system: "Monoclinic", breakage: "2 cleavages at about 87° and 93°", tests: [], uses: ["rock-forming mineral (basalt, gabbro)"], tip: "Stubby dark crystals with cleavages near 90°. Hornblende's are at 56°/124°." }),
  m({ id: "rhodonite", n: 43, name: "Rhodonite", chemClass: "Silicate", group: "Inosilicate (pyroxenoid)", formula: "(Mn,Fe,Mg,Ca)SiO₃", hardness: [5.5, 6.5], sg: [3.4, 3.7], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["rose pink", "black veins"], system: "Triclinic", breakage: "2 cleavages near 90°", tests: [], uses: ["ornamental stone"], tip: "Rose pink with black manganese oxide veins. Rose quartz has no black veins." }),
  m({ id: "agate", n: 44, name: "Agate", varietyOf: "Quartz (chalcedony)", chemClass: "Silicate", group: "Tectosilicate (quartz)", formula: "SiO₂", hardness: [6.5, 7], sg: [2.6, 2.6], streak: "white", luster: "nonmetallic", lusterDesc: "waxy", colors: ["banded", "gray", "red", "blue"], system: "Hexagonal (microcrystalline)", breakage: "no cleavage; conchoidal fracture", tests: [], uses: ["ornamental stone", "mortars and pestles"], tip: "Concentric color bands of microcrystalline quartz, formed in cavities." }),
  m({ id: "amethyst", n: 45, name: "Amethyst", varietyOf: "Quartz", chemClass: "Silicate", group: "Tectosilicate (quartz)", formula: "SiO₂", hardness: [7, 7], sg: [2.65, 2.65], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["purple"], system: "Hexagonal (trigonal)", breakage: "no cleavage; conchoidal fracture", tests: [], uses: ["gemstone"], tip: "Purple quartz. Iron impurities plus natural radiation cause the color." }),
  m({ id: "tiger-eye", n: 46, name: "Tiger Eye", aliases: ["Tiger's Eye", "Tigers Eye"], varietyOf: "Quartz", chemClass: "Silicate", group: "Tectosilicate (quartz)", formula: "SiO₂ (replacing crocidolite fibers)", hardness: [6.5, 7], sg: [2.6, 2.7], streak: "white to yellow-brown", luster: "nonmetallic", lusterDesc: "silky", colors: ["golden brown", "yellow-brown"], system: "Hexagonal (fibrous)", breakage: "fibrous; uneven fracture", tests: ["chatoyancy"], uses: ["gemstone and beads"], tip: "Golden quartz that replaced asbestos fibers. A band of light rolls across it as you turn it." }),
  m({ id: "rock-crystal", n: 47, name: "Rock Crystal", aliases: ["clear quartz"], varietyOf: "Quartz", chemClass: "Silicate", group: "Tectosilicate (quartz)", formula: "SiO₂", hardness: [7, 7], sg: [2.65, 2.65], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["colorless"], system: "Hexagonal (trigonal)", breakage: "no cleavage; conchoidal fracture", tests: ["striations"], uses: ["oscillators in electronics (piezoelectric)", "optics"], tip: "Clear six-sided prisms with horizontal striations, hardness 7." }),
  m({ id: "white-quartzite", n: 48, name: "White Quartzite", aliases: ["White Quartz"], varietyOf: "Quartz", chemClass: "Silicate", group: "Tectosilicate (quartz)", formula: "SiO₂", hardness: [7, 7], sg: [2.65, 2.65], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous to sugary", colors: ["white"], system: "Hexagonal (massive)", breakage: "no cleavage; conchoidal to granular fracture", tests: [], uses: ["glass and silica sand", "building stone"], tip: "Listed with the minerals in the kit: massive white quartz with a sugary, granular look." }),
  m({ id: "milky-quartz", n: 49, name: "Milky Quartz", varietyOf: "Quartz", chemClass: "Silicate", group: "Tectosilicate (quartz)", formula: "SiO₂", hardness: [7, 7], sg: [2.65, 2.65], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous to greasy", colors: ["white"], system: "Hexagonal (trigonal)", breakage: "no cleavage; conchoidal fracture", tests: [], uses: ["common vein quartz", "gold is sometimes found in quartz veins"], tip: "Cloudy white quartz. Tiny fluid inclusions scatter the light." }),
  m({ id: "rose-quartz", n: 50, name: "Rose Quartz", varietyOf: "Quartz", chemClass: "Silicate", group: "Tectosilicate (quartz)", formula: "SiO₂", hardness: [7, 7], sg: [2.65, 2.65], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["pink"], system: "Hexagonal (usually massive)", breakage: "no cleavage; conchoidal fracture", tests: [], uses: ["ornamental stone"], tip: "Massive pale pink quartz, usually without crystal faces." }),
  m({ id: "smoky-quartz", n: 51, name: "Smoky Quartz", varietyOf: "Quartz", chemClass: "Silicate", group: "Tectosilicate (quartz)", formula: "SiO₂", hardness: [7, 7], sg: [2.65, 2.65], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["smoky brown", "gray"], system: "Hexagonal (trigonal)", breakage: "no cleavage; conchoidal fracture", tests: [], uses: ["gemstone"], tip: "Transparent brown-gray quartz, colored by natural radiation acting on aluminum." }),
  m({ id: "citrine", n: 52, name: "Citrine", varietyOf: "Quartz", chemClass: "Silicate", group: "Tectosilicate (quartz)", formula: "SiO₂", hardness: [7, 7], sg: [2.65, 2.65], streak: "white", luster: "nonmetallic", lusterDesc: "vitreous", colors: ["yellow", "orange"], system: "Hexagonal (trigonal)", breakage: "no cleavage; conchoidal fracture", tests: [], uses: ["gemstone"], tip: "Yellow-orange quartz. Much commercial citrine is heat-treated amethyst." }),
];

export const ROCKS: readonly Rock[] = [
  // Metamorphic
  r({ id: "amphibolite", n: 53, name: "Amphibolite", rockType: "metamorphic", subtype: "foliated (weakly) to nonfoliated", texture: "medium to coarse grains; may show a weak lineation", composition: "mafic", minerals: ["hornblende", "plagioclase"], parent: "basalt or gabbro", grade: "medium–high", environment: "regional metamorphism of mafic rock", uses: ["dimension stone", "crushed aggregate"], tip: "Dark, heavy, made mostly of shiny black hornblende needles." }),
  r({ id: "gneiss", n: 54, name: "Gneiss", rockType: "metamorphic", subtype: "foliated", texture: "gneissic banding: alternating light and dark mineral bands", composition: "felsic to intermediate", minerals: ["quartz", "feldspar", "biotite", "hornblende"], parent: "granite or shale", grade: "high", environment: "high-grade regional metamorphism deep in mountain belts", uses: ["building stone", "countertops"], tip: "Coarse light and dark stripes. The highest grade in the shale → slate → phyllite → schist → gneiss sequence." }),
  r({ id: "marble", n: 55, name: "Marble", rockType: "metamorphic", subtype: "nonfoliated", texture: "interlocking crystals of calcite or dolomite (sugary)", composition: "calcite and/or dolomite", minerals: ["calcite", "dolomite"], parent: "limestone or dolostone", grade: "low–medium", environment: "contact or regional metamorphism of carbonate rock", tests: ["effervesces"], uses: ["sculpture", "building stone", "lime"], tip: "Sugary crystals, soft enough to scratch with a knife, and fizzes in acid. Quartzite does neither." }),
  r({ id: "phyllite", n: 56, name: "Phyllite", rockType: "metamorphic", subtype: "foliated", texture: "fine-grained with a silky sheen (phyllitic luster), often wavy", composition: "fine mica, chlorite, quartz", minerals: ["muscovite", "chlorite", "quartz"], parent: "shale (via slate)", grade: "low–medium", environment: "low-grade regional metamorphism", uses: ["decorative stone"], tip: "Between slate and schist: shiny like satin, but the grains are too small to see." }),
  r({ id: "quartzite", n: 57, name: "Quartzite", rockType: "metamorphic", subtype: "nonfoliated", texture: "interlocking quartz grains; breaks through the grains", composition: "quartz", minerals: ["quartz"], parent: "quartz sandstone", grade: "medium", environment: "regional or contact metamorphism of sandstone", uses: ["countertops", "railroad ballast", "silica"], tip: "Hard (scratches glass), doesn't fizz, and breaks across the grains rather than around them." }),
  r({ id: "garnet-schist", n: 58, name: "Garnet Schist", rockType: "metamorphic", subtype: "foliated", texture: "schistosity: visible platy mica with garnet porphyroblasts", composition: "mica, quartz, garnet", minerals: ["muscovite", "biotite", "almandine garnet", "quartz"], parent: "shale", grade: "medium–high", environment: "regional metamorphism", uses: ["garnet abrasives"], tip: "Sparkly mica schist dotted with red garnet crystals." }),
  r({ id: "mica-schist", n: 59, name: "Mica Schist", rockType: "metamorphic", subtype: "foliated", texture: "schistosity: coarse, visible mica flakes aligned in layers", composition: "mica and quartz", minerals: ["muscovite", "biotite", "quartz"], parent: "shale (via slate and phyllite)", grade: "medium", environment: "regional metamorphism", uses: ["landscaping stone"], tip: "Glittery with flakes of mica you can see. Coarser than phyllite." }),
  r({ id: "talc-schist", n: 60, name: "Talc Schist (Soapstone)", aliases: ["Soapstone", "Talc Schist"], rockType: "metamorphic", subtype: "foliated (weakly) to massive", texture: "soft, fine-grained, soapy", composition: "talc", minerals: ["talc", "chlorite", "magnesite"], parent: "ultramafic rock (peridotite) or dolostone", grade: "low–medium", environment: "metamorphism with hot fluids (metasomatism) of magnesium-rich rock", tests: ["soapy-feel"], uses: ["carvings", "countertops", "stoves"], tip: "So soft your fingernail scratches it, and it feels soapy." }),
  r({ id: "serpentinite", n: 61, name: "Serpentinite", rockType: "metamorphic", subtype: "nonfoliated (often sheared)", texture: "fine-grained, waxy to slick surfaces", composition: "serpentine minerals (ultramafic)", minerals: ["serpentine", "magnetite"], parent: "peridotite or dunite", grade: "low", environment: "hydration of mantle rock at seafloor spreading centers and subduction zones (ophiolites)", uses: ["decorative stone", "source of chrysotile asbestos (hazardous)"], tip: "Mottled green and waxy like a snake's skin. The state rock of California." }),
  r({ id: "slate", n: 62, name: "Slate", rockType: "metamorphic", subtype: "foliated", texture: "very fine-grained; slaty cleavage into flat sheets; dull", composition: "clay minerals and fine mica", minerals: ["clay minerals", "fine mica", "quartz"], parent: "shale or mudstone", grade: "low", environment: "low-grade regional metamorphism", uses: ["roofing", "flooring", "chalkboards"], tip: "Splits into flat sheets and rings when tapped. Shale crumbles and sounds dull." }),
  // Igneous
  r({ id: "andesite", n: 63, name: "Andesite", rockType: "igneous", subtype: "extrusive", texture: "aphanitic, often porphyritic", composition: "intermediate", minerals: ["plagioclase", "hornblende", "pyroxene"], environment: "volcanoes above subduction zones (named for the Andes)", uses: ["construction aggregate"], tip: "Medium gray volcanic rock, often with small phenocrysts. The fine-grained version of diorite." }),
  r({ id: "basalt", n: 64, name: "Basalt", rockType: "igneous", subtype: "extrusive", texture: "aphanitic; may be vesicular", composition: "mafic", minerals: ["plagioclase", "pyroxene", "olivine"], environment: "lava flows, oceanic crust, hot spots (Hawaii), flood basalts", uses: ["crushed stone", "rock wool insulation"], tip: "Dark, fine-grained and heavy. The fine-grained version of gabbro, and the most common rock in oceanic crust." }),
  r({ id: "diorite", n: 65, name: "Diorite", rockType: "igneous", subtype: "intrusive", texture: "phaneritic (coarse)", composition: "intermediate", minerals: ["plagioclase", "hornblende", "biotite"], environment: "plutons beneath volcanic arcs", uses: ["building stone", "ancient sculpture"], tip: "“Salt and pepper” black and white with little or no quartz. The coarse version of andesite." }),
  r({ id: "gabbro", n: 66, name: "Gabbro", rockType: "igneous", subtype: "intrusive", texture: "phaneritic (coarse)", composition: "mafic", minerals: ["plagioclase", "pyroxene", "olivine"], environment: "lower oceanic crust, layered intrusions", uses: ["“black granite” countertops", "crushed stone"], tip: "Dark and coarse-grained: the slow-cooled version of basalt." }),
  r({ id: "granite", n: 67, name: "Granite", rockType: "igneous", subtype: "intrusive", texture: "phaneritic (coarse)", composition: "felsic", minerals: ["quartz", "potassium feldspar", "plagioclase", "biotite", "hornblende"], environment: "batholiths in continental crust", uses: ["countertops", "monuments", "building stone"], tip: "Light-colored and coarse, with glassy gray quartz and pink or white feldspar. The coarse version of rhyolite." }),
  r({ id: "obsidian", n: 68, name: "Obsidian", rockType: "igneous", subtype: "extrusive", texture: "glassy; conchoidal fracture", composition: "felsic", minerals: ["volcanic glass (no crystals)"], environment: "rhyolitic lava that cooled too quickly for crystals to grow", uses: ["arrowheads and blades", "surgical scalpels"], tip: "Black volcanic glass with sharp, shell-shaped (conchoidal) fractures." }),
  r({ id: "peridotite", n: 69, name: "Peridotite", rockType: "igneous", subtype: "intrusive", texture: "phaneritic (coarse)", composition: "ultramafic", minerals: ["olivine", "pyroxene"], environment: "Earth's upper mantle; exposed in ophiolites", uses: ["source of chromite and nickel", "diamonds come up in a related rock (kimberlite)"], tip: "Green, heavy and coarse, mostly olivine. The main rock of the upper mantle." }),
  r({ id: "pumice", n: 70, name: "Pumice", rockType: "igneous", subtype: "extrusive", texture: "vesicular and glassy (frothy)", composition: "felsic", minerals: ["volcanic glass"], environment: "gas-rich explosive eruptions", tests: ["floats"], uses: ["abrasive (pumice stone)", "lightweight concrete"], tip: "Light-colored and full of tiny holes. It usually floats on water." }),
  r({ id: "rhyolite", n: 71, name: "Rhyolite", rockType: "igneous", subtype: "extrusive", texture: "aphanitic, often porphyritic or flow-banded", composition: "felsic", minerals: ["quartz", "potassium feldspar", "plagioclase"], environment: "explosive continental volcanoes (Yellowstone)", uses: ["crushed stone"], tip: "Light-colored (pink, tan, gray) and fine-grained, often with flow bands. The fine-grained version of granite." }),
  r({ id: "scoria", n: 72, name: "Scoria", rockType: "igneous", subtype: "extrusive", texture: "vesicular (large holes)", composition: "mafic", minerals: ["basaltic glass", "plagioclase", "pyroxene"], environment: "cinder cones and the tops of basalt flows", uses: ["landscaping (“lava rock”)", "grill rocks"], tip: "Dark red or black, with bigger holes than pumice. It usually sinks." }),
  r({ id: "syenite", n: 73, name: "Syenite", rockType: "igneous", subtype: "intrusive", texture: "phaneritic (coarse)", composition: "intermediate (alkali-rich)", minerals: ["potassium feldspar", "hornblende", "little or no quartz"], environment: "plutons in continental rift zones", uses: ["building stone"], tip: "Looks like granite but has almost no quartz." }),
  r({ id: "tuff", n: 74, name: "Tuff", rockType: "igneous", subtype: "extrusive", texture: "pyroclastic: consolidated volcanic ash and fragments", composition: "felsic (usually)", minerals: ["volcanic glass shards", "crystal and rock fragments"], environment: "ash falls and pyroclastic flows from explosive eruptions", uses: ["building blocks (Easter Island moai)", "dimension stone"], tip: "Light and porous, made of cemented ash, often with visible fragments." }),
  // Sedimentary
  r({ id: "arkose", n: 75, name: "Arkose", rockType: "sedimentary", subtype: "clastic", texture: "sand-sized, angular to subrounded grains", composition: "quartz and more than 25% feldspar", minerals: ["quartz", "potassium feldspar"], energy: 3, environment: "rapid deposition close to a granite source (alluvial fans)", uses: ["building stone"], tip: "Pinkish sandstone full of feldspar grains, a sign it hasn't traveled far." }),
  r({ id: "banded-iron-formation", n: 76, name: "Banded Iron Formation", aliases: ["BIF"], rockType: "sedimentary", subtype: "chemical", texture: "thin alternating layers of iron oxide and chert", composition: "hematite or magnetite and chert", minerals: ["hematite", "magnetite", "chert"], environment: "Precambrian oceans about 2.5–1.8 billion years ago, as oxygen built up in the oceans", tests: ["high-density"], uses: ["the world's main iron ore"], tip: "Red, silver and black stripes. It records the Great Oxidation Event." }),
  r({ id: "breccia", n: 77, name: "Breccia", rockType: "sedimentary", subtype: "clastic", texture: "gravel-sized ANGULAR fragments in a finer matrix", composition: "rock fragments", minerals: ["varied rock fragments"], energy: 5, environment: "little transport: talus slopes, fault zones, collapse", uses: ["decorative stone"], tip: "Like conglomerate, but the pieces are angular because they didn't travel far." }),
  r({ id: "chert-flint", n: 78, name: "Chert/Flint", aliases: ["Chert", "Flint"], rockType: "sedimentary", subtype: "chemical/biochemical", texture: "microcrystalline; conchoidal fracture", composition: "microcrystalline quartz", minerals: ["chalcedony (microcrystalline quartz)"], environment: "nodules in limestone and chalk; deep-sea silica ooze", uses: ["stone tools", "fire starting (flint and steel)"], tip: "Hard (about 7), waxy, breaks with sharp conchoidal fractures. It doesn't fizz." }),
  r({ id: "conglomerate", n: 79, name: "Conglomerate", rockType: "sedimentary", subtype: "clastic", texture: "gravel-sized ROUNDED clasts in a sand matrix", composition: "rock fragments", minerals: ["quartz pebbles", "varied rock fragments"], energy: 5, environment: "high-energy rivers and beaches", uses: ["decorative stone"], tip: "Rounded pebbles cemented together, so the clasts were tumbled by fast water." }),
  r({ id: "diatomite", n: 80, name: "Diatomite", aliases: ["diatomaceous earth"], rockType: "sedimentary", subtype: "biochemical", texture: "very fine, porous, lightweight, chalky", composition: "silica shells of diatoms", minerals: ["opal (amorphous silica)"], environment: "lakes and marine basins with blooming diatoms", tests: ["floats"], uses: ["filters (pools, beer)", "mild abrasive", "insulation"], tip: "Feels like chalk, but it's very light and doesn't fizz because it's silica, not calcite." }),
  r({ id: "dolostone", n: 81, name: "Dolostone", rockType: "sedimentary", subtype: "chemical", texture: "fine to medium crystalline", composition: "dolomite", minerals: ["dolomite"], environment: "limestone altered by magnesium-rich water (dolomitization)", tests: ["effervesces-powdered"], uses: ["crushed stone", "source of magnesium"], tip: "Like limestone, but it only fizzes when powdered." }),
  r({ id: "graywacke", n: 82, name: "Graywacke", rockType: "sedimentary", subtype: "clastic", texture: "poorly sorted, angular sand in a muddy matrix", composition: "quartz, feldspar and rock fragments", minerals: ["quartz", "feldspar", "rock fragments", "clay"], energy: 3, environment: "turbidity currents in deep marine fans", uses: ["road aggregate"], tip: "Dark gray “dirty” sandstone: angular grains in a mud matrix." }),
  r({ id: "sandstone", n: 83, name: "Sandstone", rockType: "sedimentary", subtype: "clastic", texture: "sand-sized grains (1/16–2 mm), well sorted", composition: "mostly quartz", minerals: ["quartz"], energy: 3, environment: "beaches, deserts (dunes), rivers", uses: ["building stone", "aquifer and oil reservoir rock"], tip: "Gritty like sandpaper, with grains you can see. It's the parent rock of quartzite." }),
  r({ id: "shale", n: 84, name: "Shale", rockType: "sedimentary", subtype: "clastic", texture: "clay-sized grains; fissile (splits into thin layers)", composition: "clay minerals", minerals: ["clay minerals", "quartz silt"], energy: 1, environment: "low-energy water: lakes, lagoons, deep ocean, floodplains", uses: ["bricks and cement", "source rock for oil and gas"], tip: "Smooth, splits into thin layers, and formed in quiet water. It's the parent rock of slate." }),
  r({ id: "anthracite", n: 85, name: "Anthracite Coal", aliases: ["Anthracite"], rockType: "sedimentary", subtype: "biochemical (organic)", texture: "hard, shiny, conchoidal fracture", composition: "about 86–97% carbon", minerals: ["organic carbon"], environment: "bituminous coal altered by heat and pressure (sometimes classed as metamorphic)", uses: ["clean-burning fuel", "home heating"], tip: "The highest rank of coal: shiny, hard, and it doesn't dirty your hands." }),
  r({ id: "bituminous", n: 86, name: "Bituminous Coal", aliases: ["Bituminous"], rockType: "sedimentary", subtype: "biochemical (organic)", texture: "banded dull and shiny layers; blocky", composition: "about 45–86% carbon", minerals: ["organic carbon"], environment: "buried swamp plants (peat → lignite → bituminous)", uses: ["electricity generation", "coke for steelmaking"], tip: "Black, layered and dirty to touch. Softer and duller than anthracite." }),
  r({ id: "chalk", n: 87, name: "Chalk", rockType: "sedimentary", subtype: "biochemical", texture: "very fine-grained, soft, porous", composition: "calcite from coccoliths", minerals: ["calcite"], environment: "warm open seas, especially in the Cretaceous (White Cliffs of Dover)", tests: ["effervesces", "marks-paper"], uses: ["agricultural lime", "cement"], tip: "Soft white limestone made of microscopic plankton plates. It fizzes strongly." }),
  r({ id: "coquina", n: 88, name: "Coquina", rockType: "sedimentary", subtype: "biochemical", texture: "loosely cemented shell fragments", composition: "calcite shell debris", minerals: ["calcite", "aragonite"], environment: "high-energy beaches (Florida coast)", tests: ["effervesces"], uses: ["building stone (Castillo de San Marcos)"], tip: "A limestone of broken shells with lots of open space between them." }),
  r({ id: "fossil-limestone", n: 89, name: "Fossil Limestone", aliases: ["Fossiliferous Limestone"], rockType: "sedimentary", subtype: "biochemical", texture: "visible fossils in a fine calcite matrix", composition: "calcite", minerals: ["calcite"], environment: "shallow warm seas and reefs", tests: ["effervesces"], uses: ["cement", "building stone"], tip: "Shells, crinoid stems or brachiopods in a fizzing calcite rock." }),
  r({ id: "oolitic-limestone", n: 90, name: "Oolitic Limestone", rockType: "sedimentary", subtype: "chemical", texture: "ooids: small (under 2 mm) spheres with concentric layers", composition: "calcite", minerals: ["calcite"], environment: "warm, shallow, agitated tropical seas (the Bahamas today)", tests: ["effervesces"], uses: ["building stone (Indiana limestone)"], tip: "Packed with tiny round beads like fish eggs. It fizzes in acid." }),
  r({ id: "travertine", n: 91, name: "Travertine", rockType: "sedimentary", subtype: "chemical", texture: "banded, often porous or with holes", composition: "calcite", minerals: ["calcite", "aragonite"], environment: "precipitated from hot springs and in caves (stalactites)", tests: ["effervesces"], uses: ["tiles and building stone"], tip: "Banded, pitted calcite formed in springs and caves." }),
  r({ id: "rock-salt", n: 92, name: "Rock Salt/Halite", aliases: ["Rock Salt", "Halite rock"], rockType: "sedimentary", subtype: "chemical (evaporite)", texture: "crystalline, interlocking halite", composition: "halite", minerals: ["halite"], environment: "evaporation of seawater or salt lakes", tests: ["salty-taste"], uses: ["road salt", "chemical feedstock"], tip: "An evaporite rock: salty and soluble, with cubic cleavage in the crystals." }),
];

export const SPECIMENS: readonly Specimen[] = [...MINERALS, ...ROCKS];

export function specimenById(id: string): Specimen | undefined {
  return SPECIMENS.find((s) => s.id === id);
}

export function hardnessText(h: [number, number]): string {
  return h[0] === h[1] ? String(h[0]) : `${h[0]}–${h[1]}`;
}

export function sgText(sg: [number, number]): string {
  return sg[0] === sg[1] ? sg[0].toFixed(2).replace(/0$/, "") : `${sg[0]}–${sg[1]}`;
}

/** Mohs scale reference minerals. */
export const MOHS = [
  { h: 1, mineral: "Talc" },
  { h: 2, mineral: "Gypsum" },
  { h: 3, mineral: "Calcite" },
  { h: 4, mineral: "Fluorite" },
  { h: 5, mineral: "Apatite" },
  { h: 6, mineral: "Orthoclase feldspar" },
  { h: 7, mineral: "Quartz" },
  { h: 8, mineral: "Topaz" },
  { h: 9, mineral: "Corundum" },
  { h: 10, mineral: "Diamond" },
] as const;

/** Common hardness tools. */
export const HARDNESS_TOOLS = [
  { h: 2.5, tool: "Fingernail" },
  { h: 3.5, tool: "Copper penny (pre-1982)" },
  { h: 5.5, tool: "Glass plate / steel knife" },
  { h: 6.5, tool: "Steel file / streak plate" },
] as const;
