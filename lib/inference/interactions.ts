export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "major" | "moderate" | "minor";
  mechanism: string;
  effect: string;
  recommendation: string;
}

const INTERACTION_TABLE: DrugInteraction[] = [
  {
    drug1: "Clopidogrel",
    drug2: "Apixaban",
    severity: "major",
    mechanism: "Antiplatelet + anticoagulant additive effect",
    effect: "Significantly increased bleeding risk",
    recommendation: "Avoid unless benefit clearly outweighs risk (e.g., post-ACS with AF); minimize duration",
  },
  {
    drug1: "Apixaban",
    drug2: "Aspirin Pathway",
    severity: "major",
    mechanism: "Anticoagulant + antiplatelet additive effect",
    effect: "Substantially increased bleeding risk; GI bleed risk elevated",
    recommendation: "Use combination only when clinically necessary; add PPI for GI protection",
  },
  {
    drug1: "Clopidogrel",
    drug2: "Aspirin Pathway",
    severity: "moderate",
    mechanism: "Dual antiplatelet therapy (DAPT)",
    effect: "Increased bleeding risk; intentional in post-stent or ACS settings",
    recommendation: "Standard DAPT regimen; reassess duration at 6–12 months",
  },
  {
    drug1: "Doxorubicin",
    drug2: "Trastuzumab",
    severity: "major",
    mechanism: "Both agents cause cardiomyopathy via different mechanisms",
    effect: "Substantially increased risk of cardiomyopathy and heart failure",
    recommendation: "Monitor LVEF every 3 months; consider sequential rather than concurrent administration",
  },
  {
    drug1: "Tamoxifen",
    drug2: "Fluoxetine",
    severity: "major",
    mechanism: "Fluoxetine is a potent CYP2D6 inhibitor — reduces tamoxifen→endoxifen conversion",
    effect: "Endoxifen levels reduced by ~65%; functionally mimics CYP2D6 poor metabolizer phenotype",
    recommendation: "Avoid combination; switch antidepressant to venlafaxine or mirtazapine (low CYP2D6 inhibition)",
  },
  {
    drug1: "Tamoxifen",
    drug2: "Venlafaxine",
    severity: "moderate",
    mechanism: "Venlafaxine partially inhibits CYP2D6, reducing tamoxifen activation",
    effect: "Endoxifen levels reduced ~30%; less impactful than fluoxetine/paroxetine",
    recommendation: "Acceptable if no alternative; use lowest effective venlafaxine dose",
  },
  {
    drug1: "Metoprolol",
    drug2: "Fluoxetine",
    severity: "moderate",
    mechanism: "Fluoxetine inhibits CYP2D6, reducing metoprolol clearance",
    effect: "Metoprolol plasma levels 2–4× elevated; risk of bradycardia and hypotension",
    recommendation: "Monitor heart rate and BP; reduce metoprolol dose if symptomatic bradycardia occurs",
  },
  {
    drug1: "Metoprolol",
    drug2: "Venlafaxine",
    severity: "moderate",
    mechanism: "Venlafaxine mildly inhibits CYP2D6, raising metoprolol levels",
    effect: "Modest metoprolol exposure increase; bradycardia possible",
    recommendation: "Monitor heart rate; dose adjustment usually not required but observe",
  },
  {
    drug1: "Paclitaxel",
    drug2: "Doxorubicin",
    severity: "moderate",
    mechanism: "Paclitaxel inhibits doxorubicin clearance via P-glycoprotein",
    effect: "Increased doxorubicin AUC and cardiotoxicity risk",
    recommendation: "Administer doxorubicin before paclitaxel when used in combination regimens",
  },
  {
    drug1: "Statin Intensification",
    drug2: "Doxorubicin",
    severity: "minor",
    mechanism: "Additive myopathy risk from two agents affecting muscle",
    effect: "Mildly increased myopathy risk; usually manageable",
    recommendation: "Monitor CK levels; hold statin if myopathy symptoms develop",
  },
  {
    drug1: "Amitriptyline",
    drug2: "Metoprolol",
    severity: "moderate",
    mechanism: "Additive cardiac conduction effects; both affect QT interval",
    effect: "Risk of QT prolongation and arrhythmia",
    recommendation: "Obtain baseline ECG; avoid in patients with prolonged QTc or structural heart disease",
  },
  {
    drug1: "Escitalopram",
    drug2: "Metoprolol",
    severity: "moderate",
    mechanism: "Escitalopram inhibits CYP2D6 (weak), raising metoprolol levels",
    effect: "Modest metoprolol exposure increase; may contribute to bradycardia",
    recommendation: "Monitor heart rate; clinically significant primarily in CYP2D6 poor metabolizers",
  },
];

function normalize(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

export function findInteractions(recommendedDrugs: string[]): DrugInteraction[] {
  const found: DrugInteraction[] = [];
  const normalized = recommendedDrugs.map(normalize);

  for (const interaction of INTERACTION_TABLE) {
    const n1 = normalize(interaction.drug1);
    const n2 = normalize(interaction.drug2);
    const has1 = normalized.some((d) => d.includes(n1) || n1.includes(d));
    const has2 = normalized.some((d) => d.includes(n2) || n2.includes(d));
    if (has1 && has2) found.push(interaction);
  }

  // Sort: major first
  return found.sort((a, b) => {
    const order = { major: 0, moderate: 1, minor: 2 };
    return order[a.severity] - order[b.severity];
  });
}

export function getRecommendedDrugNames(
  inferredDiseases: { recommendations: { drugName: string; category: string }[] }[]
): string[] {
  return inferredDiseases.flatMap((d) =>
    d.recommendations
      .filter((r) => r.category !== "Avoid")
      .map((r) => r.drugName)
  );
}
