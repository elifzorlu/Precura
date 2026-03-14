import { PatientInput } from "@/lib/types";

export interface InferredDisease {
  diseaseDomain: string;
  conditionSubtype?: string;
  confidence: "high" | "medium" | "low";
  confidenceFactors: string[];
}

function matchesAny(symptoms: string[], keywords: string[]): boolean {
  return symptoms.some((s) => keywords.some((kw) => s.toLowerCase().includes(kw)));
}

function matchCount(symptoms: string[], keywords: string[]): number {
  return symptoms.filter((s) => keywords.some((kw) => s.toLowerCase().includes(kw))).length;
}

function confidenceLevel(score: number): "high" | "medium" | "low" {
  if (score >= 3) return "high";
  if (score >= 2) return "medium";
  return "low";
}

function inferCardiovascularSubtype(symptoms: string[]): string {
  if (matchesAny(symptoms, ["palpitat", "irregular heartbeat", "irregular pulse"]))
    return "atrial_fibrillation";
  if (matchesAny(symptoms, ["chest pain", "chest tightness", "shortness of breath"]))
    return "cad";
  return "hypertension";
}

function inferStrokeSubtype(symptoms: string[]): string {
  if (matchesAny(symptoms, ["transient"]))
    return "tia";
  if (matchesAny(symptoms, ["sudden severe headache", "worst headache", "hemorrhag"]))
    return "hemorrhagic";
  return "ischemic";
}

export function inferDiseases(input: PatientInput): InferredDisease[] {
  const symptoms = input.symptoms.map((s) => s.toLowerCase());
  const bm = input.biomarkers;
  const gm = input.genomicMarkers;
  const results: InferredDisease[] = [];

  // ── Cardiovascular ────────────────────────────────────────────────────────
  const cardioKeywords = [
    "chest pain", "chest tightness", "shortness of breath", "elevated blood pressure",
    "hypertension", "palpitat", "irregular heartbeat", "fatigue", "headache",
  ];
  const cardioSymptomMatches = matchCount(symptoms, cardioKeywords);
  const hasHighLdl = bm.ldl === "high";
  const cardioScore = cardioSymptomMatches + (hasHighLdl ? 1 : 0);

  if (cardioScore >= 1) {
    const factors: string[] = [];
    if (cardioSymptomMatches > 0) factors.push(`${cardioSymptomMatches} cardiovascular symptom(s) present`);
    if (hasHighLdl) factors.push("Elevated LDL cholesterol");
    if (bm.crp === "high") factors.push("Elevated CRP (systemic inflammation)");

    results.push({
      diseaseDomain: "cardiovascular",
      conditionSubtype: inferCardiovascularSubtype(symptoms),
      confidence: confidenceLevel(cardioScore),
      confidenceFactors: factors,
    });
  }

  // ── Breast Cancer ─────────────────────────────────────────────────────────
  const breastKeywords = ["breast lump", "breast mass", "breast pain", "nipple discharge", "lymph node"];
  const breastSymptomMatches = matchCount(symptoms, breastKeywords);
  const hasHighCa153 = bm.ca153 === "high";
  const hasBreastMarkers = gm.her2 != null || gm.er != null;
  const breastScore = breastSymptomMatches + (hasHighCa153 ? 1 : 0) + (hasBreastMarkers ? 1 : 0);

  if (breastScore >= 1) {
    const factors: string[] = [];
    if (breastSymptomMatches > 0) factors.push(`${breastSymptomMatches} breast cancer symptom(s) present`);
    if (hasHighCa153) factors.push("Elevated CA 15-3 tumor marker");
    if (gm.her2) factors.push(`HER2 ${gm.her2} status confirmed`);
    if (gm.er) factors.push(`ER ${gm.er} status confirmed`);

    results.push({
      diseaseDomain: "breastCancer",
      confidence: confidenceLevel(breastScore),
      confidenceFactors: factors,
    });
  }

  // ── Stroke ────────────────────────────────────────────────────────────────
  const strokeKeywords = [
    "sudden weakness", "facial droop", "speech difficulty", "aphasia",
    "vision loss", "vision disturbance", "sudden headache", "numbness",
    "transient", "stroke", "slurred speech",
  ];
  const strokeSymptomMatches = matchCount(symptoms, strokeKeywords);
  const hasStrokeMarkers = bm.inflammatory != null && bm.recovery != null;
  const strokeScore = strokeSymptomMatches + (hasStrokeMarkers ? 1 : 0);

  if (strokeScore >= 1) {
    const factors: string[] = [];
    if (strokeSymptomMatches > 0) factors.push(`${strokeSymptomMatches} neurological symptom(s) present`);
    if (bm.inflammatory) factors.push(`Inflammatory biomarker: ${bm.inflammatory}`);
    if (bm.recovery) factors.push(`Recovery biomarker: ${bm.recovery}`);

    results.push({
      diseaseDomain: "stroke",
      conditionSubtype: inferStrokeSubtype(symptoms),
      confidence: confidenceLevel(strokeScore),
      confidenceFactors: factors,
    });
  }

  // ── Depression ────────────────────────────────────────────────────────────
  const depressionKeywords = [
    "persistent sadness", "depressed mood", "low mood", "loss of interest",
    "anhedonia", "sleep disturbance", "insomnia", "hypersomnia",
    "fatigue", "hopelessness", "anxiety", "poor concentration",
    "depression", "antidepressant",
  ];
  const depressionSymptomMatches = matchCount(symptoms, depressionKeywords);
  const hasDepressionPgx =
    input.pharmacogenomicMarkers["cyp2d6"] != null ||
    (input.pharmacogenomicMarkers["cyp2c19"] != null && !results.find((r) => r.diseaseDomain === "cardiovascular"));

  if (depressionSymptomMatches >= 2) {
    const factors: string[] = [];
    factors.push(`${depressionSymptomMatches} depression symptom(s) present`);
    if (input.pharmacogenomicMarkers["cyp2d6"]) factors.push(`CYP2D6 ${input.pharmacogenomicMarkers["cyp2d6"]} — affects SSRI/SNRI/TCA metabolism`);
    if (input.pharmacogenomicMarkers["cyp2c19"]) factors.push(`CYP2C19 ${input.pharmacogenomicMarkers["cyp2c19"]} — affects escitalopram/sertraline metabolism`);

    results.push({
      diseaseDomain: "depression",
      confidence: confidenceLevel(depressionSymptomMatches),
      confidenceFactors: factors,
    });
  }

  return results;
}
