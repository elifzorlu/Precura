import { DiseaseConfig } from "@/lib/types";

export const DISEASE_CONFIGS: DiseaseConfig[] = [
  {
    id: "cardiovascular",
    label: "Cardiovascular Disease",
    description: "CAD, hypertension, and atrial fibrillation — informed by CYP2C19, SLCO1B1, and inflammatory biomarkers.",
    icon: "❤️",
    isStub: false,
    requiredInputs: [
      {
        key: "conditionSubtype",
        label: "Condition Subtype",
        type: "select",
        group: "clinical",
        options: [
          { value: "hypertension", label: "Hypertension" },
          { value: "cad", label: "Coronary Artery Disease (CAD)" },
          { value: "atrial_fibrillation", label: "Atrial Fibrillation" },
        ],
      },
      {
        key: "cyp2c19",
        label: "CYP2C19 Status",
        type: "select",
        group: "pharmacogenomic",
        description: "Affects clopidogrel and other antiplatelet/anticoagulant metabolism.",
        options: [
          { value: "poor", label: "Poor Metabolizer" },
          { value: "intermediate", label: "Intermediate Metabolizer" },
          { value: "normal", label: "Normal Metabolizer" },
          { value: "ultrarapid", label: "Ultrarapid Metabolizer" },
        ],
      },
      {
        key: "slco1b1",
        label: "SLCO1B1 Risk",
        type: "select",
        group: "pharmacogenomic",
        description: "Hepatic statin transporter — affects statin myopathy risk.",
        options: [
          { value: "low", label: "Low Risk (*1/*1)" },
          { value: "high", label: "High Risk (*5 carrier)" },
        ],
      },
      {
        key: "crp",
        label: "CRP Level",
        type: "select",
        group: "biomarker",
        description: "C-Reactive Protein — systemic inflammation marker.",
        options: [
          { value: "low", label: "Low (<1 mg/L)" },
          { value: "medium", label: "Medium (1–3 mg/L)" },
          { value: "high", label: "High (>3 mg/L)" },
        ],
      },
      {
        key: "ldl",
        label: "LDL Cholesterol",
        type: "select",
        group: "biomarker",
        description: "Low-density lipoprotein level.",
        options: [
          { value: "low", label: "Optimal (<100 mg/dL)" },
          { value: "high", label: "Elevated (≥100 mg/dL)" },
        ],
      },
      {
        key: "priorTreatmentFailure",
        label: "Prior Treatment Failure",
        type: "toggle",
        group: "clinical",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
    ],
    samplePatients: [],
  },
  {
    id: "breastCancer",
    label: "Breast Cancer",
    description: "HER2+/ER+ subtypes with CYP2D6-aware tamoxifen guidance and biomarker-driven therapy selection.",
    icon: "🎗️",
    isStub: false,
    requiredInputs: [
      {
        key: "her2",
        label: "HER2 Status",
        type: "select",
        group: "genomic",
        options: [
          { value: "positive", label: "HER2 Positive" },
          { value: "negative", label: "HER2 Negative" },
        ],
      },
      {
        key: "er",
        label: "ER Status",
        type: "select",
        group: "genomic",
        description: "Estrogen receptor status — determines hormone therapy eligibility.",
        options: [
          { value: "positive", label: "ER Positive" },
          { value: "negative", label: "ER Negative" },
        ],
      },
      {
        key: "cyp2d6",
        label: "CYP2D6 Status",
        type: "select",
        group: "pharmacogenomic",
        description: "Converts tamoxifen to active endoxifen — critical for ER+ therapy.",
        options: [
          { value: "poor", label: "Poor Metabolizer" },
          { value: "intermediate", label: "Intermediate Metabolizer" },
          { value: "normal", label: "Normal Metabolizer" },
          { value: "ultrarapid", label: "Ultrarapid Metabolizer" },
        ],
      },
      {
        key: "crp",
        label: "CRP Level",
        type: "select",
        group: "biomarker",
        options: [
          { value: "low", label: "Low (<1 mg/L)" },
          { value: "medium", label: "Medium (1–3 mg/L)" },
          { value: "high", label: "High (>3 mg/L)" },
        ],
      },
      {
        key: "ca153",
        label: "CA 15-3",
        type: "select",
        group: "biomarker",
        description: "Tumor marker for breast cancer monitoring.",
        options: [
          { value: "low", label: "Normal (<30 U/mL)" },
          { value: "high", label: "Elevated (≥30 U/mL)" },
        ],
      },
      {
        key: "priorTreatmentFailure",
        label: "Prior Treatment Failure",
        type: "toggle",
        group: "clinical",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
    ],
    samplePatients: [],
  },
  {
    id: "stroke",
    label: "Stroke",
    description: "Ischemic, hemorrhagic, and TIA — antiplatelet therapy guided by CYP2C19 and inflammatory status.",
    icon: "🧠",
    isStub: false,
    requiredInputs: [
      {
        key: "conditionSubtype",
        label: "Stroke Subtype",
        type: "select",
        group: "clinical",
        options: [
          { value: "ischemic", label: "Ischemic Stroke" },
          { value: "hemorrhagic", label: "Hemorrhagic Stroke" },
          { value: "tia", label: "TIA (Transient Ischemic Attack)" },
        ],
      },
      {
        key: "cyp2c19",
        label: "CYP2C19 Status",
        type: "select",
        group: "pharmacogenomic",
        description: "Determines clopidogrel antiplatelet efficacy.",
        options: [
          { value: "poor", label: "Poor Metabolizer" },
          { value: "intermediate", label: "Intermediate Metabolizer" },
          { value: "normal", label: "Normal Metabolizer" },
          { value: "ultrarapid", label: "Ultrarapid Metabolizer" },
        ],
      },
      {
        key: "inflammatory",
        label: "Inflammatory Biomarker",
        type: "select",
        group: "biomarker",
        description: "Composite inflammatory status (e.g., IL-6, CRP).",
        options: [
          { value: "low", label: "Low" },
          { value: "high", label: "High" },
        ],
      },
      {
        key: "recovery",
        label: "Recovery Biomarker",
        type: "select",
        group: "biomarker",
        description: "Neurological recovery indicators (e.g., BDNF, GFAP).",
        options: [
          { value: "low", label: "Low (Poor prognosis)" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High (Favorable)" },
        ],
      },
      {
        key: "crp",
        label: "CRP Level",
        type: "select",
        group: "biomarker",
        options: [
          { value: "low", label: "Low (<1 mg/L)" },
          { value: "medium", label: "Medium (1–3 mg/L)" },
          { value: "high", label: "High (>3 mg/L)" },
        ],
      },
      {
        key: "priorTreatmentFailure",
        label: "Prior Treatment Failure",
        type: "toggle",
        group: "clinical",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
    ],
    samplePatients: [],
  },
  {
    id: "depression",
    label: "Depression",
    description: "SSRI/SNRI/TCA selection guided by CYP2D6 and CYP2C19 pharmacogenomics — two of the most clinically impactful PGx interactions in psychiatry.",
    icon: "🧩",
    isStub: false,
    requiredInputs: [
      {
        key: "cyp2d6",
        label: "CYP2D6 Status",
        type: "select",
        group: "pharmacogenomic",
        description: "Metabolizes fluoxetine, paroxetine, venlafaxine, amitriptyline, and nortriptyline.",
        options: [
          { value: "poor", label: "Poor Metabolizer" },
          { value: "intermediate", label: "Intermediate Metabolizer" },
          { value: "normal", label: "Normal Metabolizer" },
          { value: "ultrarapid", label: "Ultrarapid Metabolizer" },
        ],
      },
      {
        key: "cyp2c19",
        label: "CYP2C19 Status",
        type: "select",
        group: "pharmacogenomic",
        description: "Metabolizes escitalopram, citalopram, sertraline, and amitriptyline.",
        options: [
          { value: "poor", label: "Poor Metabolizer" },
          { value: "intermediate", label: "Intermediate Metabolizer" },
          { value: "normal", label: "Normal Metabolizer" },
          { value: "ultrarapid", label: "Ultrarapid Metabolizer" },
        ],
      },
      {
        key: "priorTreatmentFailure",
        label: "Prior Antidepressant Failure",
        type: "toggle",
        group: "clinical",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
    ],
    samplePatients: [],
  },
  {
    id: "alzheimers",
    label: "Alzheimer's Disease",
    description: "APOE4-aware therapy guidance with biomarker-informed progression modeling.",
    icon: "🔬",
    isStub: true,
    requiredInputs: [],
    samplePatients: [],
  },
  {
    id: "lungCancer",
    label: "Lung Cancer",
    description: "EGFR/ALK mutation-driven TKI selection with CYP3A4 metabolizer context.",
    icon: "🫁",
    isStub: true,
    requiredInputs: [],
    samplePatients: [],
  },
];

export function getDiseaseConfig(id: string): DiseaseConfig | undefined {
  return DISEASE_CONFIGS.find((d) => d.id === id);
}
