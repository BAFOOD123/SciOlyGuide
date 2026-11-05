---
title: Designer Genes
type: Core knowledge
summary: Classical, population and molecular genetics plus lab techniques, with an emphasis on calculations and interpreting experiments.
---

## At a glance

| | |
|---|---|
| **Team** | Up to 2 |
| **Time** | About 50 minutes |
| **Format** | Written test, possibly in stations. Heavy on **process skills**: calculations, interpreting experiments, evidence-based conclusions. |
| **You may bring** | Writing utensils, two Class II calculators, and **one 8.5″ × 11″ sheet** of notes (both sides; may be laminated or in a sheet protector) |
| **Scoring** | Highest score wins. Points for accuracy **and quality of reasoning**. Preselected tiebreakers. |
| **Scope** | The rules' topic list is **exhaustive**: six areas, with no area overemphasized |

> [!NOTE]
> This guide summarizes the 2026–27 rules. The official rules manual on soinc.org is the final word on scope.

## How the event runs

Expect a long test with problems like "here's a pedigree, what's the mode of inheritance?", "calculate map distances from these testcross results," "this mutant phenotype appears after a CRISPR knockout; what do you conclude?" and "interpret this gel." Show your reasoning: partial credit is common and **reasoning is scored**.

The six topics are Mendelian genetics, mitosis and meiosis, population and evolutionary genetics, DNA molecular biology, gene expression and regulation, and technology and techniques. Split them three and three with your partner, but both should be able to do Punnett squares and probability.

## Mendelian genetics

### Mendel's laws

1. **Segregation:** each individual has two alleles for a gene, which separate into different gametes (anaphase I of meiosis).
2. **Independent assortment:** alleles of different genes sort into gametes independently, **if the genes are on different chromosomes or far apart** (metaphase I orientation).
3. **Dominance:** in a heterozygote, the dominant allele determines the phenotype.

### Crosses and probability

| Cross | Phenotype ratio |
|---|---|
| Monohybrid Aa × Aa | 3:1 (genotypes 1:2:1) |
| Testcross Aa × aa | 1:1 |
| Dihybrid AaBb × AaBb | **9:3:3:1** |
| Dihybrid testcross AaBb × aabb | 1:1:1:1 (if unlinked) |
| Trihybrid AaBbCc × AaBbCc | 27:9:9:9:3:3:3:1 |

**Don't draw huge Punnett squares.** Use probability rules:

- **Product rule (AND):** P(A and B) = P(A) × P(B) for independent events.
- **Sum rule (OR):** P(A or B) = P(A) + P(B) for mutually exclusive events.
- **Binomial:** P(exactly k of n) = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ. Example: chance that 2 of 4 children of carrier parents have a recessive disorder = 6 × (1/4)² × (3/4)² = 54/256 ≈ 0.211.
- **Conditional probability:** an unaffected child of two carriers has a **2/3** chance of being a carrier (not 1/2), since the aa outcome is ruled out.

> [!TIP]
> Example: in AaBbCc × AaBbCc, P(aaB_Cc) = 1/4 × 3/4 × 1/2 = 3/32.

**Chi-square test:** χ² = Σ (O − E)² / E, with degrees of freedom = number of categories − 1. If χ² is below the critical value at p = 0.05 (3.84 for df = 1, 5.99 for df = 2, 7.81 for df = 3), the data fit the expected ratio.

### Beyond simple dominance

| Pattern | What happens | Example |
|---|---|---|
| **Incomplete dominance** | Heterozygote is intermediate; 1:2:1 phenotype ratio | Snapdragon red × white = pink |
| **Codominance** | Both alleles fully shown | ABO blood type (Iᴬ Iᴮ = AB), roan cattle |
| **Multiple alleles** | More than two alleles in the population | ABO: Iᴬ, Iᴮ, i |
| **Lethal alleles** | Homozygotes die, giving a 2:1 ratio | Yellow mice (A^Y) |
| **Pleiotropy** | One gene, many traits | Marfan syndrome, sickle-cell |
| **Linkage** | Genes close together on a chromosome are inherited together, which breaks independent assortment | Bateson & Punnett's sweet peas, Morgan's flies |
| **Complementation** | Two recessive mutants with the same phenotype are crossed: wild-type offspring mean **different genes**; mutant offspring mean the **same gene** | Deaf parents with hearing children |
| **Sex-linked** | Genes on the X (or Y) | Hemophilia, color blindness (X-linked recessive) |
| **Sex-influenced and sex-limited** | Expression depends on sex | Pattern baldness; milk yield |
| **Penetrance and expressivity** | Not everyone with the genotype shows the trait; or shows it to different degrees | Polydactyly |
| **Genomic imprinting** | Expression depends on which parent gave the allele | Prader–Willi / Angelman |
| **Maternal (cytoplasmic) inheritance** | Mitochondrial genes come only from the mother | Mitochondrial disorders |

