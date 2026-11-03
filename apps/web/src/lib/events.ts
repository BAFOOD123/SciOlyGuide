/**
 * Division C events for the 2026–27 season, mirrored from
 * content/seasons/2027/events.yaml (the source of truth) for the dashboard.
 */
export interface DivCEvent {
  slug: string;
  name: string;
  block: number;
  live: boolean;
}

export const DIV_C_EVENTS: readonly DivCEvent[] = [
  { slug: "anatomy-physiology", name: "Anatomy & Physiology", block: 1, live: false },
  { slug: "engineering-cad", name: "Engineering CAD", block: 1, live: false },
  { slug: "forensics", name: "Forensics", block: 1, live: false },
  { slug: "codebusters", name: "Codebusters", block: 2, live: true },
  { slug: "disease-detectives", name: "Disease Detectives", block: 2, live: false },
  { slug: "remote-sensing", name: "Remote Sensing", block: 2, live: false },
  { slug: "astronomy", name: "Astronomy", block: 3, live: false },
  { slug: "botany", name: "Botany", block: 3, live: false },
  { slug: "experimental-design", name: "Experimental Design", block: 3, live: false },
  { slug: "chemistry-lab", name: "Chemistry Lab", block: 4, live: false },
  { slug: "rocks-and-minerals", name: "Rocks and Minerals", block: 4, live: false },
  { slug: "circuit-lab", name: "Circuit Lab", block: 5, live: false },
  { slug: "protein-modeling", name: "Protein Modeling", block: 5, live: false },
  { slug: "water-quality", name: "Water Quality", block: 5, live: false },
  { slug: "designer-genes", name: "Designer Genes", block: 6, live: false },
  { slug: "dynamic-planet", name: "Dynamic Planet", block: 6, live: false },
  { slug: "thermodynamics", name: "Thermodynamics", block: 6, live: false },
  { slug: "boomilever", name: "Boomilever", block: 7, live: false },
  { slug: "electric-vehicle", name: "Electric Vehicle", block: 7, live: false },
  { slug: "hovercraft", name: "Hovercraft", block: 7, live: false },
  { slug: "mission-possible", name: "Mission Possible", block: 7, live: false },
  { slug: "ping-pong-parachute", name: "Ping Pong Parachute", block: 7, live: false },
  { slug: "wright-stuff", name: "Wright Stuff", block: 7, live: false },
];
