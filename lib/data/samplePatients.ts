import { SamplePatient } from "@/lib/types";

export const SAMPLE_PATIENTS: Record<string, SamplePatient[]> = {
  cardiovascular: [
    {
      id: "cardio-a",
      label: "Patient A — CAD + CYP2C19 Poor Metabolizer",
      description:
        "65-year-old with established CAD. CYP2C19 poor metabolizer — clopidogrel will be flagged as Avoid. Elevated LDL and CRP support intensive statin therapy.",
      input: {
        diseaseDomain: "cardiovascular",
        conditionSubtype: "cad",
        genomicMarkers: {},
        pharmacogenomicMarkers: {
          cyp2c19: "poor",
          slco1b1: "low",
        },
        biomarkers: {
          crp: "high",
          ldl: "high",
        },
        priorTreatmentFailure: false,
      },
    },
    {
      id: "cardio-b",
      label: "Patient B — Hypertension + Normal Metabolizer",
      description:
        "52-year-old with hypertension and elevated LDL. Normal CYP2C19 and SLCO1B1 — standard statin and beta-blocker therapy preferred.",
      input: {
        diseaseDomain: "cardiovascular",
        conditionSubtype: "hypertension",
        genomicMarkers: {},
        pharmacogenomicMarkers: {
          cyp2c19: "normal",
          slco1b1: "low",
        },
        biomarkers: {
          crp: "medium",
          ldl: "high",
        },
        priorTreatmentFailure: false,
      },
    },
  ],
  breastCancer: [
    {
      id: "breast-a",
      label: "Patient A — ER+/HER2- + CYP2D6 Poor Metabolizer",
      description:
        "54-year-old with ER-positive, HER2-negative breast cancer. CYP2D6 poor metabolizer — tamoxifen cannot produce active endoxifen and will be flagged as Avoid. Letrozole is preferred.",
      input: {
        diseaseDomain: "breastCancer",
        conditionSubtype: undefined,
        genomicMarkers: {
          her2: "negative",
          er: "positive",
        },
        pharmacogenomicMarkers: {
          cyp2d6: "poor",
        },
        biomarkers: {
          crp: "medium",
          ca153: "high",
        },
        priorTreatmentFailure: false,
      },
    },
    {
      id: "breast-b",
      label: "Patient B — HER2+ + Normal CYP2D6",
      description:
        "48-year-old with HER2-positive, ER-negative breast cancer. Normal CYP2D6. Trastuzumab-based targeted therapy is preferred; tamoxifen not indicated (ER negative).",
      input: {
        diseaseDomain: "breastCancer",
        conditionSubtype: undefined,
        genomicMarkers: {
          her2: "positive",
          er: "negative",
        },
        pharmacogenomicMarkers: {
          cyp2d6: "normal",
        },
        biomarkers: {
          crp: "low",
          ca153: "high",
        },
        priorTreatmentFailure: false,
      },
    },
  ],
  stroke: [
    {
      id: "stroke-a",
      label: "Patient A — Ischemic + CYP2C19 Poor Metabolizer",
      description:
        "70-year-old post-ischemic stroke. CYP2C19 poor metabolizer — clopidogrel antiplatelet therapy will be flagged as Avoid (FDA black box). Aspirin pathway and statin intensification are preferred.",
      input: {
        diseaseDomain: "stroke",
        conditionSubtype: "ischemic",
        genomicMarkers: {},
        pharmacogenomicMarkers: {
          cyp2c19: "poor",
        },
        biomarkers: {
          inflammatory: "high",
          recovery: "medium",
          crp: "high",
        },
        priorTreatmentFailure: false,
      },
    },
    {
      id: "stroke-b",
      label: "Patient B — TIA + Normal Metabolizer + High Inflammation",
      description:
        "61-year-old post-TIA follow-up. Normal CYP2C19 metabolizer. High inflammatory biomarkers. Aspirin pathway and statin intensification preferred; clopidogrel viable.",
      input: {
        diseaseDomain: "stroke",
        conditionSubtype: "tia",
        genomicMarkers: {},
        pharmacogenomicMarkers: {
          cyp2c19: "normal",
        },
        biomarkers: {
          inflammatory: "high",
          recovery: "high",
          crp: "high",
        },
        priorTreatmentFailure: false,
      },
    },
  ],
};