### Epistasis

One gene masks or modifies another. The 9:3:3:1 ratio gets merged:

| Type | Ratio | Example |
|---|---|---|
| **Recessive epistasis** | **9:3:4** | Labrador coat: ee masks the B gene, giving yellow (B_E_ black, bbE_ chocolate, __ee yellow) |
| **Dominant epistasis** | **12:3:1** | Squash color |
| **Duplicate recessive (complementary genes)** | **9:7** | Sweet pea flower color: both genes need a dominant allele (two steps in a pathway) |
| **Duplicate dominant** | **15:1** | Shepherd's purse seed shape |
| **Dominant suppression** | **13:3** | Chicken feather color |

### Pedigrees

![Pedigree chart symbols](img:genes-pedigree)

Squares are males, circles are females, filled symbols are affected, half-filled are carriers. A horizontal line between them is a mating; a vertical line goes to children.

| Mode | Clues |
|---|---|
| **Autosomal dominant** | Appears every generation; affected children have an affected parent; equal in males and females; two affected parents can have an **unaffected** child |
| **Autosomal recessive** | Skips generations; two **unaffected** parents can have an affected child; often with consanguinity (cousins marrying) |
| **X-linked recessive** | Mostly **males**; passed from carrier mothers to sons; **no father-to-son** transmission; affected daughters need an affected father |
| **X-linked dominant** | An affected father passes it to **all daughters** and no sons; more females affected |
| **Y-linked** | Father to all sons only |
| **Mitochondrial** | Affected mother passes it to all children; affected fathers pass it to none |

**Strategy:** test each mode and rule it out. One counterexample eliminates a mode.

### Gene mapping (State: two genes, National: three)

- **Recombination frequency (RF)** = recombinant offspring / total offspring. **1% RF = 1 map unit (centimorgan, cM).** RF can't go above 50% (unlinked genes look 50% recombinant).
- **Two-point mapping:** in a testcross, the two most numerous classes are **parental**; the less common ones are recombinant.
- **Three-point testcross:**
  1. Find the **parental** classes (most common pair) and the **double crossover** (least common pair).
  2. The **middle gene** is the one that's "switched" between parental and double crossover.
  3. Distance between each pair = (single crossovers in that interval + double crossovers) / total.
  4. **Coefficient of coincidence** = observed double crossovers / expected (RF₁ × RF₂ × total). **Interference** = 1 − coincidence.

> [!TIP]
> Example: 1,000 offspring. Parentals ABC 390, abc 380; singles (A–B interval) Abc 60, aBC 70; singles (B–C) ABc 45, abC 40; doubles AbC 8, aBc 7. A–B = (60 + 70 + 15)/1,000 = 14.5 cM; B–C = (45 + 40 + 15)/1,000 = 10 cM. Expected doubles = 0.145 × 0.10 × 1,000 = 14.5; coincidence = 15/14.5 ≈ 1.03.

## Mitosis and meiosis

![Stages of meiosis](img:genes-meiosis)

| | Mitosis | Meiosis |
|---|---|---|
| Purpose | Growth, repair, asexual reproduction | Gametes (sexual reproduction) |
| Divisions | 1 | 2 |
| Products | 2 identical diploid cells | 4 different haploid cells |
| Pairing of homologs | No | **Yes**, in prophase I (synapsis, tetrads, **crossing over** at chiasmata) |
| Separates | Sister chromatids | Homologs (I), then sister chromatids (II) |

**Stages:** prophase (chromosomes condense, spindle forms), prometaphase (nuclear envelope breaks down, kinetochores attach), metaphase (chromosomes line up), anaphase (separate), telophase and cytokinesis. **Prophase I** substages: leptotene, zygotene (synapsis via the **synaptonemal complex**), pachytene (crossing over), diplotene (chiasmata visible), diakinesis.

**Key structures:** centromere, kinetochore, cohesin (holds sister chromatids together; separase cuts it at anaphase; **shugoshin** protects centromere cohesin in meiosis I), centrosomes and spindle, cell plate (plants) vs cleavage furrow (animals).

**Sources of variation:** crossing over, independent assortment (2²³ ≈ 8.4 million combinations in humans), random fertilization.

### Nondisjunction and karyotypes

![A human karyotype](img:genes-karyotype)

