// Anatomy & Physiology question bank for the 2027 Division C systems:
// respiratory, digestive and immune. Pure data + a seeded quiz builder, shared by
// the app and the demo. Facts are drawn from the event guide
// (content/guides/anatomy-physiology.md); keep the two in sync.

export type System = "Respiratory" | "Digestive" | "Immune";

export interface AnatomyTopic {
  slug: string;
  system: System;
  label: string;
}

/** The sub-topics a student can pick from, grouped by system. */
export const ANATOMY_TOPICS: readonly AnatomyTopic[] = [
  // Respiratory
  { slug: "resp-anatomy", system: "Respiratory", label: "Airway anatomy" },
  { slug: "resp-histology", system: "Respiratory", label: "Airway walls & histology" },
  { slug: "resp-mechanics", system: "Respiratory", label: "Breathing mechanics" },
  { slug: "resp-volumes", system: "Respiratory", label: "Lung volumes & spirometry" },
  { slug: "resp-gas", system: "Respiratory", label: "Gas exchange & O₂ transport" },
  { slug: "resp-control", system: "Respiratory", label: "Control of breathing" },
  { slug: "resp-exercise", system: "Respiratory", label: "Exercise & altitude" },
  { slug: "resp-disease", system: "Respiratory", label: "Respiratory disorders" },
  // Digestive
  { slug: "dig-anatomy", system: "Digestive", label: "GI anatomy & peritoneum" },
  { slug: "dig-wall", system: "Digestive", label: "Gut wall layers" },
  { slug: "dig-histology", system: "Digestive", label: "Organ linings & cells" },
  { slug: "dig-motility", system: "Digestive", label: "Motility & hormones" },
  { slug: "dig-digestion", system: "Digestive", label: "Digestion & enzymes" },
  { slug: "dig-absorption", system: "Digestive", label: "Absorption" },
  { slug: "dig-liver", system: "Digestive", label: "Liver & pancreas" },
  { slug: "dig-disease", system: "Digestive", label: "Digestive disorders" },
  // Immune
  { slug: "imm-organs", system: "Immune", label: "Lymphoid organs" },
  { slug: "imm-innate", system: "Immune", label: "Innate immunity" },
  { slug: "imm-adaptive", system: "Immune", label: "Adaptive immunity" },
  { slug: "imm-antibodies", system: "Immune", label: "Antibodies" },
  { slug: "imm-vaccines", system: "Immune", label: "Immunity & vaccines" },
  { slug: "imm-hyper", system: "Immune", label: "Hypersensitivity" },
  { slug: "imm-disease", system: "Immune", label: "Immune disorders" },
  { slug: "imm-signaling", system: "Immune", label: "Signaling & transplants" },
];

export const SYSTEMS: readonly System[] = ["Respiratory", "Digestive", "Immune"];

export interface AnatomyQuestion {
  id: string;
  topic: string;
  prompt: string;
  /** The correct answer (choices are built and shuffled from answer + distractors). */
  answer: string;
  distractors: string[];
  explanation: string;
}

const TOPIC_SYSTEM = new Map(ANATOMY_TOPICS.map((t) => [t.slug, t.system] as const));
const TOPIC_LABEL = new Map(ANATOMY_TOPICS.map((t) => [t.slug, t.label] as const));

export function systemOfTopic(slug: string): System | undefined {
  return TOPIC_SYSTEM.get(slug);
}
export function topicLabel(slug: string): string {
  return TOPIC_LABEL.get(slug) ?? slug;
}
export function topicsBySystem(system: System): AnatomyTopic[] {
  return ANATOMY_TOPICS.filter((t) => t.system === system);
}

// Compact builder so the bank stays readable. id is filled in afterward.
function q(topic: string, prompt: string, answer: string, distractors: string[], explanation: string): AnatomyQuestion {
  return { id: "", topic, prompt, answer, distractors, explanation };
}

