export interface PatientInput {
  symptoms: string[];
  currentMedications?: string[];
  diseaseDomain?: string;
  conditionSubtype?: string;
  genomicMarkers: Record<string, string>;
  pharmacogenomicMarkers: Record<string, string>;
  biomarkers: Record<string, string>;
  labValues?: Record<string, { value: string; unit: string }>;
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
  biomarkerDisplay?: Record<string, { value: string; unit: string }>;
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

export interface InferredDisease {
  diseaseDomain: string;
  conditionSubtype?: string;
  confidence: "high" | "medium" | "low";
  confidenceFactors: string[];
}

export interface DiseaseAnalysis {
  diseaseDomain: string;
  diseaseLabel: string;
  diseaseIcon: string;
  conditionSubtype?: string;
  confidence: "high" | "medium" | "low";
  confidenceFactors: string[];
  recommendations: DrugRecommendation[];
}

export interface AnalysisResult {
  patientInput: PatientInput;
  patientLabel: string;
  inferredDiseases: DiseaseAnalysis[];
  timestamp: string;
  // Legacy fields for /demo page
  diseaseLabel?: string;
  recommendations?: DrugRecommendation[];
}
