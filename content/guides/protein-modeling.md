---
title: Protein Modeling
type: Build + test
summary: Build a physical model of part of the 2009 H1N1 hemagglutinin (PDB 3UBE, residues 153–252) and take a test on protein structure and JUDE visualization.
---

## At a glance

| | |
|---|---|
| **Team** | Up to 2 |
| **Time** | About 50 minutes |
| **Type** | Pre-built model (**impounded**) + written exam |
| **Pre-build** | **Residues 153–252 of chain A from PDB 3UBE**, the 2009 pandemic H1N1 influenza **hemagglutinin** (HA) |
| **You may bring** | Writing utensils; each person **one 8.5″ × 11″ sheet** (both sides, any source; may be laminated or in a taped sheet protector); **one Wi-Fi device** with a browser that runs **JUDE**, and a mouse |
| **Scoring** | **Model ~40%**, **exam ~60%**. Tiebreakers from the exam. |
| **Sponsor** | 3D Molecular Designs (with NIH/NIGMS support) |

> [!NOTE]
> This guide summarizes the 2026–27 rules. Read the official manual and use the event's resources on the 3D Molecular Designs Protein Modeling Event website, including the modified 3UBE file prepared for modeling.

## The reference paper

The pre-build comes from **Xu et al., "Structural Characterization of the Hemagglutinin Receptor Specificity from the 2009 H1N1 Influenza Pandemic," *Journal of Virology* (2012), DOI 10.1128/JVI.06322-11**, which is free online. Read it: it explains how this HA recognizes human-type receptors, and the exam may draw on it.

## Part I: The pre-built model (~40%)

### Requirements

| Requirement | Detail |
|---|---|
| **Backbone** | Alpha-carbon backbone of residues 153–252, chain A, 3UBE |
| **Scale** | **2 cm per amino acid** (100 residues → about 200 cm of backbone) |
| **Material** | Hand-folded bendable material: Modeling Ties, Mini-Toobers, Kwik Twists, 12-gauge house wire. **No 3D-printed backbone** (3D-printed features are OK). |
| **Color and size** | Backbone **mostly gray**, **0.75–1.25 cm** diameter |
| **Side chains** | When shown, mark the chemical property on the **alpha carbon**: **hydrophobic yellow, hydrophilic white, acidic red, basic blue, cysteine green** |
| **Features** | Add **functionally relevant features** (key side chains, the sialic acid receptor, glycans) that explain structure–function |
| **Legend** | A **Model Description Legend** on printed **8.5″ × 5.5″** paper: a three-column table, **What is displayed? / How is it displayed? / Why is it displayed?** |
| **Size** | Everything fits in **50 × 50 × 50 cm** |
| **Sturdiness** | Judges must be able to remove it from any support, pick it up and rotate it |
| **Impound** | Model and legend |

**Rubric by level:**

- **Regional:** mostly the accuracy of the folded backbone (secondary and tertiary structure).
- **State:** ~20% of the model score for functionally relevant features (key side chains explaining structure).
- **National:** ~30% for side chains explaining **interactions between amino acids that stabilize** the structure.

### Building the model step by step

1. **Open 3UBE in JUDE** (or the modified file from 3D Molecular Designs). Show only chain A, residues 153–252, as an alpha-carbon backbone. Color by secondary structure.
2. **Measure and mark** the backbone material every 2 cm (one mark per residue). Label residue numbers every 10.
3. **Mark secondary structures** at their residue ranges (read the PDB file's HELIX and SHEET records, or use JUDE's display): helices, β-strands, loops.
4. **Fold the secondary structures first:**
   - **α-helix:** 3.6 residues per turn, ~0.54 nm rise per turn, right-handed. Wrap the marked segment around a cylinder (a marker or dowel) so it coils the right way.
   - **β-strands:** extended zig-zag; adjacent strands in a sheet run parallel or antiparallel.
5. **Then the tertiary fold:** rotate the JUDE view to standard orientations and copy the 3D arrangement of the helices and strands. Use a stand while folding.
6. **Add features:** the sialic acid receptor in the binding pocket, key binding-site side chains, any disulfide bonds (green cysteines), and glycosylation sites if relevant.
7. **Check** against JUDE from at least three angles, and have your partner check independently.
8. **Write the legend.**

### The receptor-binding site

![Hemagglutinin trimer with the receptor-binding head highlighted](img:pm-hemagglutinin)