const BANK: AnatomyQuestion[] = [
  /* ============================ RESPIRATORY ============================ */

  // --- Airway anatomy ---
  q("resp-anatomy", "The conducting zone of the airway does all of the following EXCEPT:", "Carry out gas exchange", ["Warm incoming air", "Humidify incoming air", "Filter incoming air"], "The conducting zone (nose → terminal bronchioles) warms, humidifies and filters air but does no gas exchange; the respiratory zone (respiratory bronchioles → alveoli) is where exchange happens."),
  q("resp-anatomy", "Which is the only complete (full ring) cartilage of the larynx and airway?", "Cricoid cartilage", ["Thyroid cartilage", "Epiglottis", "Tracheal cartilage"], "The cricoid is the only complete ring. The trachea's rings are C-shaped and open at the back against the esophagus."),
  q("resp-anatomy", "Inhaled objects most often lodge in the right main bronchus because it is:", "Wider, shorter and more vertical", ["Narrower and more horizontal", "Longer and more vertical", "Wider but more horizontal"], "The right main bronchus is wider, shorter and more vertical than the left, so aspirated objects tend to fall into it."),
  q("resp-anatomy", "How many lobes does the right lung have?", "Three", ["Two", "Four", "One"], "The right lung has three lobes; the left has two plus the cardiac notch and lingula (making room for the heart)."),
  q("resp-anatomy", "The epiglottis is made of which type of cartilage?", "Elastic cartilage", ["Hyaline cartilage", "Fibrocartilage", "Bone"], "The epiglottis is elastic cartilage; it flips down to cover the laryngeal opening when you swallow."),
  q("resp-anatomy", "The trachea divides into the two main bronchi at the:", "Carina", ["Hilum", "Glottis", "Larynx"], "The carina is the ridge at the tracheal bifurcation; it is highly sensitive and triggers coughing."),
  q("resp-anatomy", "The pleural layer attached directly to the lung surface is the:", "Visceral pleura", ["Parietal pleura", "Mediastinal pleura", "Pericardium"], "Visceral pleura wraps the lung; parietal pleura lines the chest wall, with the fluid-filled pleural cavity between them."),
  q("resp-anatomy", "The space between the true vocal folds is the:", "Glottis", ["Carina", "Vestibule", "Nasopharynx"], "The glottis is the opening between the true vocal folds; air passing through vibrates them to make sound."),

  // --- Airway walls & histology ---
  q("resp-histology", "Which cells secrete mucus in the trachea?", "Goblet cells", ["Club (Clara) cells", "Type II pneumocytes", "Chief cells"], "Goblet cells secrete mucus in the trachea and bronchi; they vanish in the bronchioles, where club (Clara) cells take over."),
  q("resp-histology", "Which airway region has no cartilage and the most relative smooth muscle?", "Bronchioles", ["Trachea", "Main bronchi", "Larynx"], "Bronchioles (<1 mm) have no cartilage and proportionally the most smooth muscle — which is why they constrict in asthma."),
  q("resp-histology", "Type II pneumocytes produce:", "Surfactant", ["Mucus", "Bicarbonate", "Histamine"], "Type II pneumocytes make surfactant, which lowers alveolar surface tension and keeps small alveoli from collapsing."),
  q("resp-histology", "Alveolar macrophages are also called:", "Dust cells", ["Club cells", "Goblet cells", "Kupffer cells"], "Alveolar macrophages ('dust cells') patrol the alveoli and engulf debris and microbes. Kupffer cells are the liver's macrophages."),
  q("resp-histology", "Most of the trachea is lined by which epithelium?", "Pseudostratified ciliated columnar", ["Simple squamous", "Stratified squamous", "Simple cuboidal"], "Respiratory epithelium (pseudostratified ciliated columnar with goblet cells) lines the trachea and makes up the mucociliary escalator."),
  q("resp-histology", "Going from the trachea deep toward the alveoli, which trend is correct?", "Cartilage disappears and the epithelium thins", ["Cartilage increases and the epithelium thickens", "Goblet cells become more numerous", "Smooth muscle disappears entirely"], "Deeper in the airway, cartilage disappears, the epithelium thins, goblet cells vanish, and smooth muscle becomes relatively more prominent."),
  q("resp-histology", "About 95% of the alveolar surface is made of:", "Type I pneumocytes", ["Type II pneumocytes", "Goblet cells", "Alveolar macrophages"], "Thin type I pneumocytes form most of the alveolar wall for gas exchange; type II cells make surfactant."),

  // --- Breathing mechanics ---
  q("resp-mechanics", "Which gas law explains how changing chest volume moves air in and out?", "Boyle's law", ["Henry's law", "Dalton's law", "Fick's law"], "Boyle's law (P₁V₁ = P₂V₂): raising chest volume lowers alveolar pressure, so air flows in."),
  q("resp-mechanics", "During quiet inspiration the diaphragm:", "Contracts and flattens", ["Relaxes and domes upward", "Contracts and domes upward", "Does not move"], "Inspiration is active: the diaphragm contracts and flattens and the external intercostals lift the ribs, raising chest volume."),
  q("resp-mechanics", "Lung compliance is defined as:", "ΔV / ΔP", ["ΔP / ΔV", "P × V", "V / time"], "Compliance = change in volume per change in pressure — how easily the lungs stretch."),
  q("resp-mechanics", "How does emphysema change lung compliance?", "Increases it (floppy lungs that recoil poorly)", ["Decreases it (stiff lungs)", "Leaves it unchanged", "Eliminates airway resistance"], "Emphysema destroys elastic tissue, so compliance rises but recoil is poor. Fibrosis does the opposite (stiff, low-compliance lungs)."),
  q("resp-mechanics", "Surfactant reduces the work of breathing by:", "Lowering alveolar surface tension", ["Raising surface tension", "Thickening airway mucus", "Dilating the bronchi"], "By the law of Laplace (P = 2T/r), surfactant lowers surface tension so small alveoli don't collapse into larger ones."),
  q("resp-mechanics", "By Poiseuille's law, halving an airway's radius raises its resistance by a factor of:", "16", ["2", "4", "8"], "Resistance ∝ 1/r⁴, so halving the radius multiplies resistance by 2⁴ = 16."),
  q("resp-mechanics", "Air leaking into the pleural space causes:", "Pneumothorax, collapsing the lung", ["Pulmonary edema", "Pleurisy", "Bronchoconstriction"], "Intrapleural pressure is normally sub-atmospheric; if air enters (pneumothorax), the lung recoils and collapses."),
  q("resp-mechanics", "Which stimulation dilates the airways?", "Sympathetic (β₂ receptors, epinephrine)", ["Parasympathetic (vagus, ACh)", "Histamine release", "Cold, dry air"], "Sympathetic β₂ activation (and drugs like albuterol) dilates airways; parasympathetic/vagal ACh constricts them."),

  // --- Lung volumes & spirometry ---
  q("resp-volumes", "Which CANNOT be measured by simple spirometry?", "Residual volume", ["Tidal volume", "Inspiratory reserve volume", "Expiratory reserve volume"], "Residual volume (air left after maximal exhalation) can't be exhaled, so it — and any capacity containing it (FRC, TLC) — needs other methods."),
  q("resp-volumes", "Vital capacity equals:", "TV + IRV + ERV", ["TV + IRV", "ERV + RV", "TV + RV"], "Vital capacity is the most air you can move in one breath: tidal volume plus both reserve volumes."),
  q("resp-volumes", "Tidal volume × respiratory rate gives:", "Minute ventilation", ["Alveolar ventilation", "Vital capacity", "Functional residual capacity"], "Minute ventilation (V̇E) = TV × rate. Alveolar ventilation subtracts dead space first."),
  q("resp-volumes", "With tidal volume 500 mL, dead space 150 mL and rate 12/min, alveolar ventilation is:", "4.2 L/min", ["6.0 L/min", "1.8 L/min", "7.8 L/min"], "V̇A = (TV − dead space) × rate = (500 − 150) × 12 = 4,200 mL/min = 4.2 L/min."),
  q("resp-volumes", "An FEV₁/FVC ratio below 0.70 indicates:", "An obstructive pattern", ["A restrictive pattern", "A normal result", "Pulmonary fibrosis"], "A low FEV₁/FVC means air can't get out fast — obstruction (asthma, COPD, emphysema, CF). Restriction keeps the ratio normal or high."),
  q("resp-volumes", "Which disease gives a restrictive spirometry pattern?", "Pulmonary fibrosis", ["Asthma", "COPD", "Emphysema"], "Fibrosis stiffens the lungs: FVC and TLC fall while FEV₁/FVC stays normal or high. The others are obstructive."),
  q("resp-volumes", "Functional residual capacity equals:", "ERV + RV", ["TV + IRV", "IRV + ERV", "TV + ERV"], "FRC is the air left in the lungs at the end of a quiet breath: expiratory reserve volume plus residual volume."),
  q("resp-volumes", "On a flow–volume loop, obstruction classically produces an expiratory curve that is:", "Scooped out (concave)", ["A narrow, normal-shaped loop", "Flattened on both limbs", "Shifted to lower lung volumes"], "Obstruction gives a concave, 'scooped-out' expiratory limb shifted to higher volumes. Restriction gives a narrow loop at lower volumes; a fixed obstruction flattens both limbs."),

  // --- Gas exchange & O₂ transport ---
  q("resp-gas", "Which law describes each gas exerting its own partial pressure in a mixture?", "Dalton's law", ["Henry's law", "Boyle's law", "Fick's law"], "Dalton's law of partial pressures: air at sea level is 760 × 0.21 ≈ 160 mmHg O₂."),
  q("resp-gas", "CO₂ diffuses readily despite a small gradient because it is:", "About 20× more soluble than O₂", ["Driven by a larger gradient", "Bound more tightly to hemoglobin", "Pushed by a thinner membrane"], "Henry's law: CO₂'s high solubility lets it cross easily even though its partial-pressure gradient (46→40 mmHg) is small."),
  q("resp-gas", "The oxygen–hemoglobin dissociation curve is sigmoid (S-shaped) because:", "O₂ binding is cooperative", ["Hemoglobin denatures at high PO₂", "O₂ is only dissolved, not bound", "CO₂ competes for the heme"], "Each O₂ that binds makes the next bind more easily (cooperativity), producing the sigmoid curve. P₅₀ ≈ 26–27 mmHg."),
  q("resp-gas", "A right shift of the O₂–Hb curve means:", "Lower affinity, so more O₂ is unloaded", ["Higher affinity, so less O₂ is unloaded", "No change in unloading", "Hemoglobin is being destroyed"], "Right = Releases O₂. Lower affinity delivers more oxygen to tissues."),
  q("resp-gas", "Which set of changes shifts the curve to the RIGHT?", "↑CO₂, ↑H⁺, ↑temperature, ↑2,3-BPG", ["Fetal hemoglobin", "Carbon monoxide", "↓temperature and ↑pH"], "Exercising muscle creates all of these (mnemonic CADET faces Right: CO₂, Acid, 2,3-DPG, Exercise, Temperature)."),
  q("resp-gas", "Most CO₂ is carried in the blood as:", "Bicarbonate", ["Carbaminohemoglobin", "Dissolved CO₂", "Carbonic acid"], "About 70% travels as bicarbonate (via carbonic anhydrase in red cells), ~20% bound to Hb, ~7–10% dissolved."),
  q("resp-gas", "The chloride shift accompanies:", "Bicarbonate leaving the red blood cell", ["O₂ loading in the lungs", "CO poisoning", "Surfactant secretion"], "As HCO₃⁻ exits the red cell, Cl⁻ moves in to balance charge — the chloride (Hamburger) shift."),
  q("resp-gas", "Carbon monoxide shifts the O₂–Hb curve which way?", "Left", ["Right", "No shift", "It flattens the curve"], "CO binds Hb ~200× more tightly than O₂ and raises affinity at the remaining sites (left shift), so tissues get less O₂."),
  q("resp-gas", "Fick's law of diffusion says gas-transfer rate is reduced by:", "A thicker membrane (as in pulmonary edema or fibrosis)", ["A larger surface area", "A bigger partial-pressure difference", "More capillaries"], "Rate ∝ (area × ΔP) ÷ thickness. Emphysema cuts area; edema and fibrosis thicken the barrier."),

  // --- Control of breathing ---
  q("resp-control", "The main moment-to-moment driver of breathing is:", "CO₂ (sensed as H⁺ in the CSF)", ["O₂", "Bicarbonate", "Blood glucose"], "Central chemoreceptors respond to H⁺ from CO₂ crossing into the CSF. O₂ only drives breathing strongly when it falls very low."),
  q("resp-control", "Central chemoreceptors are located in the:", "Medulla", ["Carotid bodies", "Aortic bodies", "Pons"], "Central chemoreceptors in the medulla sense CSF H⁺; peripheral ones sit in the carotid and aortic bodies."),
  q("resp-control", "Peripheral chemoreceptors respond strongly to O₂ only when PO₂ falls below about:", "60 mmHg", ["100 mmHg", "80 mmHg", "40 mmHg"], "Carotid and aortic bodies ramp up output when PO₂ drops below ~60 mmHg (also responding to high CO₂ and low pH)."),
  q("resp-control", "The respiratory rhythm generator is the:", "Pre-Bötzinger complex", ["Pontine respiratory group", "Carotid body", "Hering–Breuer center"], "The pre-Bötzinger complex in the ventral respiratory group of the medulla sets the basic breathing rhythm."),
  q("resp-control", "The Hering–Breuer reflex prevents:", "Over-inflation of the lungs", ["Airway collapse", "Hyperventilation at altitude", "Aspiration of food"], "Stretch receptors in the lungs signal via the vagus to stop inspiration before the lungs over-inflate."),
  q("resp-control", "The carotid bodies send signals to the brain via which nerve?", "Glossopharyngeal nerve (CN IX)", ["Vagus nerve (CN X)", "Phrenic nerve", "Facial nerve (CN VII)"], "Carotid bodies use the glossopharyngeal nerve; the aortic bodies use the vagus."),

  // --- Exercise & altitude ---
  q("resp-exercise", "During moderate exercise, arterial PO₂ and PCO₂:", "Stay remarkably constant", ["Both fall sharply", "Both rise sharply", "PO₂ rises while PCO₂ falls"], "Ventilation rises in step with CO₂ production, holding arterial blood gases nearly constant in moderate exercise."),
  q("resp-exercise", "Acclimatization to high altitude includes:", "Increased 2,3-BPG, EPO and red blood cells", ["Decreased red blood cell count", "Respiratory acidosis", "Decreased ventilation"], "Low PO₂ triggers hyperventilation, then ↑2,3-BPG, kidney compensation, ↑EPO/hematocrit and more capillaries."),
  q("resp-exercise", "The hyperventilation of high altitude initially causes:", "Respiratory alkalosis", ["Respiratory acidosis", "Metabolic acidosis", "Metabolic alkalosis"], "Blowing off CO₂ raises blood pH (respiratory alkalosis); the kidneys later compensate by excreting bicarbonate."),
  q("resp-exercise", "Endurance training raises VO₂max mainly by improving:", "The heart and muscles", ["Lung (airway) size", "The diameter of the bronchi", "Surfactant production"], "The lungs are rarely limiting; training improves cardiac output and muscle oxygen use."),
  q("resp-exercise", "HAPE, a danger of extreme altitude, stands for:", "High-altitude pulmonary edema", ["High-altitude pleural effusion", "Hypoxic alveolar pressure elevation", "High-altitude pneumonia"], "Hypoxic pulmonary vasoconstriction raises pulmonary pressure; HAPE (lung) and HACE (brain) are medical emergencies."),

  // --- Respiratory disorders ---
  q("resp-disease", "Asthma is most often which type of hypersensitivity?", "Type I", ["Type II", "Type III", "Type IV"], "Allergic asthma is a type I (IgE-mediated) hypersensitivity causing reversible bronchoconstriction, inflammation and mucus."),
  q("resp-disease", "COPD is defined by a post-bronchodilator FEV₁/FVC below:", "0.70", ["0.85", "0.50", "0.95"], "An FEV₁/FVC under 0.70 that doesn't fully reverse with a bronchodilator defines COPD; it's mostly caused by smoking."),
  q("resp-disease", "Cystic fibrosis is caused by a mutation in:", "The CFTR chloride channel", ["Dystrophin", "The hemoglobin β chain", "Type I collagen"], "An autosomal-recessive CFTR mutation (commonly ΔF508) makes thick mucus; the sweat chloride test confirms it."),
  q("resp-disease", "The most common bacterial cause of pneumonia is:", "Streptococcus pneumoniae", ["Mycobacterium tuberculosis", "Pseudomonas aeruginosa", "Haemophilus influenzae"], "S. pneumoniae is the leading bacterial cause; pneumonia fills alveoli with exudate (consolidation on X-ray)."),
  q("resp-disease", "Panacinar emphysema in a young nonsmoker suggests:", "α₁-antitrypsin deficiency", ["A CFTR mutation", "Allergic asthma", "Silicosis"], "α₁-antitrypsin deficiency gives lower-lobe panacinar emphysema; smoking causes upper-lobe centriacinar disease."),
  q("resp-disease", "Obstructive sleep apnea is treated with:", "CPAP", ["Bronchodilators", "Antibiotics", "Surfactant replacement"], "Continuous positive airway pressure (CPAP) splints the airway open during sleep."),
  q("resp-disease", "Silicosis characteristically affects which part of the lungs?", "The upper lobes", ["The lower lobes", "The pleura only", "The main bronchi only"], "Silicosis hits the upper lobes (with eggshell lymph-node calcification and raised TB risk); asbestosis favors the lower lobes and pleura."),
  q("resp-disease", "Caseating granulomas and a Ghon complex point to:", "Tuberculosis", ["Sarcoidosis", "Bacterial pneumonia", "Asbestosis"], "Mycobacterium tuberculosis produces caseating granulomas; it's tested with a TB skin test or interferon-γ release assay."),
  q("resp-disease", "Infant respiratory distress syndrome in a premature baby is due to a lack of:", "Surfactant", ["Hemoglobin", "Red blood cells", "Alveolar macrophages"], "Premature lungs lack surfactant; it's prevented with antenatal corticosteroids and treated with surfactant replacement."),

  /* ============================= DIGESTIVE ============================= */

  // --- GI anatomy & peritoneum ---
  q("dig-anatomy", "Which organ is retroperitoneal?", "The kidneys", ["The stomach", "The spleen", "The transverse colon"], "SAD PUCKER lists the retroperitoneal organs; the kidneys are among them. The stomach, spleen and transverse colon are intraperitoneal."),
  q("dig-anatomy", "The three parts of the small intestine, in order from the stomach, are:", "Duodenum, jejunum, ileum", ["Jejunum, duodenum, ileum", "Ileum, jejunum, duodenum", "Duodenum, ileum, jejunum"], "Food passes duodenum → jejunum → ileum before reaching the large intestine."),
  q("dig-anatomy", "The fibrous midline seam of the anterior abdominal wall is the:", "Linea alba", ["Rectus sheath", "Inguinal ligament", "Camper's fascia"], "The linea alba is the tendinous midline where the aponeuroses meet; the rectus abdominis runs vertically inside the rectus sheath."),
  q("dig-anatomy", "Which is an accessory digestive organ, not part of the alimentary canal?", "The pancreas", ["The stomach", "The esophagus", "The cecum"], "Accessory organs (teeth, tongue, salivary glands, liver, gallbladder, pancreas) aid digestion but food doesn't pass through them."),
  q("dig-anatomy", "Intraperitoneal organs are suspended from the body wall by a:", "Mesentery", ["Transversalis fascia", "Rectus sheath", "Lamina propria"], "A mesentery is a double fold of peritoneum that suspends intraperitoneal organs and carries their vessels and nerves."),
  q("dig-anatomy", "In the mnemonic SAD PUCKER, the appendix hangs off which structure?", "The cecum", ["The sigmoid colon", "The ileum", "The rectum"], "The appendix projects from the cecum, the pouch at the start of the large intestine."),
  q("dig-anatomy", "The salivary glands include the parotid, sublingual and:", "Submandibular", ["Thyroid", "Brunner's", "Peyer's"], "The three major salivary glands are the parotid, submandibular and sublingual."),

  // --- Gut wall layers ---
  q("dig-wall", "The four layers of the gut wall, from the lumen outward, are:", "Mucosa, submucosa, muscularis externa, serosa", ["Serosa, muscularis, submucosa, mucosa", "Mucosa, muscularis, submucosa, serosa", "Submucosa, mucosa, serosa, muscularis"], "From inside out: mucosa, submucosa, muscularis externa, then serosa (or adventitia where there's no peritoneum)."),
  q("dig-wall", "The myenteric (Auerbach's) plexus controls:", "Motility", ["Secretion", "Nutrient absorption", "Blood clotting"], "The myenteric plexus (between the circular and longitudinal muscle) controls motility; the submucosal plexus controls secretion."),
  q("dig-wall", "The submucosal (Meissner's) plexus mainly controls:", "Secretion", ["Motility", "Swallowing", "Chewing"], "Meissner's plexus in the submucosa regulates glandular secretion and local blood flow."),
  q("dig-wall", "Brunner's glands, which secrete alkaline mucus, are found in the:", "Duodenum", ["Stomach", "Ileum", "Colon"], "Brunner's glands sit in the duodenal submucosa and neutralize acidic chyme arriving from the stomach."),
  q("dig-wall", "The myenteric plexus lies between which two layers?", "The circular and longitudinal smooth muscle", ["The mucosa and submucosa", "The serosa and muscularis", "The epithelium and lamina propria"], "Auerbach's (myenteric) plexus sits between the inner circular and outer longitudinal muscle of the muscularis externa."),
  q("dig-wall", "In the colon, the longitudinal muscle gathers into three bands called the:", "Taeniae coli", ["Rugae", "Plicae circulares", "Haustra"], "The taeniae coli are three longitudinal muscle bands; their tone pouches the colon into haustra."),
  q("dig-wall", "Where a digestive organ is not covered by peritoneum, its outer layer is called the:", "Adventitia", ["Serosa", "Mucosa", "Submucosa"], "Serosa (visceral peritoneum) covers intraperitoneal organs; fibrous adventitia covers organs outside the peritoneum, like most of the esophagus."),

  // --- Organ linings & cells ---
  q("dig-histology", "Parietal cells of the stomach secrete:", "HCl and intrinsic factor", ["Pepsinogen", "Gastrin", "Mucus"], "Parietal cells make hydrochloric acid and intrinsic factor (needed for B₁₂ absorption). Chief cells make pepsinogen."),
  q("dig-histology", "Chief cells secrete:", "Pepsinogen", ["HCl", "Gastrin", "Bicarbonate"], "Chief cells secrete pepsinogen (and gastric lipase); HCl from parietal cells activates pepsinogen to pepsin."),
  q("dig-histology", "G cells of the stomach antrum secrete:", "Gastrin", ["Secretin", "Pepsinogen", "Histamine"], "G cells release gastrin in response to peptides and stretch, which boosts acid secretion and motility."),
  q("dig-histology", "Paneth cells in the small intestine secrete:", "Antimicrobial molecules", ["Mucus", "Bile", "Insulin"], "Paneth cells at the base of the crypts release antimicrobial peptides and lysozyme to defend the gut."),
  q("dig-histology", "Which sequence multiplies small-intestine surface area the most?", "Plicae circulares → villi → microvilli", ["Rugae → villi → crypts", "Haustra → villi → microvilli", "Villi → rugae → microvilli"], "Circular folds, then finger-like villi, then the brush border of microvilli together give the small intestine its huge surface area."),
  q("dig-histology", "The stomach lining is which epithelium?", "Simple columnar (all mucus-secreting)", ["Stratified squamous", "Pseudostratified columnar", "Simple squamous"], "Simple columnar epithelium lines the stomach; its surface mucous cells protect the wall from acid."),
  q("dig-histology", "Peyer's patches (gut lymphoid tissue) are concentrated in the:", "Ileum", ["Duodenum", "Stomach", "Sigmoid colon"], "Peyer's patches cluster in the ileum, sampling gut antigens for the immune system."),
  q("dig-histology", "The esophagus is lined by:", "Non-keratinized stratified squamous epithelium", ["Simple columnar epithelium", "Pseudostratified ciliated columnar epithelium", "Simple cuboidal epithelium"], "Stratified squamous epithelium resists abrasion from swallowed food. (A switch to columnar epithelium is Barrett's metaplasia.)"),

  // --- Motility & hormones ---
  q("dig-motility", "Back-and-forth mixing contractions in the small intestine are called:", "Segmentation", ["Peristalsis", "The migrating motor complex", "Mass movement"], "Segmentation mixes chyme with enzymes; peristalsis propels it forward."),
  q("dig-motility", "The migrating motor complex, which sweeps the gut between meals, is triggered by:", "Motilin", ["Gastrin", "CCK", "Secretin"], "Motilin from the small intestine starts the MMC during fasting — the 'housekeeper' waves."),
  q("dig-motility", "Which hormone stimulates the pancreas to release bicarbonate?", "Secretin", ["CCK", "Gastrin", "GIP"], "Secretin from duodenal S cells responds to acid and triggers bicarbonate to neutralize chyme; CCK triggers enzymes."),
  q("dig-motility", "Which hormone makes the gallbladder contract and the pancreas release enzymes?", "CCK", ["Secretin", "Gastrin", "Motilin"], "Cholecystokinin from I cells responds to fats and amino acids, contracting the gallbladder, releasing pancreatic enzymes and signaling satiety."),
  q("dig-motility", "Gastrin is released mainly in response to:", "Peptides, stomach stretch and vagal input", ["Acid arriving in the duodenum", "Fasting", "Fat in the duodenum"], "G cells release gastrin when the stomach stretches and detects peptides (and from vagal stimulation), raising acid output."),
  q("dig-motility", "The 'hunger hormone' released during fasting is:", "Ghrelin", ["Leptin", "CCK", "Secretin"], "Ghrelin from the stomach rises before meals to stimulate appetite; CCK and others signal fullness."),
  q("dig-motility", "The cephalic phase of gastric secretion is triggered by:", "The sight, smell or thought of food (via the vagus)", ["Stretch of the stomach wall", "Chyme entering the duodenum", "Acid in the stomach"], "The cephalic phase is anticipatory and vagally driven, before food even reaches the stomach."),
  q("dig-motility", "Somatostatin's main effect on the gut is to:", "Inhibit most GI secretions", ["Stimulate acid secretion", "Speed up motility", "Trigger the migrating motor complex"], "Somatostatin from D cells is broadly inhibitory, damping acid and other GI hormone secretion."),

  // --- Digestion & enzymes ---
  q("dig-digestion", "Salivary amylase begins the digestion of:", "Carbohydrates", ["Proteins", "Fats", "Nucleic acids"], "Salivary (and later pancreatic) amylase breaks starch into smaller sugars; stomach acid then inactivates the salivary form."),
  q("dig-digestion", "Pepsinogen is activated to pepsin by:", "HCl (stomach acid)", ["Bile", "Enteropeptidase", "Trypsin"], "The acidic stomach converts pepsinogen to active pepsin, which begins protein digestion."),
  q("dig-digestion", "Trypsinogen is activated in the small intestine by:", "Enteropeptidase", ["HCl", "Bile salts", "Pepsin"], "Brush-border enteropeptidase activates trypsinogen to trypsin, which then activates the other pancreatic proteases."),
  q("dig-digestion", "Bile salts help fat digestion by:", "Emulsifying fats into small droplets", ["Hydrolyzing triglyceride bonds", "Activating pepsin", "Neutralizing stomach acid"], "Bile salts emulsify fat, giving pancreatic lipase more surface area to work on; lipase does the actual hydrolysis."),
  q("dig-digestion", "Digested fats are absorbed and packaged into:", "Chylomicrons that enter the lacteals (lymph)", ["Glucose that enters blood capillaries", "Amino acids that enter the portal vein", "Micelles that enter the lymph directly"], "Enterocytes re-form triglycerides and package them as chylomicrons, which enter the lacteals (lymphatic vessels)."),
  q("dig-digestion", "Glucose is absorbed across the brush border via:", "SGLT1 (co-transported with Na⁺)", ["GLUT5", "GLUT2", "Simple diffusion"], "SGLT1 brings glucose and galactose in with sodium; fructose uses GLUT5; all exit the cell via GLUT2."),
  q("dig-digestion", "Lactose intolerance results from a deficiency of:", "Lactase", ["Sucrase", "Maltase", "Amylase"], "Low brush-border lactase leaves lactose undigested; colonic bacteria ferment it, causing gas and osmotic diarrhea."),
  q("dig-digestion", "Chemical digestion of protein begins in the:", "Stomach (pepsin)", ["Mouth", "Duodenum", "Ileum"], "Pepsin in the stomach starts protein digestion; pancreatic proteases and brush-border enzymes finish it in the small intestine."),

  // --- Absorption ---
  q("dig-absorption", "Vitamin B₁₂ is absorbed in the:", "Terminal ileum", ["Duodenum", "Stomach", "Colon"], "The B₁₂–intrinsic-factor complex is absorbed in the terminal ileum — the part removed or inflamed in Crohn's disease."),
  q("dig-absorption", "Absorption of vitamin B₁₂ requires:", "Intrinsic factor", ["Bile salts", "Secretin", "Enteropeptidase"], "Intrinsic factor from the stomach's parietal cells is essential; without it, B₁₂ deficiency (pernicious anemia) develops."),
  q("dig-absorption", "Iron and calcium are absorbed mainly in the:", "Duodenum", ["Terminal ileum", "Jejunum", "Colon"], "The duodenum is the main site for iron (as Fe²⁺ via DMT1) and calcium (helped by vitamin D)."),
  q("dig-absorption", "The fat-soluble vitamins are:", "A, D, E and K", ["B, C and folate", "C and all B vitamins", "A, B, C and D"], "A, D, E and K dissolve in fat and need bile and dietary fat to be absorbed, so fat malabsorption causes their deficiency."),
  q("dig-absorption", "Soluble fiber (oats, pectin):", "Forms a gel, slows glucose absorption and lowers LDL", ["Adds bulk and speeds transit", "Is fully digested for energy", "Raises LDL cholesterol"], "Soluble fiber gels and feeds colonic bacteria; insoluble fiber (bran, cellulose) adds bulk and speeds transit."),
  q("dig-absorption", "Most nutrient absorption happens in the:", "Small intestine", ["Stomach", "Large intestine", "Esophagus"], "The villi and microvilli of the small intestine absorb most nutrients; the large intestine mainly reclaims water."),
  q("dig-absorption", "The large intestine's main absorptive job is to reclaim:", "Water and electrolytes", ["Amino acids", "Fats", "Simple sugars"], "Of ~9 L entering the gut daily, only ~100–200 mL leaves in stool; the colon absorbs most of the rest."),

  // --- Liver & pancreas ---
  q("dig-liver", "In a liver lobule, blood flows from the portal triads toward the:", "Central vein", ["Bile duct", "Hepatic artery", "Gallbladder"], "Blood runs through the sinusoids from the corner portal triads to the central vein; bile flows the opposite way, toward the triads."),
  q("dig-liver", "Kupffer cells in the liver are:", "Macrophages lining the sinusoids", ["Vitamin A–storing cells", "Bile-producing duct cells", "Insulin-secreting cells"], "Kupffer cells are resident macrophages that clear debris and old red cells from sinusoidal blood."),
  q("dig-liver", "Activated stellate (Ito) cells, which normally store vitamin A, drive:", "Fibrosis (scarring) in cirrhosis", ["Bile secretion", "Jaundice", "Gallstone formation"], "When activated, hepatic stellate cells lay down collagen, causing the scarring of cirrhosis."),
  q("dig-liver", "Insulin is secreted by which pancreatic islet cells?", "β cells", ["α cells", "δ cells", "Acinar cells"], "β cells make insulin; α cells make glucagon; δ cells make somatostatin. Acinar cells are exocrine."),
  q("dig-liver", "Glucagon is secreted by which islet cells?", "α cells", ["β cells", "δ cells", "PP cells"], "α cells release glucagon during fasting, driving glycogenolysis and gluconeogenesis in the liver."),
  q("dig-liver", "The enzyme targeted by statin drugs in cholesterol synthesis is:", "HMG-CoA reductase", ["Lipoprotein lipase", "Lipase", "Cholesterol esterase"], "HMG-CoA reductase is the rate-limiting enzyme of cholesterol synthesis and the target of statins."),
  q("dig-liver", "The 'good' lipoprotein that returns cholesterol to the liver is:", "HDL", ["LDL", "VLDL", "Chylomicrons"], "HDL carries cholesterol back to the liver; high LDL delivers cholesterol to tissues and promotes atherosclerosis."),
  q("dig-liver", "The antidote to acetaminophen overdose is:", "N-acetylcysteine", ["Naloxone", "Activated charcoal alone", "Vitamin K"], "Overdose produces toxic NAPQI that depletes glutathione; N-acetylcysteine replenishes it and protects the liver."),
  q("dig-liver", "Pancreatic digestive enzymes are produced by:", "Acinar cells", ["Duct cells", "Islet cells", "Kupffer cells"], "Exocrine acinar cells make the digestive enzymes; duct cells add bicarbonate; islets are the endocrine part."),

  // --- Digestive disorders ---
  q("dig-disease", "Crohn's disease is characterized by:", "Transmural inflammation with skip lesions, anywhere from mouth to anus", ["Continuous mucosal inflammation starting at the rectum", "Villous atrophy triggered by gluten", "Out-pouchings of the sigmoid colon"], "Crohn's is transmural with skip lesions (often terminal ileum), causing granulomas, fistulas and 'cobblestone' mucosa."),
  q("dig-disease", "Ulcerative colitis inflammation is:", "Continuous and mucosal, starting at the rectum", ["Transmural with skip lesions", "Granulomatous and full-thickness", "Limited to the terminal ileum"], "UC is continuous mucosal inflammation from the rectum upward, with crypt abscesses; colectomy can cure it."),
  q("dig-disease", "Celiac disease is an immune reaction to:", "Gluten (gliadin)", ["Lactose", "H. pylori", "NSAIDs"], "In HLA-DQ2/DQ8 people, gluten triggers villous atrophy and malabsorption; anti-tissue transglutaminase IgA helps diagnose it."),
  q("dig-disease", "Peptic ulcer disease is most often caused by:", "H. pylori infection and NSAIDs", ["Gluten sensitivity", "Gallstones", "Low lactase"], "H. pylori and NSAIDs overwhelm mucosal defenses; a urea breath test or stool antigen detects H. pylori."),
  q("dig-disease", "Appendicitis pain classically migrates to:", "McBurney's point (right lower quadrant)", ["The left lower quadrant", "The epigastrium only", "The right upper quadrant"], "Pain often starts peri-umbilically and localizes to McBurney's point in the right lower quadrant."),
  q("dig-disease", "GERD can progress to Barrett's esophagus, which is:", "Metaplasia to columnar epithelium", ["Squamous cell carcinoma", "Villous atrophy", "A bleeding peptic ulcer"], "Chronic acid reflux can change the lower esophagus from squamous to columnar epithelium (Barrett's), a cancer risk factor."),
  q("dig-disease", "Charcot's triad — fever, jaundice and right-upper-quadrant pain — indicates:", "Ascending cholangitis", ["Appendicitis", "Pancreatitis", "Lactose intolerance"], "Charcot's triad signals an infected, obstructed bile duct (ascending cholangitis). Murphy's sign suggests cholecystitis."),
  q("dig-disease", "The two most common causes of pancreatitis are:", "Gallstones and alcohol", ["H. pylori and NSAIDs", "Gluten and lactose", "Hepatitis B and C"], "Gallstones and alcohol top the list; pancreatitis gives pain radiating to the back and a raised lipase."),
  q("dig-disease", "Which enzyme is most useful to confirm acute pancreatitis?", "Lipase", ["Anti-tissue transglutaminase IgA", "ALT", "Rheumatoid factor"], "Serum lipase rises in pancreatitis and is more specific than amylase."),
  q("dig-disease", "Lactose intolerance is confirmed with a:", "Hydrogen breath test", ["Colonoscopy", "Sweat chloride test", "Anti-tTG antibody test"], "Undigested lactose fermented by colonic bacteria raises breath hydrogen."),

  /* ============================== IMMUNE =============================== */

  // --- Lymphoid organs ---
  q("imm-organs", "B lymphocytes mature in the:", "Bone marrow", ["Thymus", "Spleen", "Lymph nodes"], "B cells mature in the bone marrow; T cells leave the marrow and mature in the thymus."),
  q("imm-organs", "T lymphocytes mature in the:", "Thymus", ["Bone marrow", "Spleen", "Liver"], "The thymus is where T cells undergo positive and negative selection; it shrinks after puberty."),
  q("imm-organs", "Which is a PRIMARY lymphoid organ?", "Thymus", ["Spleen", "Lymph node", "Tonsil"], "Primary lymphoid organs (bone marrow, thymus) are where lymphocytes mature; secondary organs are where responses start."),
  q("imm-organs", "The white pulp of the spleen is:", "Lymphoid tissue that reacts to blood-borne antigens", ["Where old red blood cells are filtered", "A site of B-cell maturation", "Where red blood cells are produced"], "White pulp is lymphoid; red pulp filters and removes aged red blood cells."),
  q("imm-organs", "In a lymph node, T cells are concentrated in the:", "Paracortex", ["Cortical follicles", "Medullary sinuses", "Capsule"], "B cells sit in cortical follicles, T cells in the paracortex, and macrophages in the medullary sinuses."),
  q("imm-organs", "The dendritic (antigen-presenting) cells of the skin are called:", "Langerhans cells", ["Kupffer cells", "Mast cells", "Paneth cells"], "Langerhans cells are the skin's dendritic cells, sampling antigens that cross the epidermal barrier."),

  // --- Innate immunity ---
  q("imm-innate", "All three complement pathways converge on:", "C3", ["C1", "C5", "C9"], "Classical, lectin and alternative pathways all activate C3, the central hub of complement."),
  q("imm-innate", "The membrane attack complex is built from complement proteins:", "C5b–C9", ["C3a and C5a", "C3b alone", "C1 through C3"], "C5b–C9 assemble into a pore (the MAC) that lyses target cells."),
  q("imm-innate", "The main role of C3b is:", "Opsonization (tagging microbes for phagocytosis)", ["Forming membrane pores", "Acting as a chemoattractant", "Causing fever"], "C3b coats pathogens for phagocytes; C3a/C5a drive inflammation and recruitment; C5b–C9 form the MAC."),
  q("imm-innate", "Toll-like receptor 4 (TLR4) recognizes:", "LPS of Gram-negative bacteria", ["Double-stranded RNA", "Flagellin", "Unmethylated CpG DNA"], "TLR4 senses LPS; TLR3 senses dsRNA, TLR5 flagellin, TLR9 CpG DNA. Signaling activates NF-κB."),
  q("imm-innate", "The most abundant white blood cell and the first responder to infection is the:", "Neutrophil", ["Macrophage", "Eosinophil", "Lymphocyte"], "Neutrophils are the most numerous leukocytes and arrive first at sites of infection."),
  q("imm-innate", "Natural killer (NK) cells preferentially kill cells that:", "Are missing MHC class I", ["Over-express MHC class I", "Present antigen on MHC class II", "Carry surface IgE"], "'Missing self': NK cells destroy cells (e.g. virus-infected or tumor) that have downregulated MHC I."),
  q("imm-innate", "Fever is produced when IL-1, IL-6 and TNF-α make the hypothalamus release:", "Prostaglandin E₂", ["Histamine", "Bradykinin", "Interferon-γ"], "These pyrogenic cytokines raise the hypothalamic set point via prostaglandin E₂."),
  q("imm-innate", "The best antigen-presenting cells, linking innate and adaptive immunity, are:", "Dendritic cells", ["Neutrophils", "NK cells", "Mast cells"], "Dendritic cells capture antigen and activate naive T cells, bridging the two arms of immunity."),
  q("imm-innate", "Which is NOT one of the five cardinal signs of inflammation?", "Itching", ["Redness", "Heat", "Swelling"], "The five signs are redness, heat, swelling, pain and loss of function. Itching is not one of them."),

  // --- Adaptive immunity ---
  q("imm-adaptive", "MHC class I presents antigen to:", "CD8⁺ cytotoxic T cells", ["CD4⁺ helper T cells", "B cells", "NK cells"], "MHC I is on all nucleated cells and shows internal (e.g. viral) peptides to CD8⁺ T cells."),
  q("imm-adaptive", "MHC class II is found on:", "Antigen-presenting cells (dendritic cells, macrophages, B cells)", ["All nucleated cells", "Red blood cells", "Only T cells"], "MHC II on professional APCs presents external antigens to CD4⁺ helper T cells."),
  q("imm-adaptive", "Cytotoxic T cells kill their targets using:", "Perforin and granzymes", ["Histamine", "Complement", "Secreted antibodies"], "CD8⁺ T cells punch holes with perforin and inject granzymes to trigger apoptosis."),
  q("imm-adaptive", "Receptor diversity in B and T cells is generated by:", "V(D)J recombination (RAG1/RAG2)", ["Somatic hypermutation only", "Class switching", "Clonal deletion"], "V(D)J recombination shuffles gene segments to make millions of distinct receptors before any antigen is seen."),
  q("imm-adaptive", "Negative selection in the thymus:", "Deletes T cells that strongly bind self-antigen", ["Keeps cells that bind self-MHC", "Occurs only in the cortex", "Generates receptor diversity"], "Negative selection (medulla, aided by AIRE) removes self-reactive T cells — part of central tolerance."),
  q("imm-adaptive", "Full activation of a naive T cell requires antigen–MHC plus:", "Co-stimulation (B7 on the APC binding CD28)", ["Complement", "Histamine", "Perforin"], "Without signal 2 (co-stimulation), the T cell becomes anergic instead of activated."),
  q("imm-adaptive", "In germinal centers, B cells improve antibody affinity through:", "Somatic hypermutation", ["V(D)J recombination", "Negative selection", "Positive selection"], "Somatic hypermutation plus selection (affinity maturation) yields higher-affinity antibodies; class switching changes the isotype."),
  q("imm-adaptive", "Which helper T subset suppresses immune responses?", "Regulatory T cells (Tregs)", ["Th1", "Th2", "Th17"], "Tregs dampen responses and maintain tolerance; Th1 activates macrophages, Th2 helps B cells, Th17 drives neutrophilic inflammation."),
  q("imm-adaptive", "A primary (first-exposure) immune response produces mostly which antibody?", "IgM", ["IgG", "IgA", "IgE"], "The primary response is slow and makes mainly IgM; the faster, larger secondary response makes high-affinity IgG."),

  // --- Antibodies ---
  q("imm-antibodies", "Which antibody class crosses the placenta?", "IgG", ["IgM", "IgA", "IgE"], "IgG crosses the placenta, giving the newborn passive immunity, and dominates the secondary response."),
  q("imm-antibodies", "The first antibody made in a response and the best at activating complement is:", "IgM", ["IgG", "IgA", "IgD"], "IgM is made first; as a pentamer it's very efficient at fixing complement."),
  q("imm-antibodies", "Which antibody dominates mucosal secretions such as saliva and breast milk?", "IgA", ["IgG", "IgM", "IgE"], "Secretory IgA (a dimer) protects mucosal surfaces and is passed to infants in breast milk."),
  q("imm-antibodies", "Which antibody binds mast cells and basophils to mediate allergy?", "IgE", ["IgG", "IgA", "IgD"], "IgE arms mast cells; cross-linking by allergen triggers histamine release (type I hypersensitivity)."),
  q("imm-antibodies", "In serum, IgM exists as a:", "Pentamer", ["Monomer", "Dimer", "Trimer"], "Secreted IgM is a pentamer held by a J chain, giving it ten antigen-binding sites."),
  q("imm-antibodies", "The part of an antibody that binds antigen is the:", "Fab (variable) region", ["Fc (constant) region", "J chain", "Hinge alone"], "The Fab arms (variable regions) bind antigen; the Fc stem sets the class and effector functions."),
  q("imm-antibodies", "An antibody's class and effector functions are determined by its:", "Fc (constant) region", ["Fab region", "Light chains only", "Variable region"], "The constant (Fc) region binds Fc receptors and complement and defines whether the antibody is IgG, IgA, etc."),

  // --- Immunity & vaccines ---
  q("imm-vaccines", "Maternal IgG crossing the placenta is an example of:", "Natural passive immunity", ["Natural active immunity", "Artificial passive immunity", "Artificial active immunity"], "The antibodies are received (passive) and transferred naturally — natural passive immunity."),
  q("imm-vaccines", "Vaccination is an example of:", "Artificial active immunity", ["Artificial passive immunity", "Natural active immunity", "Natural passive immunity"], "A vaccine makes your own body build antibodies and memory (active) by an artificial route."),
  q("imm-vaccines", "The MMR vaccine is which type?", "Live attenuated", ["Toxoid", "mRNA", "Inactivated"], "MMR uses weakened live viruses; it gives strong immunity but isn't given to immunocompromised people."),
  q("imm-vaccines", "The tetanus vaccine is a:", "Toxoid", ["Live attenuated vaccine", "Subunit vaccine", "Viral-vector vaccine"], "Tetanus and diphtheria vaccines use inactivated toxins (toxoids) to raise neutralizing antibodies."),
  q("imm-vaccines", "Antivenom provides:", "Passive immunity (immediate but temporary)", ["Active immunity", "Lifelong memory", "Herd immunity"], "Pre-formed antibodies act at once but fade, giving no lasting memory — passive immunity."),
  q("imm-vaccines", "Herd immunity mainly protects:", "People who cannot be vaccinated", ["Only those who are vaccinated", "People with passive immunity only", "Antibody donors"], "When enough people are immune, transmission drops, shielding those who can't be vaccinated."),
  q("imm-vaccines", "The COVID-19 Pfizer/Moderna vaccines are which type?", "mRNA", ["Toxoid", "Live attenuated", "Subunit"], "They deliver mRNA encoding the spike protein, which cells translate to prompt an immune response."),

  // --- Hypersensitivity ---
  q("imm-hyper", "Anaphylaxis is which hypersensitivity type?", "Type I", ["Type II", "Type III", "Type IV"], "Type I is immediate, IgE-mediated; examples include anaphylaxis, allergic asthma and urticaria."),
  q("imm-hyper", "Myasthenia gravis is which hypersensitivity type?", "Type II", ["Type I", "Type III", "Type IV"], "Type II is antibody-mediated against cell-surface antigens; in myasthenia gravis, antibodies block ACh receptors."),
  q("imm-hyper", "Serum sickness is which hypersensitivity type?", "Type III", ["Type I", "Type II", "Type IV"], "Type III involves antigen–antibody immune complexes depositing and activating complement (serum sickness, Arthus reaction)."),
  q("imm-hyper", "Contact dermatitis from poison ivy is which type?", "Type IV", ["Type I", "Type II", "Type III"], "Type IV is delayed (48–72 h) and T-cell mediated; poison ivy, nickel allergy and the TB skin test are examples."),
  q("imm-hyper", "Type I hypersensitivity is mediated by:", "IgE bound to mast cells", ["IgG against cell-surface antigens", "Immune complexes", "T cells and macrophages"], "Allergen cross-links IgE on mast cells, releasing histamine within minutes."),
  q("imm-hyper", "Type IV hypersensitivity is mediated by:", "T cells and macrophages (delayed)", ["IgE on mast cells", "IgM pentamers", "Circulating immune complexes"], "Type IV takes 48–72 hours and is driven by T cells, not antibodies."),
  q("imm-hyper", "Graves' disease is classified as which hypersensitivity type?", "Type II", ["Type I", "Type III", "Type IV"], "Antibodies that stimulate the TSH receptor cause Graves' disease — an antibody-mediated (type II) reaction."),

  // --- Immune disorders ---
  q("imm-disease", "HIV enters CD4⁺ T cells using CD4 and the coreceptor:", "CCR5 or CXCR4", ["MHC class I", "CD8", "TLR4"], "HIV binds CD4 plus a chemokine coreceptor (CCR5 or CXCR4) to enter helper T cells."),
  q("imm-disease", "AIDS is defined by a CD4⁺ count below:", "200 per µL", ["500 per µL", "1,000 per µL", "50 per µL"], "A CD4 count under 200/µL (or an AIDS-defining illness) marks progression from HIV to AIDS."),
  q("imm-disease", "SCID patients lack:", "Functional T cells (and therefore working B cells)", ["Only B cells", "Only complement", "Only antibodies"], "Severe combined immunodeficiency knocks out T cells, so B-cell help fails too; a bone-marrow transplant can cure it."),
  q("imm-disease", "Hashimoto's thyroiditis (anti-TPO antibodies) causes:", "Hypothyroidism", ["Hyperthyroidism", "Dry eyes and mouth", "A joint pannus"], "Hashimoto's is the most common cause of hypothyroidism; Graves' causes hyperthyroidism."),
  q("imm-disease", "The antibodies of Graves' disease stimulate the:", "TSH receptor", ["Acetylcholine receptor", "Thyroid peroxidase enzyme", "Insulin receptor"], "Stimulating anti-TSH-receptor antibodies drive hyperthyroidism and bulging eyes."),
  q("imm-disease", "Rheumatoid arthritis is associated with which antibodies?", "Rheumatoid factor and anti-CCP", ["Anti-dsDNA", "Anti-TPO", "Anti-mitochondrial"], "RF and anti-CCP mark rheumatoid arthritis, a symmetric small-joint disease with pannus formation."),
  q("imm-disease", "Multiple sclerosis involves immune attack on:", "CNS myelin", ["Acetylcholine receptors", "Salivary glands", "Joint cartilage"], "In MS, T cells attack central-nervous-system myelin, producing relapsing–remitting neurologic deficits and MRI plaques."),
  q("imm-disease", "Sjögren's syndrome classically causes:", "Dry eyes and dry mouth", ["Bulging eyes", "A malar (butterfly) rash", "Proximal muscle weakness"], "Sjögren's attacks tear and salivary glands (anti-Ro/La antibodies), causing dryness."),

  // --- Signaling & transplants (advanced) ---
  q("imm-signaling", "The JAK-STAT pathway is activated downstream of:", "Cytokine receptors", ["Toll-like receptors", "Complement", "B7–CD28 co-stimulation"], "Cytokine receptors activate JAKs, which phosphorylate STATs that switch on genes; JAK inhibitors treat RA."),
  q("imm-signaling", "The cGAS-STING pathway senses:", "DNA in the cytoplasm", ["LPS", "Flagellin", "Double-stranded RNA"], "cGAS detects cytoplasmic DNA and makes cGAMP, activating STING and type I interferon responses."),
  q("imm-signaling", "Interferon-γ (IFN-γ) chiefly:", "Activates macrophages", ["Directly lyses viruses", "Promotes IgE class switching", "Suppresses all T cells"], "IFN-γ is the key macrophage-activating cytokine; type I interferons (α, β) are the antiviral ones."),
  q("imm-signaling", "Hyperacute transplant rejection (within minutes) is caused by:", "Pre-formed antibodies (e.g. against ABO)", ["T cells acting over weeks", "Vessel scarring over years", "Donor T cells attacking the host"], "Pre-existing recipient antibodies trigger hyperacute rejection; acute rejection is T-cell mediated, chronic is vascular scarring."),
  q("imm-signaling", "Graft-versus-host disease occurs when:", "Donor T cells attack the recipient's tissues", ["Recipient antibodies attack the graft", "Recipient T cells reject the graft", "Pre-formed antibodies act within minutes"], "After a bone-marrow transplant, donor T cells can attack the host's skin, liver and gut."),
  q("imm-signaling", "CAR-T cell therapy uses:", "A patient's own T cells, engineered to target a tumor antigen", ["Donor-derived antibodies", "An attenuated virus", "Injected cytokines alone"], "CAR-T re-engineers a patient's T cells to recognize antigens such as CD19 on cancer cells."),
  q("imm-signaling", "Which cytokines are broadly immunosuppressive?", "IL-10 and TGF-β", ["IL-2 and TNF-α", "IFN-γ and IL-1", "IL-4 and IL-6"], "IL-10 and TGF-β damp immune responses; IL-2 drives T-cell growth and TNF-α/IL-1 are pro-inflammatory."),
];

