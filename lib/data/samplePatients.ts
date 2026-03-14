import { SamplePatient } from "@/lib/types";

export const SAMPLE_PATIENTS: SamplePatient[] = [
  // ── CARDIOVASCULAR + STROKE ──────────────────────────────────────────────
  {
    id: "marcus-t",
    label: "Marcus T., 68M",
    description:
      "Retired engineer with established CAD and a recent TIA. CYP2C19 poor metabolizer and SLCO1B1 high-risk carrier — clopidogrel is contraindicated across both conditions. High LDL and CRP drive intensive statin need.",
    input: {
      symptoms: [
        "chest pain on exertion",
        "shortness of breath on exertion",
        "transient left-sided weakness (resolved)",
        "elevated blood pressure",
      ],
      genomicMarkers: {},
      pharmacogenomicMarkers: { cyp2c19: "poor", slco1b1: "high" },
      biomarkers: { crp: "high", ldl: "high", inflammatory: "high", recovery: "medium" },
      priorTreatmentFailure: false,
    },
    biomarkerDisplay: {
      crp: { value: "8.4", unit: "mg/L" },
      ldl: { value: "168", unit: "mg/dL" },
      inflammatory: { value: "IL-6: 14.2", unit: "pg/mL" },
      recovery: { value: "BDNF: 18.3", unit: "ng/mL" },
    },
  },
  {
    id: "james-r",
    label: "James R., 45M",
    description:
      "Software engineer with stage 1 hypertension and elevated LDL at routine checkup. Normal CYP2C19 and SLCO1B1 — no pharmacogenomic contraindications. Standard beta-blocker and statin therapy expected.",
    input: {
      symptoms: [
        "elevated blood pressure at routine checkup",
        "fatigue",
        "occasional headaches",
      ],
      genomicMarkers: {},
      pharmacogenomicMarkers: { cyp2c19: "normal", slco1b1: "low" },
      biomarkers: { crp: "medium", ldl: "high" },
      priorTreatmentFailure: false,
    },
    biomarkerDisplay: {
      crp: { value: "2.1", unit: "mg/L" },
      ldl: { value: "142", unit: "mg/dL" },
    },
  },
  {
    id: "elena-v",
    label: "Elena V., 72F",
    description:
      "Retired teacher with atrial fibrillation and hypertension. CYP2C19 intermediate metabolizer and SLCO1B1 high-risk carrier. Elevated CRP and LDL. Anticoagulation and statin selection must account for PGx risk.",
    input: {
      symptoms: [
        "palpitations",
        "irregular heartbeat",
        "elevated blood pressure",
        "occasional dizziness",
      ],
      genomicMarkers: {},
      pharmacogenomicMarkers: { cyp2c19: "intermediate", slco1b1: "high" },
      biomarkers: { crp: "high", ldl: "high" },
      priorTreatmentFailure: false,
    },
    biomarkerDisplay: {
      crp: { value: "5.7", unit: "mg/L" },
      ldl: { value: "155", unit: "mg/dL" },
    },
  },
  {
    id: "robert-k",
    label: "Robert K., 58M",
    description:
      "Construction worker post-ischemic stroke with elevated inflammatory markers. Normal CYP2C19 — clopidogrel is viable. High CRP and inflammatory status support intensive statin and antiplatelet therapy.",
    input: {
      symptoms: [
        "sudden right-sided weakness (resolved)",
        "facial drooping (resolved)",
        "elevated blood pressure",
      ],
      genomicMarkers: {},
      pharmacogenomicMarkers: { cyp2c19: "normal", slco1b1: "low" },
      biomarkers: { crp: "high", ldl: "high", inflammatory: "high", recovery: "high" },
      priorTreatmentFailure: false,
    },
    biomarkerDisplay: {
      crp: { value: "6.9", unit: "mg/L" },
      ldl: { value: "138", unit: "mg/dL" },
      inflammatory: { value: "IL-6: 11.8", unit: "pg/mL" },
      recovery: { value: "BDNF: 28.4", unit: "ng/mL" },
    },
  },
  {
    id: "fatima-a",
    label: "Fatima A., 63F",
    description:
      "Nurse with TIA and hypertension. CYP2C19 poor metabolizer — clopidogrel must be avoided (FDA black box). Aspirin pathway preferred. SLCO1B1 low risk; standard statin therapy is safe.",
    input: {
      symptoms: [
        "transient vision loss (resolved)",
        "brief episode of slurred speech",
        "elevated blood pressure",
        "headaches",
      ],
      genomicMarkers: {},
      pharmacogenomicMarkers: { cyp2c19: "poor", slco1b1: "low" },
      biomarkers: { crp: "medium", ldl: "high", inflammatory: "high", recovery: "high" },
      priorTreatmentFailure: false,
    },
    biomarkerDisplay: {
      crp: { value: "2.8", unit: "mg/L" },
      ldl: { value: "149", unit: "mg/dL" },
      inflammatory: { value: "IL-6: 9.4", unit: "pg/mL" },
      recovery: { value: "BDNF: 31.2", unit: "ng/mL" },
    },
  },

  // ── BREAST CANCER ────────────────────────────────────────────────────────
  {
    id: "diana-k",
    label: "Diana K., 54F",
    description:
      "Primary school teacher with ER-positive, HER2-negative breast cancer alongside hypertension. CYP2D6 poor metabolizer — tamoxifen cannot produce effective endoxifen and must be avoided. Letrozole is the preferred alternative.",
    input: {
      symptoms: [
        "breast lump detected on self-exam",
        "elevated blood pressure",
        "fatigue",
        "persistent headaches",
      ],
      genomicMarkers: { her2: "negative", er: "positive" },
      pharmacogenomicMarkers: { cyp2d6: "poor", cyp2c19: "normal", slco1b1: "low" },
      biomarkers: { ca153: "high", crp: "medium", ldl: "high" },
      priorTreatmentFailure: false,
    },
    biomarkerDisplay: {
      ca153: { value: "52.3", unit: "U/mL" },
      crp: { value: "2.4", unit: "mg/L" },
      ldl: { value: "136", unit: "mg/dL" },
    },
  },
  {
    id: "sarah-o",
    label: "Sarah O., 61F",
    description:
      "Retired nurse with HER2-positive, ER-negative breast cancer presenting alongside an acute ischemic stroke. CYP2C19 poor metabolizer — clopidogrel contraindicated. Trastuzumab-based therapy preferred for HER2+ disease.",
    input: {
      symptoms: [
        "breast mass on mammogram",
        "sudden right-sided weakness",
        "speech difficulty (aphasia)",
        "facial drooping",
      ],
      genomicMarkers: { her2: "positive", er: "negative" },
      pharmacogenomicMarkers: { cyp2c19: "poor", cyp2d6: "normal" },
      biomarkers: { ca153: "high", crp: "high", inflammatory: "high", recovery: "medium" },
      priorTreatmentFailure: false,
    },
    biomarkerDisplay: {
      ca153: { value: "74.1", unit: "U/mL" },
      crp: { value: "7.2", unit: "mg/L" },
      inflammatory: { value: "IL-6: 16.3", unit: "pg/mL" },
      recovery: { value: "BDNF: 21.7", unit: "ng/mL" },
    },
  },
  {
    id: "amara-n",
    label: "Amara N., 47F",
    description:
      "Accountant with ER-positive, HER2-positive breast cancer. Normal CYP2D6 — tamoxifen produces adequate endoxifen. Both trastuzumab (HER2+) and hormone therapy (ER+) are relevant. Elevated CA 15-3.",
    input: {
      symptoms: [
        "breast lump on mammogram",
        "nipple discharge",
        "axillary lymph node swelling",
      ],
      genomicMarkers: { her2: "positive", er: "positive" },
      pharmacogenomicMarkers: { cyp2d6: "normal" },
      biomarkers: { ca153: "high", crp: "high" },
      priorTreatmentFailure: false,
    },
    biomarkerDisplay: {
      ca153: { value: "61.8", unit: "U/mL" },
      crp: { value: "4.9", unit: "mg/L" },
    },
  },
  {
    id: "priya-m",
    label: "Priya M., 51F",
    description:
      "Pharmacist with ER-positive, HER2-negative breast cancer. CYP2D6 intermediate metabolizer — tamoxifen yields ~50% of normal endoxifen. Letrozole may be preferred; prior chemotherapy failure escalates urgency.",
    input: {
      symptoms: ["breast pain", "breast lump", "fatigue"],
      genomicMarkers: { her2: "negative", er: "positive" },
      pharmacogenomicMarkers: { cyp2d6: "intermediate" },
      biomarkers: { ca153: "high", crp: "medium" },
      priorTreatmentFailure: true,
    },
    biomarkerDisplay: {
      ca153: { value: "44.6", unit: "U/mL" },
      crp: { value: "1.9", unit: "mg/L" },
    },
  },

  // ── CARDIOVASCULAR ONLY ──────────────────────────────────────────────────
  {
    id: "chen-w",
    label: "Chen W., 55M",
    description:
      "Cardiologist-referred patient with CAD and prior stent placement. CYP2C19 ultrarapid metabolizer — clopidogrel is metabolized faster, potentially shortening efficacy duration. High LDL drives intensive statin.",
    input: {
      symptoms: [
        "chest tightness on exertion",
        "shortness of breath",
        "prior cardiac stent placement",
      ],
      genomicMarkers: {},
      pharmacogenomicMarkers: { cyp2c19: "ultrarapid", slco1b1: "low" },
      biomarkers: { crp: "medium", ldl: "high" },
      priorTreatmentFailure: true,
    },
    biomarkerDisplay: {
      crp: { value: "2.2", unit: "mg/L" },
      ldl: { value: "161", unit: "mg/dL" },
    },
  },

  // ── DEPRESSION ───────────────────────────────────────────────────────────
  {
    id: "lena-b",
    label: "Lena B., 38F",
    description:
      "Marketing manager with major depressive disorder. CYP2C19 poor metabolizer — escitalopram exposure is ~2× elevated with FDA-flagged QT prolongation risk. Sertraline is preferred as a safer CYP2C19-independent alternative.",
    input: {
      symptoms: [
        "persistent sadness and low mood",
        "loss of interest in daily activities",
        "insomnia",
        "poor concentration",
        "fatigue",
      ],
      genomicMarkers: {},
      pharmacogenomicMarkers: { cyp2c19: "poor", cyp2d6: "normal" },
      biomarkers: {},
      priorTreatmentFailure: false,
    },
  },
  {
    id: "david-o",
    label: "David O., 44M",
    description:
      "Teacher with treatment-resistant depression and anxiety. CYP2D6 poor metabolizer — fluoxetine and amitriptyline carry high toxicity risk; venlafaxine requires careful dose management. Prior SSRI failure warrants TCA consideration with strict monitoring.",
    input: {
      symptoms: [
        "persistent sadness and low mood",
        "anhedonia",
        "sleep disturbance",
        "anxiety",
        "hopelessness",
        "poor concentration",
      ],
      genomicMarkers: {},
      pharmacogenomicMarkers: { cyp2d6: "poor", cyp2c19: "normal" },
      biomarkers: {},
      priorTreatmentFailure: true,
    },
  },
];