Residues 153–252 lie in **HA1**, the **globular head**, and include the **receptor-binding site (RBS)**: a shallow pocket that grips **sialic acid** at the tip of host-cell glycans. The RBS is framed by secondary-structure elements often called the **130-loop, 150-loop, 190-helix** and **220-loop**; your fragment includes much of the 190-helix and 220-loop.

**Receptor specificity** (why this protein is interesting):

- **Human-adapted** HA prefers **α2,6-linked** sialic acid, common in the human upper airway.
- **Avian** HA prefers **α2,3-linked** sialic acid.
- In H1 HA, the residues at positions **190 and 225** (H3 numbering) help set this preference. The 2009 pandemic HA has features that favor **α2,6 (human-type)** binding, which the paper analyzes.

> [!TIP]
> Numbering trap: papers often use **H3 numbering** so subtypes line up, but the 3UBE file uses its own sequential numbering. Always confirm residue identities in JUDE before labeling, and note the scheme on your legend.

### Sample legend rows

| What is displayed? | How is it displayed? | Why is it displayed? |
|---|---|---|
| Sialic acid receptor | Purple 3D-printed molecule in the pocket | Marks where HA grips the host receptor at the start of infection |
| A conserved aromatic side chain in the 150-loop | Yellow side chain (hydrophobic) on its alpha carbon | Its ring packs against the receptor and helps hold it in place |
| An acidic side chain near position 190 | Red side chain (acidic) | Hydrogen bonds that contribute to human-type (α2,6) receptor preference |
| Disulfide bond | Two green cysteines linked | A covalent cross-link that stabilizes the HA1 head |

## Part II: The written exam (~60%)

The exam is multiple-choice and short-answer, split between **protein structure/function** and **molecular visualization in JUDE**.

### Levels of protein structure

![The four levels of protein structure](img:pm-levels)

| Level | What it is | Held together by |
|---|---|---|
| **Primary** | The sequence of amino acids, N-terminus to C-terminus | **Peptide bonds** (covalent amide bonds) |
| **Secondary** | Local folds: **α-helices** and **β-sheets** (plus turns and loops) | **Hydrogen bonds** between backbone C=O and N–H groups |
| **Tertiary** | The overall 3D shape of one chain | Side-chain interactions: hydrophobic packing, hydrogen bonds, ionic (salt) bridges, **disulfide bonds**, van der Waals |
| **Quaternary** | How multiple chains assemble (HA is a **trimer** of three HA1–HA2 pairs) | The same side-chain interactions between subunits |

- **Peptide bond:** planar and partial-double-bond in character, so it doesn't rotate; the chain flexes at the **φ (phi)** and **ψ (psi)** backbone angles. A **Ramachandran plot** shows which φ/ψ combinations are allowed (helix and sheet regions).
- **α-helix:** 3.6 residues/turn; H-bonds between residue *i* and *i*+4; side chains point outward. **β-sheet:** extended strands H-bonded side by side; **antiparallel** (strands run opposite) vs **parallel**.

### Amino acids

![The 20 amino acids by property](img:pm-amino-acids)

Each amino acid has an **amino group, a carboxyl group, an H, and a side chain (R)** on the central **alpha carbon**. The R group sets the chemistry.

| Property (model color) | Amino acids | Where they tend to sit |
|---|---|---|
| **Nonpolar / hydrophobic (yellow)** | Gly, Ala, Val, Leu, Ile, Pro, Phe, Met, Trp | **Buried** in the core (away from water) |
| **Polar / hydrophilic (white)** | Ser, Thr, Cys, Tyr, Asn, Gln | On the surface; form hydrogen bonds |
| **Acidic, negative (red)** | **Asp (D), Glu (E)** | Surface; salt bridges |
| **Basic, positive (blue)** | **Lys (K), Arg (R), His (H)** | Surface; salt bridges |
| **Cysteine (green)** | Cys | Forms **disulfide bonds** (S–S) |

Memorize the **one-letter and three-letter codes** and which group each falls in: the model colors and the exam both depend on it.

### Forces that drive folding

- **The hydrophobic effect** is the main driver: nonpolar side chains cluster in the core to avoid water, which increases the entropy of the surrounding water.
- **Hydrogen bonds** form the backbone's secondary structure and many side-chain contacts.
- **Ionic bonds (salt bridges)** between acidic and basic side chains.
- **Disulfide bonds** covalently cross-link cysteines (common in secreted and surface proteins like HA).
- **Van der Waals** forces from tight packing.
- **Chaperones** help folding in the cell; **denaturation** (heat, pH, detergents) unfolds proteins; misfolding underlies diseases.