export const ANATOMY_QUESTIONS: readonly AnatomyQuestion[] = BANK.map((item, i) => ({
  ...item,
  id: `${item.topic}-${String(i).padStart(3, "0")}`,
}));

export function questionsForTopics(slugs: readonly string[]): AnatomyQuestion[] {
  if (!slugs.length) return ANATOMY_QUESTIONS.slice();
  const set = new Set(slugs);
  return ANATOMY_QUESTIONS.filter((q) => set.has(q.topic));
}

export function countForTopics(slugs: readonly string[]): number {
  return questionsForTopics(slugs).length;
}

// mulberry32 — a tiny deterministic RNG so a seed reproduces the same quiz.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWith<T>(arr: readonly T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export interface QuizItem {
  id: string;
  topic: string;
  system: System;
  prompt: string;
  choices: string[];
  /** Index of the correct choice. */
  answer: number;
  explanation: string;
}

/* ------------------------------- Progress stats ------------------------------ */

export type QuizMode = "practice" | "test";

/** One finished quiz run (for the dashboard). */
export interface AnatomyRunRow {
  mode: QuizMode;
  total: number;
  score: number;
  finishedAt: number;
}

/** One answered question (for per-topic / per-system accuracy). */
export interface AnatomyAnswerRow {
  topic: string;
  correct: boolean;
  at: number;
}