**Nondisjunction:** chromosomes fail to separate. In meiosis I, all four gametes are abnormal (two n+1, two n−1). In meiosis II, two are abnormal and two normal. The result is **aneuploidy**:

| Condition | Karyotype |
|---|---|
| **Down syndrome** | Trisomy 21 (47,XX,+21); risk rises with maternal age |
| Edwards syndrome | Trisomy 18 |
| Patau syndrome | Trisomy 13 |
| **Turner syndrome** | 45,X (the only viable monosomy) |
| **Klinefelter syndrome** | 47,XXY |
| Triple X, XYY | 47,XXX; 47,XYY |

**Reading a karyotype:** chromosomes are paired and ordered by size and centromere position (metacentric, submetacentric, acrocentric). Look for extra or missing chromosomes, and structural changes like deletions (cri-du-chat: 5p−), translocations (**Robertsonian translocation** of 14 and 21 causes familial Down syndrome; **the Philadelphia chromosome** t(9;22) causes chronic myeloid leukemia), inversions and duplications.

### V(D)J recombination and class switching (State and National)

Somatic (not germline) DNA rearrangement in developing **B and T cells**:

- **V(D)J recombination:** the **RAG1/RAG2** enzymes cut at **recombination signal sequences** (following the 12/23 rule), joining one V, one D (heavy chains only) and one J gene segment. The ends are joined by **non-homologous end joining**; TdT adds random nucleotides at junctions for extra diversity. This makes millions of different antibodies and T-cell receptors.
- **Class switch recombination:** after activation, a B cell swaps its constant region (Cμ → Cγ, Cα or Cε) by recombining between **switch regions** and deleting the DNA in between. The enzyme **AID** (activation-induced cytidine deaminase) starts it. The antigen-binding part stays the same; the antibody class changes (IgM → IgG, IgA, IgE).
- **Somatic hypermutation** (also AID) mutates variable regions to improve affinity.

## Population and evolutionary genetics

### Hardy–Weinberg equilibrium

For two alleles with frequencies p and q: **p + q = 1** and **p² + 2pq + q² = 1** (genotype frequencies AA, Aa, aa).

**Assumptions:** no mutation, no migration (gene flow), no selection, random mating and a large population (no genetic drift). Break any one and frequencies can change.

> [!TIP]
> Example: 1 in 2,500 newborns has cystic fibrosis (aa). q² = 0.0004, q = 0.02, p = 0.98. Carriers: 2pq = 0.0392, about 1 in 25.

- **X-linked genes:** in males, frequency of the trait = q. In females, q².
- **Three alleles** (like ABO): p + q + r = 1, and (p + q + r)² gives genotype frequencies.
- **Testing equilibrium:** compute expected genotype counts from the allele frequencies and do a χ² test (df = 1 for two alleles: 3 genotypes − 1 − 1 estimated parameter).

### Forces of evolution

- **Genetic drift:** random change in allele frequencies, strongest in small populations. **Founder effect:** a small group starts a new population (Amish and Ellis–van Creveld syndrome). **Bottleneck:** a population crashes and loses diversity (northern elephant seals, cheetahs).
- **Gene flow (migration):** moves alleles between populations, making them more similar.
- **Mutation:** the ultimate source of new alleles.
- **Natural selection:** **relative fitness** w = (survival × reproduction of a genotype) / (that of the best genotype). Selection coefficient s = 1 − w. Types: directional, stabilizing, disruptive; **heterozygote advantage** (sickle-cell allele protects against malaria).
- **Non-random mating:** inbreeding raises homozygosity without changing allele frequencies.

### Quantitative traits

**Additive alleles** (polygenic inheritance) each add a small amount to a trait, giving **continuous variation** (height, skin color) and a bell curve.

**Estimating the number of genes:** if a fraction **1/4ⁿ** of the F₂ shows one extreme parent's phenotype, then n genes are involved. With n genes, there are **2n + 1** phenotype classes. Example: 1/64 of the F₂ looks like one parent → 4ⁿ = 64 → n = 3 genes, 7 phenotype classes.

### Heritability (State and National)

