export interface PatientInput {
  diseaseDomain: string;
  conditionSubtype?: string;
  genomicMarkers: Record<string, string>;
  pharmacogenomicMarkers: Record<string, string>;
  biomarkers: Record<string, string>;
  priorTreatmentFailure: boolean;
}

export interface DrugRecommendation {
  drugName: string;
  suitabilityScore: number;
  category: "Preferred" | "Caution" | "Avoid";
  reasons: string[];
  genomicFlags: string[];
  biomarkerFlags: string[];
  pharmacogenomicFlags: string[];
  evidenceTags: string[];
}

export type InputFieldType = "select" | "radio" | "toggle";

export interface InputFieldOption {
  value: string;
  label: string;
}

export interface InputFieldConfig {
  key: string;
  label: string;
  type: InputFieldType;
  group: "genomic" | "pharmacogenomic" | "biomarker" | "clinical";
  options: InputFieldOption[];
  description?: string;
}

export interface SamplePatient {
  id: string;
  label: string;
  description: string;
  input: PatientInput;
}

export interface DiseaseConfig {
  id: string;
  label: string;
  description: string;
  icon: string;
  isStub: boolean;
  requiredInputs: InputFieldConfig[];
  samplePatients: SamplePatient[];
}

export interface AnalysisResult {
  patientInput: PatientInput;
  recommendations: DrugRecommendation[];
  diseaseLabel: string;
  timestamp: string;
}