export interface SystemStat {
  system: System;
  answered: number;
  correct: number;
}

export interface TopicStat {
  topic: string;
  label: string;
  system: System;
  answered: number;
  correct: number;
}

export interface AnatomyStats {
  runs: number;
  testsTaken: number;
  answered: number;
  correct: number;
  /** 0–1 over all answered questions. */
  accuracy: number;
  /** Best timed-test percentage (0–100), or null if no test finished. */
  bestTestPct: number | null;
  /** Consecutive days with at least one answer, ending today or yesterday. */
  streakDays: number;
  bySystem: SystemStat[];
  /** Topics the student is weakest on (≥3 answered, under 80%). */
  weakestTopics: TopicStat[];
  /** Most recent runs, newest first. */
  recent: AnatomyRunRow[];
}

function dayNumber(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 86_400_000);
}

export function computeAnatomyStats(runs: AnatomyRunRow[], answers: AnatomyAnswerRow[], now = Date.now()): AnatomyStats {
  const correct = answers.filter((a) => a.correct).length;
  const answered = answers.length;

  const bySystemMap = new Map<System, SystemStat>(SYSTEMS.map((s) => [s, { system: s, answered: 0, correct: 0 }]));
  const byTopic = new Map<string, TopicStat>();
  for (const a of answers) {
    const system = systemOfTopic(a.topic);
    if (system) {
      const ss = bySystemMap.get(system)!;
      ss.answered++;
      if (a.correct) ss.correct++;
    }
    const ts =
      byTopic.get(a.topic) ??
      byTopic.set(a.topic, { topic: a.topic, label: topicLabel(a.topic), system: system ?? "Respiratory", answered: 0, correct: 0 }).get(a.topic)!;
    ts.answered++;
    if (a.correct) ts.correct++;
  }

  const weakestTopics = [...byTopic.values()]
    .filter((t) => t.answered >= 3 && t.correct / t.answered < 0.8)
    .sort((a, b) => a.correct / a.answered - b.correct / b.answered)
    .slice(0, 5);

  const tests = runs.filter((r) => r.mode === "test" && r.total > 0);
  const bestTestPct = tests.length ? Math.max(...tests.map((r) => Math.round((r.score / r.total) * 100))) : null;

  // Day streak from the days that have at least one answer.
  const days = [...new Set(answers.map((a) => dayNumber(a.at)))].sort((a, b) => b - a);
  let streakDays = 0;
  if (days.length) {
    const today = dayNumber(now);
    if (days[0] === today || days[0] === today - 1) {
      streakDays = 1;
      for (let i = 1; i < days.length; i++) {
        if (days[i] === days[i - 1]! - 1) streakDays++;
        else break;
      }
    }
  }

  return {
    runs: runs.length,
    testsTaken: tests.length,
    answered,
    correct,
    accuracy: answered ? correct / answered : 0,
    bestTestPct,
    streakDays,
    bySystem: [...bySystemMap.values()],
    weakestTopics,
    recent: runs.slice().sort((a, b) => b.finishedAt - a.finishedAt).slice(0, 6),
  };
}