- **Phenotypic variance** V_P = V_G + V_E (genetic + environmental). V_G = V_A (additive) + V_D (dominance) + V_I (interaction/epistasis).
- **Broad-sense heritability:** **H² = V_G / V_P**.
- **Narrow-sense heritability:** **h² = V_A / V_P**. This is what predicts response to selection.
- **Realized heritability** (the **breeder's equation**): **R = h² S**, so h² = R / S. S = selection differential (mean of selected parents − population mean); R = response (offspring mean − original population mean).
- Twin studies: in identical twins raised apart, differences are environmental. Heritability describes a **population in an environment**, not how "genetic" a trait is in one person.

> [!TIP]
> Example: population mean 100; selected parents' mean 120 (S = 20); offspring mean 108 (R = 8). h² = 8/20 = 0.40.

### Gene duplication and molecular evolution

- **Gene duplication** (unequal crossing over, retrotransposition, whole-genome duplication) gives extra copies that can mutate freely. Fates: **nonfunctionalization** (pseudogene), **neofunctionalization** (new function), **subfunctionalization** (split the original jobs). Example: the globin family (α and β clusters).
- **Homologs:** genes sharing a common ancestor. **Orthologs:** split by **speciation** (human and mouse β-globin). **Paralogs:** split by **duplication** in one genome (human α- and β-globin).

### Phylogenetic trees

![A phylogenetic tree](img:genes-phylogeny)

- **Parts:** root (common ancestor), nodes (splits), branches, tips (taxa). **Clade** (monophyletic group): an ancestor and **all** its descendants. Paraphyletic: an ancestor and some descendants. Polyphyletic: groups without their common ancestor. **Sister taxa** share a closest common ancestor.
- Rotating branches at a node doesn't change the tree.
- **Building a tree from sequences:** (1) collect homologous sequences, (2) **align** them (e.g., Clustal, MUSCLE), (3) choose a model and method: **distance** (UPGMA, neighbor-joining), **maximum parsimony** (fewest changes), **maximum likelihood** or **Bayesian**, (4) root with an **outgroup**, (5) test support with **bootstrapping**.
- **Organellar and extrachromosomal trees:** mitochondrial DNA (maternal, fast-evolving: "mitochondrial Eve"), chloroplast DNA, plasmids, and endosymbiosis (mitochondria from α-proteobacteria, chloroplasts from cyanobacteria). Gene trees can differ from species trees (horizontal gene transfer, incomplete lineage sorting).

## Molecular biology of DNA

### Structure

![The DNA double helix](img:genes-dna)

- **Nucleotide** = phosphate + deoxyribose + nitrogenous base. **Purines** (two rings): adenine, guanine. **Pyrimidines** (one ring): cytosine, thymine (uracil in RNA).
- **Backbone:** sugar–phosphate linked by **phosphodiester bonds** between the 3′ OH of one sugar and the 5′ phosphate of the next. Strands are **antiparallel** (5′→3′ paired with 3′→5′).
- **Base pairing:** A–T (2 hydrogen bonds), G–C (3 hydrogen bonds, so GC-rich DNA melts at higher temperature). **Chargaff's rules:** %A = %T, %G = %C.
- **B-DNA:** right-handed, ~10.5 base pairs per turn, 2 nm wide, major and minor grooves (proteins read sequence in the major groove). Discovered by Watson and Crick (1953) using Rosalind Franklin's X-ray image (Photo 51).

### Organization

- **Bacteria:** a circular chromosome in the **nucleoid**, plus **plasmids** (small circular DNA, often carrying antibiotic resistance). Supercoiling is controlled by **topoisomerases** (DNA gyrase).
- **Eukaryotes:** DNA wraps around **histone octamers** (H2A, H2B, H3, H4 × 2) to form **nucleosomes** (~147 base pairs; "beads on a string", 10 nm), packed by H1 into the 30 nm fiber, then loops and scaffolds, up to the mitotic chromosome.
- **Euchromatin:** loose, active genes, acetylated histones. **Heterochromatin:** dense, mostly silent; constitutive (centromeres, telomeres) or facultative (the inactive X, Barr body).

### Replication

![The DNA replication fork](img:genes-replication)

**Semiconservative** (Meselson–Stahl, 1958: ¹⁵N/¹⁴N density in cesium chloride gradients).

| Step | Bacteria | Eukaryotes (and similar in archaea) |
|---|---|---|
| Origins | One (**oriC**) | Many; licensed in G1 by the **pre-replication complex** (ORC → Cdc6 and Cdt1 → MCM2–7 helicase loaded); activated in S phase (CDK, DDK) to form the CMG helicase |
| Helicase | DnaB | MCM (CMG complex) |
| Single-strand binding | SSB | RPA |
| Primer | Primase (DnaG) makes RNA primers | Pol α–primase |
| Main polymerase | **DNA Pol III** (leading and lagging) | **Pol ε** (leading), **Pol δ** (lagging) |
| Sliding clamp / loader | β clamp / γ complex | **PCNA** / RFC |
| Primer removal | **Pol I** (5′→3′ exonuclease) | RNase H and FEN1 |
| Join fragments | **DNA ligase** | DNA ligase I |
| Termination | **Ter sites** bound by Tus | Forks meet; telomeres at the ends |

- Polymerases only add nucleotides to a 3′ OH, so synthesis is always **5′→3′**. The **leading strand** is continuous; the **lagging strand** is made in **Okazaki fragments** (~1,000–2,000 nucleotides in bacteria, ~100–200 in eukaryotes).
- **Archaea** use eukaryote-like machinery (MCM helicase, PCNA, multiple origins in many species) on a bacteria-like circular chromosome.

**Fidelity:** polymerases make ~1 error per 10⁵ nucleotides at first. **3′→5′ exonuclease proofreading** removes wrong bases (→ ~1 in 10⁷). **Mismatch repair** (MutS, MutL, MutH in *E. coli*, which recognizes the new strand because it isn't yet methylated at GATC sites) brings it to about 1 in 10⁹–10¹⁰. Correct base pairs fit the active site's shape (induced fit).

**End replication problem (State and National):** on the lagging strand, removing the last RNA primer leaves a gap that can't be filled, so linear chromosomes shorten each round. **Telomerase**, a reverse transcriptase carrying its own RNA template (TERT + TERC), adds repeats (**TTAGGG** in humans) to the 3′ overhang. The repeats form a protective T-loop with shelterin proteins. Telomerase is active in stem cells, germ cells and most cancers; normal cells hit the **Hayflick limit**.

### DNA damage and repair

| Damage | Cause | Repair |
|---|---|---|
| **Pyrimidine dimers** (thymine dimers, 6-4 photoproducts) | **UVB** directly (UVA mostly through reactive oxygen species, causing oxidized bases like 8-oxoG) | **Nucleotide excision repair** (NER): cuts out a ~12–13 (bacteria: UvrABC) or ~24–32 (eukaryotes: XPC, TFIIH, XPA, XPF, XPG) nucleotide stretch; polymerase fills, ligase seals. **Xeroderma pigmentosum** = NER defect. Bacteria also have photolyase. |
| **Double-strand breaks** | **Ionizing radiation** (X-rays, gamma), some drugs | **Non-homologous end joining** (Ku70/80, DNA-PKcs, ligase IV): fast, works any time, **error-prone** (small insertions/deletions). **Homology-directed repair** (MRN complex, BRCA1/2, RAD51 in eukaryotes; RecA, RecBCD in bacteria): uses the sister chromatid as a template, **accurate**, S/G2 only. |
| **Frameshifts** | **Intercalating agents** (ethidium bromide, acridine orange) slip between base pairs | Mismatch repair, or permanent mutations |
| Damaged single bases | Oxidation, deamination, alkylation | Base excision repair (glycosylases) |

### Mutations

| Level | Type | Effect |
|---|---|---|
| Base | **Substitution**: transition (purine↔purine) or transversion (purine↔pyrimidine) | **Silent** (same amino acid), **missense** (different amino acid: sickle-cell Glu→Val), **nonsense** (premature stop) |
| Base | **Insertion or deletion** | **Frameshift** if not a multiple of 3; in-frame if a multiple of 3 (CFTR ΔF508 deletes 3 bases) |
| Chromosome | Deletion, duplication, inversion (paracentric or pericentric), translocation (reciprocal or Robertsonian) | Gene dosage changes, broken genes, fusion genes (BCR-ABL) |

**Expansion of repeats** (Huntington's CAG, fragile X CGG) shows **anticipation**: worse in later generations.

## Gene expression and regulation

### Central dogma

DNA → (transcription) → RNA → (translation) → protein. Exceptions: reverse transcription (retroviruses, telomerase), RNA replication (RNA viruses), prions.

### Transcription

- **RNA polymerase** makes RNA 5′→3′ from the **template (antisense) strand**; the **coding (sense) strand** matches the RNA (with T instead of U). It doesn't need a primer.
- **Bacteria:** one RNA polymerase; the **σ factor** recognizes the promoter (−10 **TATAAT** Pribnow box, −35 TTGACA). Termination: **Rho-independent** (a GC-rich hairpin followed by U's) or **Rho-dependent**.
- **Eukaryotes:** **Pol I** (most rRNA), **Pol II** (mRNA, most snRNA, miRNA), **Pol III** (tRNA, 5S rRNA). Pol II needs **general transcription factors**: TFIID (its TBP subunit binds the **TATA box** ~−25 to −30) → TFIIB → Pol II with TFIIF → TFIIE → **TFIIH** (helicase; phosphorylates serine 5 of the Pol II **C-terminal domain**, starting elongation). Termination is coupled to cleavage at the polyadenylation signal (**AAUAAA**).
- **Initiation → elongation → termination**, including promoter clearance and abortive initiation.

### Regulation

- **Cis-acting elements** (DNA sequences on the same molecule): promoters, **enhancers** (can be thousands of bases away, either direction, looped to the promoter by Mediator), silencers, insulators.
- **Trans-acting factors** (proteins or RNAs that diffuse): **transcription factors** with a DNA-binding domain (helix-turn-helix, zinc finger, leucine zipper, helix-loop-helix) and an activation domain.
- **Riboswitches:** structured RNA regions (mostly in bacterial mRNA 5′ UTRs) that bind a small molecule and change shape, switching transcription termination or translation.
- **Epigenetics:** DNA **methylation** at CpG islands (silences genes), histone **acetylation** (opens chromatin; HATs vs HDACs), histone methylation (H3K4me3 active; H3K9me3, H3K27me3 repressed), imprinting, X inactivation (XIST RNA).
- **Operons (bacteria):** *lac* (inducible: repressor released by allolactose; CAP-cAMP activates when glucose is low) and *trp* (repressible; attenuation).
- **Yeast two-hybrid screening:** transcription factors like **Gal4** have separable DNA-binding (BD) and activation (AD) domains. Fuse protein X ("bait") to the BD and protein Y ("prey") to the AD. If X and Y **interact**, the domains come together and a **reporter gene** turns on (yeast grows on selective media or turns blue). Used to find protein–protein interactions; false positives and negatives happen.

### RNA processing

- **5′ cap:** 7-methylguanosine joined 5′–5′ (protects the RNA, needed for export and translation).
- **3′ poly(A) tail:** cleavage downstream of AAUAAA, then poly(A) polymerase adds ~200 A's.
- **Splicing:** the **spliceosome** (snRNPs U1, U2, U4, U5, U6) removes **introns** (GU at the 5′ end, AG at the 3′ end, with a branch-point A forming a **lariat**) and joins **exons**. **Alternative splicing** makes several proteins from one gene (human genes average several isoforms).

### Translation

![A ribosome translating mRNA](img:genes-translation)

- **Genetic code:** triplet codons, 64 codons for 20 amino acids (redundant, with wobble at the third position); **AUG** = start (Met); **UAA, UAG, UGA** = stop.
- **tRNA:** an anticodon pairs with the codon; aminoacyl-tRNA synthetases attach the correct amino acid (with proofreading).
- **Ribosome:** bacteria 70S (30S + 50S), eukaryotes 80S (40S + 60S). Sites: **A** (aminoacyl), **P** (peptidyl), **E** (exit). **Peptidyl transferase** activity is in the large subunit's **rRNA** (the ribosome is a ribozyme).
- **Initiation:** bacteria use the **Shine–Dalgarno** sequence pairing with 16S rRNA, and fMet-tRNA. Eukaryotes **scan** from the 5′ cap to the first AUG in a **Kozak** context, with eIFs.
- **Elongation:** EF-Tu (eEF1A) brings tRNAs; peptide bond forms; EF-G (eEF2) translocates. **Termination:** release factors recognize stop codons.
- **Regulation of translation:** microRNAs and siRNAs (RISC), phosphorylation of eIF2 (stress), iron response elements, upstream ORFs, mRNA stability (nonsense-mediated decay), riboswitches.

### Mobile genetic elements (State and National)

| | **DNA transposons** | **Retrotransposons** | **Retroviruses** |
|---|---|---|---|
| Mechanism | "Cut and paste" through DNA | "Copy and paste" through RNA | Like LTR retrotransposons, but can leave the cell |
| Key enzymes | **Transposase**; target site duplication at insertion | **Reverse transcriptase**, integrase (LTR type) or endonuclease (non-LTR: LINE-1 uses target-primed reverse transcription) | Reverse transcriptase, integrase, protease; envelope protein (env) |
| Structure | Inverted terminal repeats | LTR (Ty1 in yeast, endogenous retroviruses) or non-LTR (**LINEs** autonomous, **SINEs** like Alu borrow LINE machinery) | gag, pol, env genes flanked by LTRs |
| Examples | McClintock's Ac/Ds in maize, P elements in flies, Sleeping Beauty | ~17% of human DNA is LINE-1; ~10% Alu | HIV |

## Technology and techniques

### PCR

![The three steps of PCR](img:genes-pcr)

| Step | Temperature | What happens |
|---|---|---|
| **Denaturation** | ~94–98 °C | Strands separate |
| **Annealing** | ~50–65 °C (about 3–5 °C below the primers' melting temperature) | Primers bind their complementary sites |
| **Extension** | **72 °C** | **Taq polymerase** (heat-stable, from *Thermus aquaticus*) extends primers 5′→3′ |

- **Components:** template DNA, two primers (forward and reverse), **dNTPs**, a thermostable polymerase, buffer with **Mg²⁺** (polymerase cofactor).
- Each cycle doubles the target: 2ⁿ copies after n cycles (30 cycles ≈ 10⁹).
- **Applications:**
  - **Sanger sequencing:** chain-terminating **ddNTPs** (no 3′ OH) labeled with fluorescent dyes; fragments separated by capillary electrophoresis; reads ~700–1,000 bases.
  - **Error-prone PCR:** low-fidelity conditions (Mn²⁺, unequal dNTPs) to make random mutants for directed evolution.
  - **RT-qPCR:** reverse transcriptase makes cDNA from RNA, then quantitative PCR measures expression in real time (SYBR Green or TaqMan probes). **Ct** (cycle threshold) is lower for more starting template; ΔΔCt compares expression.
  - Also: genotyping, diagnostics (COVID tests), forensics (STRs), cloning, site-directed mutagenesis.

### Sequencing

| | **Illumina (next-gen)** | **Nanopore (third-gen)** |
|---|---|---|
| How | Fragment DNA, add adapters, cluster by **bridge amplification** on a flow cell; **sequencing by synthesis** with reversible-terminator fluorescent nucleotides, imaged each cycle | Single DNA or RNA molecule threaded through a protein **nanopore** by a motor protein; each base combination changes the **ionic current** |
| Reads | **Short** (~50–300 bases), paired-end | **Long** (thousands to over 1 million bases) |
| Accuracy | Very high per base (>99.9%) | Lower per read (improving, >99% with new chemistry) |
| Strengths | Cheap per base, huge throughput; good for counting (RNA-seq, ChIP-seq), variant calling | Structural variants, repeats, full transcripts, base modifications (methylation) read directly, portable (MinION), real-time |

### Molecular cloning

1. **Get the insert:** PCR the gene (adding restriction sites or overlaps to primers), or cut it out.
2. **Pick a vector:** a **plasmid** with an origin of replication, a **selectable marker** (antibiotic resistance), a multiple cloning site, and a promoter suited to the host (T7 for *E. coli* expression; CMV for mammalian cells).
3. **Join them:**
   - **Restriction enzymes and ligase:** cut both with the same enzymes (sticky ends, like EcoRI G^AATTC) and ligate.
   - **Gibson assembly:** fragments with ~20–40 bp **overlapping ends**; a 5′ exonuclease chews back to expose overlaps, polymerase fills gaps, ligase seals. Seamless, many fragments at once, no restriction sites needed.
   - **Golden Gate:** **type IIS** restriction enzymes (BsaI, BsmBI) cut **outside** their recognition site, making custom 4-base overhangs; cutting and ligation in one tube; the sites are removed from the final product, so it's efficient and directional for multiple parts.
4. **Transform** bacteria (heat shock or electroporation), select on antibiotic plates, screen colonies (blue–white screening with lacZα; colony PCR; sequencing).
5. **Express:** in bacteria, yeast or mammalian cells. **Transient transfection** (lipofection or electroporation of plasmid into mammalian cells): fast expression for days, not inherited. **Stable cell lines:** the gene integrates into the genome (lentivirus, selection with puromycin or G418), so expression lasts.

### Knockouts and knockdowns

- **Knockout:** the gene is permanently disrupted at the DNA level (no protein). **Knockdown:** expression is reduced, usually at the mRNA level (some protein remains, can be temporary).
- **Necessity:** if knocking out a gene removes a phenotype, the gene is **necessary**. **Sufficiency:** if expressing the gene (in a new context) produces the phenotype, it's **sufficient**. **Complementation (rescue):** adding back the gene restores the wild type, which proves the phenotype came from that gene (not off-target effects).
- **Why knock down instead of knocking out?** The gene is essential (a knockout would be lethal), you want partial or temporary reduction, it's quicker, or you want to study dosage.

**Methods (State and National):**

- **RNAi:** siRNA or shRNA loads into **RISC** (Argonaute) and cleaves matching mRNA. Knockdown, can have off-target effects.
- **Homologous recombination:** a targeting construct with homology arms replaces the gene (the classic mouse knockout in embryonic stem cells).
- **Cre-Lox:** **Cre recombinase** cuts between two **loxP** sites. Put loxP around a gene ("floxed") and express Cre only in one tissue (tissue-specific promoter) or at one time (tamoxifen-inducible CreER) for a **conditional knockout**.
- **CRISPR-Cas9:** a **guide RNA** (~20 nt) directs Cas9 to a target next to a **PAM** (NGG). Cas9 makes a double-strand break. **NHEJ** repair causes indels and knockouts; **HDR** with a donor template makes precise edits. Variants: CRISPRi (dead Cas9 + repressor) for knockdown, CRISPRa, base editors, prime editors.

### Genomics techniques (State and National)

| Technique | What it does | Steps | Limitations |
|---|---|---|---|
| **ChIP-seq** | Finds where a protein (transcription factor, modified histone) binds the genome | Crosslink protein to DNA (formaldehyde) → shear chromatin → **immunoprecipitate** with an antibody → reverse crosslinks → sequence → map peaks | Needs a good antibody; resolution ~hundreds of bases; millions of cells (unless low-input methods) |
| **Hi-C** | Maps 3D genome contacts (TADs, loops, compartments) | Crosslink → digest → fill ends with biotin and ligate nearby ends → pull down junctions → paired-end sequence → contact matrix | Population average; very deep sequencing; limited resolution |
| **RNA-seq** | Measures gene expression genome-wide | RNA → (poly-A selection or rRNA depletion) → cDNA → sequence → count reads per gene | |
| — **Bulk** | Average expression over many cells | | Hides cell-type differences |
| — **Single-cell** | Expression per cell (droplets with barcodes, e.g. 10x Genomics) | | Sparse data (dropouts), expensive; loses spatial location |

**Gel electrophoresis** comes up constantly: DNA is negative and runs toward the **positive** electrode (anode); small fragments run farthest; compare with a ladder.

## How to study

1. **Weeks 1–2:** Mendelian genetics and probability. Do 50+ problems: crosses, pedigrees, χ², epistasis.
2. **Week 3:** meiosis, nondisjunction, karyotypes, gene mapping.
3. **Week 4:** Hardy–Weinberg, drift, heritability, phylogenies.
4. **Weeks 5–6:** DNA structure, replication, repair, mutations.
5. **Week 7:** transcription, processing, translation, regulation, transposons.
6. **Week 8:** techniques. For each, know: purpose, steps, what the data look like, limitations, and what experiment it would answer.

**The notes sheet:** epistasis ratios, χ² critical values, three-point mapping steps, HW formulas, heritability equations, replication enzyme table (bacteria vs eukaryotes), repair pathway table, PCR temperatures, cloning methods, a technique comparison table.

## Common pitfalls

- Forgetting the 2/3 probability for an unaffected sibling being a carrier.
- Using the overall phenotype frequency instead of q² when finding q.
- Confusing broad and narrow heritability (selection depends on narrow).
- Mixing up orthologs and paralogs.
- Saying the template strand matches the mRNA (it's the coding strand).
- Thinking knockdowns are permanent (knockouts are).

## Test yourself

<details><summary>1. Two black Labradors (BbEe × BbEe) mate. What fraction of puppies are yellow?</summary>

ee = 1/4 of puppies are yellow (recessive epistasis, 9:3:4).

</details>

<details><summary>2. In a population, 16% of people show a recessive trait. What fraction are heterozygous?</summary>

q² = 0.16 → q = 0.4, p = 0.6. 2pq = 0.48.

</details>

<details><summary>3. Genes A and B have 8% recombination. How far apart are they?</summary>

8 cM (map units).

</details>

<details><summary>4. Why does a frameshift usually do more damage than a missense mutation?</summary>

It changes every codon after the mutation and usually creates a premature stop codon.

</details>

<details><summary>5. Which repair pathway fixes thymine dimers, and what disease results from its loss?</summary>

Nucleotide excision repair; xeroderma pigmentosum.

</details>

<details><summary>6. You want to find all genomic binding sites of transcription factor X. What technique?</summary>

ChIP-seq.

</details>

<details><summary>7. In a yeast two-hybrid screen, the reporter turns on. What does that mean?</summary>

The bait and prey proteins interact, bringing the DNA-binding and activation domains together.

</details>

## Resources

- [Official event page and rules (soinc.org)](https://www.soinc.org/designer-genes-c)
- [Scioly.org wiki: Designer Genes](https://scioly.org/wiki/index.php/Designer_Genes)
- [OpenStax *Biology 2e*](https://openstax.org/details/books/biology-2e) (free): ch. 11–17
- [NCBI Bookshelf: *Molecular Biology of the Cell* and *Introduction to Genetic Analysis*](https://www.ncbi.nlm.nih.gov/books/) (searchable)
- [Addgene educational resources](https://www.addgene.org/educational-resources/) for cloning and CRISPR
