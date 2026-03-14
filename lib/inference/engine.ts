import { PatientInput, DrugRecommendation, AnalysisResult, DiseaseAnalysis } from "@/lib/types";
import { evaluateCardiovascular } from "@/lib/rules/cardiovascular";
import { evaluateBreastCancer } from "@/lib/rules/breastCancer";
import { evaluateStroke } from "@/lib/rules/stroke";
import { evaluateDepression } from "@/lib/rules/depression";
import { DISEASE_CONFIGS } from "@/lib/config/diseases";
import { inferDiseases } from "@/lib/inference/diagnose";

export function runInference(input: PatientInput): DrugRecommendation[] {
  switch (input.diseaseDomain) {
    case "cardiovascular":
      return evaluateCardiovascular(input);
    case "breastCancer":
      return evaluateBreastCancer(input);
    case "stroke":
      return evaluateStroke(input);
    case "depression":
      return evaluateDepression(input);
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

/** Legacy single-disease build — used by /demo page */
export function buildAnalysisResult(input: PatientInput): AnalysisResult {
  const raw = runInference(input);
  const sorted = sortRecommendations(raw);
  const disease = DISEASE_CONFIGS.find((d) => d.id === input.diseaseDomain);

  return {
    patientInput: input,
    patientLabel: "Manual Entry",
    inferredDiseases: [],
    diseaseLabel: disease?.label ?? input.diseaseDomain,
    recommendations: sorted,
    timestamp: new Date().toISOString(),
  };
}

/** Multi-disease build — used by patient-first flow */
export function buildMultiDiseaseResult(
  input: PatientInput,
  patientLabel: string
): AnalysisResult {
  const inferred = inferDiseases(input);

  const inferredDiseases: DiseaseAnalysis[] = inferred.map(
    ({ diseaseDomain, conditionSubtype, confidence, confidenceFactors }) => {
      const diseaseInput: PatientInput = {
        ...input,
        diseaseDomain,
        conditionSubtype,
      };
      const raw = runInference(diseaseInput);
      const sorted = sortRecommendations(raw);
      const config = DISEASE_CONFIGS.find((d) => d.id === diseaseDomain);

      return {
        diseaseDomain,
        diseaseLabel: config?.label ?? diseaseDomain,
        diseaseIcon: config?.icon ?? "💊",
        conditionSubtype,
        confidence,
        confidenceFactors,
        recommendations: sorted,
      };
    }
  );

  return {
    patientInput: input,
    patientLabel,
    inferredDiseases,
    timestamp: new Date().toISOString(),
  };
}