/** One-line summary for the home dashboard, or "" when there's nothing yet. */
export function anatomyProgressLine(stats: AnatomyStats): string {
  if (!stats.answered) return "";
  const parts = [`${stats.answered} questions · ${Math.round(stats.accuracy * 100)}% correct`];
  if (stats.bestTestPct != null) parts.push(`best test ${stats.bestTestPct}%`);
  if (stats.streakDays > 1) parts.push(`${stats.streakDays}-day streak`);
  return parts.join(" · ");
}

/**
 * Build a quiz of up to `count` questions from the chosen topics (empty = all),
 * reproducibly from `seed`. Choices are shuffled per question.
 */
export function buildQuiz(topicSlugs: readonly string[], count: number, seed: number): QuizItem[] {
  const pool = questionsForTopics(topicSlugs);
  const rand = mulberry32(seed || 1);
  const picked = shuffleWith(pool, rand).slice(0, Math.max(1, Math.min(count, pool.length)));
  return picked.map((q, i) => {
    const cr = mulberry32((seed || 1) + i * 101 + 7);
    const choices = shuffleWith([q.answer, ...q.distractors], cr);
    return {
      id: q.id,
      topic: q.topic,
      system: systemOfTopic(q.topic) ?? "Respiratory",
      prompt: q.prompt,
      choices,
      answer: choices.indexOf(q.answer),
      explanation: q.explanation,
    };
  });
}
