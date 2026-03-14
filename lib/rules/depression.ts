import { PatientInput, DrugRecommendation } from "@/lib/types";

type ScoredDrug = {
  drugName: string;
  score: number;
  reasons: string[];
  genomicFlags: string[];
  biomarkerFlags: string[];
  pgxFlags: string[];
  evidenceTags: string[];
};

function scored(name: string, input: PatientInput): ScoredDrug {
  return {
    drugName: name,
    score: 50,
    reasons: [],
    genomicFlags: [],
    biomarkerFlags: [],
    pgxFlags: [],
    evidenceTags: [],
  };
}

function toRecommendation(d: ScoredDrug): DrugRecommendation {
  const score = Math.max(0, Math.min(100, d.score));
  return {
    drugName: d.drugName,
    suitabilityScore: score,
    category: score >= 65 ? "Preferred" : score >= 40 ? "Caution" : "Avoid",
    reasons: d.reasons,
    genomicFlags: d.genomicFlags,
    biomarkerFlags: d.biomarkerFlags,
    pharmacogenomicFlags: d.pgxFlags,
    evidenceTags: d.evidenceTags,
  };
}

function scoreEscitalopram(input: PatientInput): ScoredDrug {
  const d = scored("Escitalopram", input);
  d.score = 60;
  const cyp2c19 = input.pharmacogenomicMarkers["cyp2c19"] ?? "normal";
  d.reasons.push("First-line SSRI; well-tolerated with minimal drug interactions (CPIC Level A)");
  d.evidenceTags.push("CPIC Level A", "FDA Approved", "First-line SSRI");

  if (cyp2c19 === "poor") {
    d.score -= 35;
    d.pgxFlags.push("⚠️ FDA WARNING: CYP2C19 poor metabolizer — escitalopram exposure ~2× elevated; QT prolongation risk");
    d.reasons.push("CYP2C19 poor metabolizer: FDA recommends max 10 mg/day; obtain baseline ECG");
  } else if (cyp2c19 === "intermediate") {
    d.score -= 12;
    d.pgxFlags.push("CYP2C19 intermediate: moderately elevated exposure; monitor for dose-related side effects");
    d.reasons.push("Consider dose reduction to 10 mg/day for CYP2C19 intermediate metabolizers");
  } else if (cyp2c19 === "ultrarapid") {
    d.score -= 15;
    d.pgxFlags.push("CYP2C19 ultrarapid: reduced plasma levels; may be subtherapeutic at standard dose");
    d.reasons.push("Ultrarapid CYP2C19: faster clearance may require higher dose or alternative agent");
  } else {
    d.reasons.push("Normal CYP2C19: standard 10–20 mg dosing achieves therapeutic levels");
  }

  if (input.priorTreatmentFailure) {
    d.score -= 10;
    d.reasons.push("Prior antidepressant failure: consider augmentation or switch to different mechanism");
  }
  return d;
}

function scoreSertraline(input: PatientInput): ScoredDrug {
  const d = scored("Sertraline", input);
  d.score = 62;
  const cyp2c19 = input.pharmacogenomicMarkers["cyp2c19"] ?? "normal";
  const cyp2d6 = input.pharmacogenomicMarkers["cyp2d6"] ?? "normal";
  d.reasons.push("Broad-spectrum SSRI; preferred when CYP2C19 variants limit escitalopram (CPIC Level B)");
  d.evidenceTags.push("CPIC Level B", "FDA Approved", "First-line SSRI");

  if (cyp2c19 === "poor") {
    d.score += 10;
    d.reasons.push("CYP2C19 poor metabolizer: sertraline is less CYP2C19-dependent than escitalopram — preferred alternative");
  } else if (cyp2d6 === "poor") {
    d.score -= 8;
    d.pgxFlags.push("CYP2D6 poor: minor CYP2D6 substrate; mild exposure increase expected");
    d.reasons.push("CYP2D6 poor metabolizer: modest increase in sertraline exposure; generally well-tolerated");
  } else {
    d.reasons.push("Normal CYP2C19/CYP2D6: standard 50–200 mg dosing is appropriate");
  }

  if (input.priorTreatmentFailure) {
    d.score -= 5;
    d.reasons.push("Prior treatment failure: consider higher dose or augmentation before switching");
  }
  return d;
}

