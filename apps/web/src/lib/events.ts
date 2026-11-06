/**
 * Division C events for 2026–27. Categories follow the official 2027 Event Table,
 * conflict blocks the 2027 National Conflict Blocks sheet, and descriptions are
 * Science Olympiad's own short descriptions (soinc.org/learn/c-event-short-descriptions).
 * Mirrors content/seasons/2027/events.yaml.
 */
export type Category =
  | "Life, Personal & Social Science"
  | "Earth & Space Science"
  | "Physical Science & Chemistry"
  | "Technology & Engineering"
  | "Inquiry & Nature of Science";

export const CATEGORIES: readonly Category[] = [
  "Life, Personal & Social Science",
  "Earth & Space Science",
  "Physical Science & Chemistry",
  "Technology & Engineering",
  "Inquiry & Nature of Science",
];

export interface DivCEvent {
  slug: string;
  name: string;
  category: Category;
  block: number;
  /** Built before the tournament (device or model). */
  build: boolean;
  description: string;
  officialUrl: string;
  /** App route when the event's study tools are live. */
  href?: string;
}

const so = (path: string) => `https://www.soinc.org/${path}`;

export const DIV_C_EVENTS: readonly DivCEvent[] = [
  { slug: "anatomy-physiology", name: "Anatomy and Physiology", category: "Life, Personal & Social Science", block: 1, build: false, officialUrl: so("anatomy-and-physiology-c"), href: "/anatomy-physiology", description: "Participants will be assessed on their understanding of the anatomy and physiology for the respiratory, digestive and immune systems of the human body." },
  { slug: "botany", name: "Botany", category: "Life, Personal & Social Science", block: 3, build: false, officialUrl: so("botany-c"), description: "Participants will demonstrate their knowledge of plant life and general botany principles." },
  { slug: "designer-genes", name: "Designer Genes", category: "Life, Personal & Social Science", block: 6, build: false, officialUrl: so("designer-genes-c"), description: "Teams will answer questions, solve problems, and analyze data pertaining to classic, evolutionary, and molecular genetics." },
  { slug: "disease-detectives", name: "Disease Detectives", category: "Life, Personal & Social Science", block: 2, build: false, officialUrl: so("disease-detectives-c"), description: "Participants will use their investigative skills in the scientific study of disease, injury, health, and disability in populations or groups of people." },
  { slug: "water-quality", name: "Water Quality", category: "Life, Personal & Social Science", block: 5, build: false, officialUrl: so("water-quality-c"), description: "Participants will be assessed on their understanding and evaluation of marine and estuary aquatic environments." },
  { slug: "astronomy", name: "Astronomy", category: "Earth & Space Science", block: 3, build: false, officialUrl: so("astronomy-c"), description: "Teams will demonstrate an understanding of stellar evolution in normal & starburst galaxies." },
  { slug: "dynamic-planet", name: "Dynamic Planet", category: "Earth & Space Science", block: 6, build: false, officialUrl: so("dynamic-planet-c"), description: "Teams will complete tasks related to the properties and processes of Earth’s fresh waters." },
  { slug: "remote-sensing", name: "Remote Sensing", category: "Earth & Space Science", block: 2, build: false, officialUrl: so("remote-sensing-c"), description: "Participants will use remote sensing imagery, data, and computational process skills to complete tasks related to climate change processes in the Earth system." },
  { slug: "rocks-and-minerals", name: "Rocks and Minerals", category: "Earth & Space Science", block: 4, build: false, officialUrl: so("rocks-and-minerals-c"), href: "/rocks-and-minerals", description: "Teams will identify and classify rocks and minerals and demonstrate knowledge of how rocks and minerals help to understand geologic processes, interpretation of earth’s history, the development of natural resources, and use by society." },
  { slug: "chemistry-lab", name: "Chemistry Lab", category: "Physical Science & Chemistry", block: 4, build: false, officialUrl: so("chemistry-lab-c-0"), description: "Teams will complete one or more tasks and answer a series of questions involving the science processes of chemistry focused in the areas of kinetics and gases." },
  { slug: "circuit-lab", name: "Circuit Lab", category: "Physical Science & Chemistry", block: 5, build: false, officialUrl: so("circuit-lab-c"), description: "Participants must complete hands-on tasks and answer questions about electricity and electronics." },
  { slug: "forensics", name: "Forensics", category: "Physical Science & Chemistry", block: 1, build: false, officialUrl: so("forensics-c"), description: "Given a scenario and some possible suspects, students will perform a series of tests. These tests, along with other evidence or test results, will be used to solve a crime." },
  { slug: "hovercraft", name: "Hovercraft", category: "Physical Science & Chemistry", block: 7, build: true, officialUrl: so("hovercraft-c"), description: "Prior to the competition, participants will design, construct, and calibrate a self-propelled, air-levitated vehicle to carry nickels down a track." },
  { slug: "protein-modeling", name: "Protein Modeling", category: "Physical Science & Chemistry", block: 5, build: true, officialUrl: so("protein-modeling-c"), description: "Participants will be assessed on a written exam and prior to the competition will use computer visualization and online resources to construct a physical model of the sialic acid binding site of the 2009 H1N1 influenza hemagglutinin protein." },
  { slug: "thermodynamics", name: "Thermodynamics", category: "Physical Science & Chemistry", block: 6, build: true, officialUrl: so("thermodynamics-c"), description: "Teams will construct a device prior to the tournament designed to collect heat and complete a written test on thermodynamic concepts." },
  { slug: "boomilever", name: "Boomilever", category: "Technology & Engineering", block: 7, build: true, officialUrl: so("boomilever-c"), description: "Teams will build a cantilevered beam or truss structure that extends from a vertical Testing Wall and supports a load at a specified height and distance from the Testing Wall." },
  { slug: "electric-vehicle", name: "Electric Vehicle", category: "Technology & Engineering", block: 7, build: true, officialUrl: so("electric-vehicle-c"), description: "Teams design, build, and test one vehicle that uses electrical energy as its sole means of propulsion to travel in a set amount of time, push a bottle past a line, and move backwards to stop close to a Target point." },
  { slug: "mission-possible", name: "Mission Possible", category: "Technology & Engineering", block: 7, build: true, officialUrl: so("mission-possible-c"), description: "Prior to the competition, competitors will design, build, test, and document a Rube Goldberg®-like device that begins with a specific Start Action and ends with a specific Final Action." },
  { slug: "wright-stuff", name: "Wright Stuff", category: "Technology & Engineering", block: 7, build: true, officialUrl: so("wright-stuff-c"), description: "Prior to the tournament, teams will construct, collect data on test flights, analyze and optimize free flight rubber-powered Airplane to achieve maximum time aloft." },
  { slug: "codebusters", name: "Codebusters", category: "Inquiry & Nature of Science", block: 2, build: false, officialUrl: so("codebusters-c"), href: "/codebusters", description: "Teams will cryptanalyze and decode encrypted messages using cryptanalysis techniques for historical and modern advanced ciphers." },
  { slug: "engineering-cad", name: "Engineering CAD", category: "Inquiry & Nature of Science", block: 1, build: false, officialUrl: so("engineering-cad-c"), description: "Teams will read a set of engineering drawings and collaborate to CAD parts in Onshape and then incorporate these parts with provided components to create an assembly." },
  { slug: "experimental-design", name: "Experimental Design", category: "Inquiry & Nature of Science", block: 3, build: false, officialUrl: so("experimental-design-c"), description: "Participants will be assessed on the ability to design, conduct, and report the findings of an experiment entirely on-site." },
  { slug: "ping-pong-parachute", name: "Ping Pong Parachute", category: "Inquiry & Nature of Science", block: 7, build: true, officialUrl: so("ping-pong-parachute-c"), description: "Prior to the tournament, teams will design, build, and bring up to two bottle rockets to the tournament to launch a ping pong ball attached to a parachute to stay aloft for the greatest amount of time." },
];

export const EVENT_SOURCE = { label: "soinc.org event descriptions", url: "https://www.soinc.org/learn/c-event-short-descriptions" };

export function eventBySlug(slug: string): DivCEvent | undefined {
  return DIV_C_EVENTS.find((e) => e.slug === slug);
}

export function isEventSlug(slug: string): boolean {
  return DIV_C_EVENTS.some((e) => e.slug === slug);
}

/** Block 7 holds the build events, which the national schedule runs separately. */
export const BUILD_BLOCK = 7;

/**
 * Chosen events that share a conflict block, so one student can't compete in both
 * (based on the 2027 national schedule; local tournaments may differ).
 */
export function blockConflicts(slugs: readonly string[]): { block: number; events: DivCEvent[] }[] {
  const byBlock = new Map<number, DivCEvent[]>();
  for (const s of slugs) {
    const e = eventBySlug(s);
    if (e && e.block !== BUILD_BLOCK) (byBlock.get(e.block) ?? byBlock.set(e.block, []).get(e.block)!).push(e);
  }
  return [...byBlock].filter(([, es]) => es.length > 1).map(([block, events]) => ({ block, events }));
}
