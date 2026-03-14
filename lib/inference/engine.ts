import { PatientInput, DrugRecommendation, AnalysisResult } from "@/lib/types";
import { evaluateCardiovascular } from "@/lib/rules/cardiovascular";
import { evaluateBreastCancer } from "@/lib/rules/breastCancer";
import { evaluateStroke } from "@/lib/rules/stroke";
import { DISEASE_CONFIGS } from "@/lib/config/diseases";

export function runInference(input: PatientInput): DrugRecommendation[] {
  switch (input.diseaseDomain) {
    case "cardiovascular":
      return evaluateCardiovascular(input);
    case "breastCancer":
      return evaluateBreastCancer(input);
    case "stroke":
      return evaluateStroke(input);
    default:
      return [];
  }
}

export function sortRecommendations(recommendations: DrugRecommendation[]): DrugRecommendation[] {
  const order: Record<string, number> = { Preferred: 0, Caution: 1, Avoid: 2 };
  return [...recommendations].sort((a, b) => {
    const catDiff = order[a.category] - order[b.category];
    if (catDiff !== 0) return catDiff;
    return b.suitabilityScore - a.suitabilityScore;
  });
}

export function buildAnalysisResult(input: PatientInput): AnalysisResult {
  const raw = runInference(input);
  const sorted = sortRecommendations(raw);
  const disease = DISEASE_CONFIGS.find((d) => d.id === input.diseaseDomain);

  return {
    patientInput: input,
    recommendations: sorted,
    diseaseLabel: disease?.label ?? input.diseaseDomain,
    timestamp: new Date().toISOString(),
  };
}
