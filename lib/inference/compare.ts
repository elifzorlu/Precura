import { PatientInput, DrugRecommendation } from "@/lib/types";
import { runInference, sortRecommendations } from "./engine";

export interface DrugCategoryChange {
  drugName: string;
  standardCategory: "Preferred" | "Caution" | "Avoid";
  pgxCategory: "Preferred" | "Caution" | "Avoid";
  type: "harm-prevented" | "better-option" | "downgraded";
  pgxReason: string;
}

export interface DiseaseComparison {
  diseaseDomain: string;
  diseaseLabel: string;
  diseaseIcon: string;
  changes: DrugCategoryChange[];
}

/** Run the scoring engine with all PGx markers set to "normal" */
export function buildStandardOfCare(input: PatientInput): DrugRecommendation[] {
  const normalizedPgx: Record<string, string> = {};
  for (const key of Object.keys(input.pharmacogenomicMarkers)) {
    normalizedPgx[key] = "normal";
  }
  const standardInput: PatientInput = { ...input, pharmacogenomicMarkers: normalizedPgx };
  return sortRecommendations(runInference(standardInput));
}

export function computeChanges(
  standard: DrugRecommendation[],
  pgxAware: DrugRecommendation[]
): DrugCategoryChange[] {
  const changes: DrugCategoryChange[] = [];

  for (const pgxRec of pgxAware) {
    const stdRec = standard.find((r) => r.drugName === pgxRec.drugName);
    if (!stdRec || stdRec.category === pgxRec.category) continue;

    let type: DrugCategoryChange["type"];
    if (pgxRec.category === "Avoid" && stdRec.category !== "Avoid") {
      type = "harm-prevented";
    } else if (pgxRec.category === "Preferred" && stdRec.category !== "Preferred") {
      type = "better-option";
    } else {
      type = "downgraded";
    }

    const pgxFlag =
      pgxRec.pharmacogenomicFlags[0] ?? pgxRec.reasons.find((r) => r.length > 0) ?? "";

    changes.push({
      drugName: pgxRec.drugName,
      standardCategory: stdRec.category,
      pgxCategory: pgxRec.category,
      type,
      pgxReason: pgxFlag,
    });
  }

  return changes;
}