### Influenza and hemagglutinin

![Influenza virus surface proteins](img:pm-influenza)

- The influenza virus surface carries **hemagglutinin (HA)** and **neuraminidase (NA)** (the "H" and "N" in H1N1). HA attaches the virus to host cells; NA helps release new virus.
- **HA structure:** a trimer. Each monomer has **HA1** (the receptor-binding head) and **HA2** (the stalk, which drives membrane fusion). It's made as **HA0** and cleaved into HA1 + HA2 to become active.
- **Infection steps:** (1) HA binds **sialic acid** receptors; (2) the virus enters by endocytosis; (3) the low pH of the endosome triggers an HA conformational change that **fuses** the viral and endosomal membranes (HA2); (4) the genome is released and replicated; (5) new virus buds off, and **NA** cleaves sialic acid so it can spread.
- **Antigenic drift** (small mutations) and **antigenic shift** (reassortment of segments, as in the 2009 pandemic) change HA and NA, which is why vaccines are updated. **State/National** exams ask specifically about HA binding sialic acid in the infection mechanism.

### Molecular visualization in JUDE

JUDE (Jmol User Design Environment) is a free browser tool. **You may only use JUDE during the event**, no other sites. Be fluent at:

- **Loading** a PDB file and selecting chains and residue ranges.
- **Display styles:** cartoon/ribbon (secondary structure), backbone, alpha-carbon trace, sticks, spacefill, ligands.
- **Coloring:** by structure, by residue, by property, by chain.
- **Identifying** α-helices, β-strands and loops, and **specific residues** in them.
- **Measuring** distances and finding the **chemical environment** around a side chain (what's nearby, H-bond partners).
- **Finding ligand interactions** (which residues contact the sialic acid or other molecules).

Practice loading **3UBE** and navigating to the binding site. Know the common Jmol selection commands if the exam asks (e.g., selecting by residue number).

## How to study

1. **Learn the 20 amino acids** cold: codes, properties, structures. Make flashcards.
2. **Master secondary structure** and the forces of folding.
3. **Read the Xu et al. paper** and the event website materials.
4. **Build the model early** and refine it; practice the legend.
5. **Practice JUDE** weekly with 3UBE and other PDB files (identify structures, residues, interactions).
6. Take practice written tests on protein structure.

**Notes sheet:** amino acid table (code, property, color), secondary structure facts, folding forces, HA domains and infection steps, the receptor specificity points, and a JUDE command cheat sheet.

## Common pitfalls

- Wrong scale (it's 2 cm per residue) or a backbone of the wrong color/diameter.
- Confusing H3 numbering with the file's numbering.
- Side chains without the property color on the alpha carbon.
- A legend that says *what* but not *why* (the "why" column earns the points).
- Only practicing the model and neglecting the exam (it's 60%).
- Visiting non-JUDE sites during the event.

## Test yourself

<details><summary>1. What type of bond holds an α-helix together?</summary>

Hydrogen bonds between backbone C=O and N–H groups (residue i to i+4).

</details>

<details><summary>2. On the model, what color is an aspartate (Asp/D) side chain, and why?</summary>

Red, because it is acidic (negatively charged).

</details>

<details><summary>3. What molecule does hemagglutinin bind to attach to a host cell?</summary>

Sialic acid on host-cell glycans.

</details>

<details><summary>4. What is the main thermodynamic driver of protein folding?</summary>

The hydrophobic effect: nonpolar side chains cluster in the core, away from water.

</details>

<details><summary>5. What is the difference between antigenic drift and antigenic shift?</summary>

Drift is gradual mutation of HA/NA; shift is a sudden reassortment of gene segments producing a new subtype (as in a pandemic).

</details>

## Resources

- [Official event page and rules (soinc.org)](https://www.soinc.org/protein-modeling-c)
- [3D Molecular Designs Protein Modeling Event site](https://learn.3dmoleculardesigns.com/science-olympiad-protein-modeling-event) and [JUDE](https://learn.3dmoleculardesigns.com/digital-modeling-hub/jude_online_jmol)
- [RCSB Protein Data Bank: 3UBE](https://www.rcsb.org/structure/3UBE)
- [Xu et al. 2012, *J. Virol.* (free)](https://journals.asm.org/doi/10.1128/JVI.06322-11)
- [Scioly.org wiki: Protein Modeling](https://scioly.org/wiki/index.php/Protein_Modeling)