function scoreVenlafaxine(input: PatientInput): ScoredDrug {
  const d = scored("Venlafaxine", input);
  d.score = 55;
  const cyp2d6 = input.pharmacogenomicMarkers["cyp2d6"] ?? "normal";
  d.reasons.push("SNRI — preferred for depression with concurrent anxiety or chronic pain");
  d.evidenceTags.push("CPIC Level A", "FDA Approved", "SNRI");

  if (cyp2d6 === "poor") {
    d.score -= 20;
    d.pgxFlags.push("CYP2D6 poor metabolizer: venlafaxine→O-desmethylvenlafaxine ratio shifted; elevated venlafaxine levels");
    d.reasons.push("CYP2D6 poor: higher venlafaxine exposure; consider starting at lower dose (37.5 mg) and monitor BP/HR");
  } else if (cyp2d6 === "intermediate") {
    d.score -= 8;
    d.pgxFlags.push("CYP2D6 intermediate: mildly increased venlafaxine exposure");
  } else if (cyp2d6 === "ultrarapid") {
    d.score -= 10;
    d.pgxFlags.push("CYP2D6 ultrarapid: faster venlafaxine metabolism; O-desmethylvenlafaxine predominates");
    d.reasons.push("CYP2D6 ultrarapid: consider desvenlafaxine as a direct alternative (not CYP2D6 dependent)");
  } else {
    d.reasons.push("Normal CYP2D6: standard 75–225 mg dosing achieves therapeutic venlafaxine and active metabolite levels");
  }
  return d;
}

function scoreFluoxetine(input: PatientInput): ScoredDrug {
  const d = scored("Fluoxetine", input);
  d.score = 55;
  const cyp2d6 = input.pharmacogenomicMarkers["cyp2d6"] ?? "normal";
  d.reasons.push("Long-acting SSRI; potent CYP2D6 inhibitor — interaction risk with co-medications metabolized by CYP2D6");
  d.evidenceTags.push("CPIC Level A", "FDA Approved", "CYP2D6 Inhibitor");

  if (cyp2d6 === "poor") {
    d.score -= 30;
    d.pgxFlags.push("⚠️ CYP2D6 poor metabolizer: fluoxetine exposure substantially elevated; high risk of dose-dependent adverse effects");
    d.reasons.push("CYP2D6 poor: avoid or use lowest dose with monitoring; norfluoxetine accumulation amplifies inhibition of other CYP2D6 substrates");
    d.evidenceTags.push("CPIC Level A — Avoid in PM");
  } else if (cyp2d6 === "intermediate") {
    d.score -= 12;
    d.pgxFlags.push("CYP2D6 intermediate: increased fluoxetine exposure; enhanced CYP2D6 inhibition of co-medications");
    d.reasons.push("Caution with concurrent CYP2D6 substrates (e.g., tamoxifen, codeine, metoprolol)");
  } else {
    d.reasons.push("Normal CYP2D6: standard 20 mg/day dosing; note potent CYP2D6 inhibition affects co-medications");
  }
  return d;
}

function scoreAmitriptyline(input: PatientInput): ScoredDrug {
  const d = scored("Amitriptyline", input);
  d.score = 38;
  const cyp2d6 = input.pharmacogenomicMarkers["cyp2d6"] ?? "normal";
  const cyp2c19 = input.pharmacogenomicMarkers["cyp2c19"] ?? "normal";
  d.reasons.push("Tricyclic antidepressant (TCA); effective for treatment-resistant depression and neuropathic pain but narrow therapeutic index");
  d.evidenceTags.push("CPIC Level A", "TCA", "Narrow Therapeutic Index");

  let pgxPenalty = 0;
  if (cyp2d6 === "poor") {
    pgxPenalty += 25;
    d.pgxFlags.push("⚠️ CYP2D6 poor metabolizer: amitriptyline exposure markedly elevated; cardiotoxicity and anticholinergic toxicity risk");
    d.reasons.push("CYP2D6 poor: CPIC recommends avoiding amitriptyline or starting at 50% dose with therapeutic drug monitoring (TDM)");
    d.evidenceTags.push("CPIC Level A — Reduce dose or avoid");
  } else if (cyp2d6 === "ultrarapid") {
    pgxPenalty += 15;
    d.pgxFlags.push("CYP2D6 ultrarapid: amitriptyline rapidly converted to nortriptyline; altered parent/metabolite ratio");
    d.reasons.push("CYP2D6 ultrarapid: consider TDM and alternative agent");
  }

  if (cyp2c19 === "poor") {
    pgxPenalty += 15;
    d.pgxFlags.push("CYP2C19 poor metabolizer: amitriptyline hydroxylation impaired; additive exposure increase on top of CYP2D6 effects");
    d.reasons.push("CYP2C19 poor: dual PGx liability increases toxicity risk significantly");
  }

  d.score -= pgxPenalty;

  if (input.priorTreatmentFailure) {
    d.score += 15;
    d.reasons.push("Prior SSRI/SNRI failure: TCAs are recommended as second-line; amitriptyline has strong efficacy evidence");
  } else {
    d.reasons.push("Not recommended as first-line due to anticholinergic side effects and cardiotoxicity risk");
  }
  return d;
}

export function evaluateDepression(input: PatientInput): DrugRecommendation[] {
  return [
    scoreEscitalopram(input),
    scoreSertraline(input),
    scoreVenlafaxine(input),
    scoreFluoxetine(input),
    scoreAmitriptyline(input),
  ].map(toRecommendation);
}
