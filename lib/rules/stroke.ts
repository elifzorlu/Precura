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

function scoreDrug(name: string, input: PatientInput): ScoredDrug {
  const result: ScoredDrug = {
    drugName: name,
    score: 50,
    reasons: [],
    genomicFlags: [],
    biomarkerFlags: [],
    pgxFlags: [],
    evidenceTags: [],
  };

  const cyp2c19 = input.pharmacogenomicMarkers["cyp2c19"] ?? "normal";
  const inflammatory = input.biomarkers["inflammatory"] ?? "low";
  const recovery = input.biomarkers["recovery"] ?? "medium";
  const crp = input.biomarkers["crp"] ?? "low";
  const subtype = input.conditionSubtype ?? "ischemic";
  const priorFail = input.priorTreatmentFailure;

  if (name === "clopidogrel") {
    if (subtype === "ischemic" || subtype === "tia") {
      result.score += 20;
      result.reasons.push(
        "Clopidogrel is guideline-recommended antiplatelet therapy for ischemic stroke and TIA secondary prevention."
      );
      result.evidenceTags.push("AHA/ASA Stroke Guidelines");
    } else if (subtype === "hemorrhagic") {
      result.score -= 30;
      result.reasons.push(
        "Antiplatelet therapy is contraindicated in acute hemorrhagic stroke — increases bleeding risk."
      );
    }
    // CYP2C19 — same critical rule as cardiovascular
    if (cyp2c19 === "poor") {
      result.score -= 50;
      result.pgxFlags.push(
        "⚠️ FDA BLACK BOX WARNING: CYP2C19 poor metabolizer — clopidogrel cannot be adequately activated. Antiplatelet prophylaxis will be ineffective. Consider ticagrelor or aspirin-based alternatives."
      );
      result.reasons.push(
        "CYP2C19 poor metabolizer status prevents adequate bioactivation of clopidogrel via hepatic CYP2C19. The active metabolite that inhibits platelet ADP-P2Y12 receptors is not produced at therapeutic levels."
      );
      result.evidenceTags.push("FDA Black Box Warning", "CPIC Level A", "POINT Trial sub-analysis");
    } else if (cyp2c19 === "intermediate") {
      result.score -= 20;
      result.pgxFlags.push(
        "CYP2C19 intermediate metabolizer — reduced platelet inhibition expected. Evaluate ticagrelor as an alternative."
      );
      result.reasons.push(
        "Intermediate CYP2C19 activity yields reduced active metabolite; platelet inhibition may be insufficient for stroke prevention."
      );
      result.evidenceTags.push("CPIC Level A");
    } else if (cyp2c19 === "ultrarapid") {
      result.score += 5;
      result.reasons.push("Ultrarapid CYP2C19 — enhanced clopidogrel activation; standard dosing appropriate.");
    } else {
      result.score += 10;
      result.reasons.push("Normal CYP2C19 — standard clopidogrel efficacy anticipated for stroke/TIA prevention.");
    }
    if (priorFail) {
      result.score -= 10;
      result.reasons.push("Prior antiplatelet therapy failure — reassess mechanism and consider alternative agent.");
    }
  }

  if (name === "aspirin pathway") {
    if (subtype === "ischemic" || subtype === "tia") {
      result.score += 25;
      result.reasons.push(
        "Aspirin-based antiplatelet therapy is foundational for ischemic stroke/TIA secondary prevention and is not CYP2C19-dependent."
      );
      result.evidenceTags.push("AHA/ASA Guidelines", "CAST Trial");
    } else if (subtype === "hemorrhagic") {
      result.score -= 25;
      result.reasons.push("Aspirin is contraindicated in acute hemorrhagic stroke phase.");
    }
    // Aspirin has no significant CYP2C19 interaction
    if (cyp2c19 === "poor" || cyp2c19 === "intermediate") {
      result.score += 15;
      result.pgxFlags.push(
        "CYP2C19 poor/intermediate — aspirin-based pathway is CYP2C19-independent; preferred antiplatelet when clopidogrel is contraindicated."
      );
      result.reasons.push(
        "Aspirin irreversibly inhibits COX-1, a mechanism independent of CYP2C19. It is the preferred antiplatelet agent when CYP2C19-dependent drugs are contraindicated."
      );
      result.evidenceTags.push("CPIC Implication");
    }
    if (inflammatory === "high") {
      result.score += 10;
      result.biomarkerFlags.push("High inflammatory biomarker — aspirin anti-inflammatory effect provides dual benefit.");
      result.reasons.push("Elevated inflammation signals thromboinflammatory pathways; aspirin addresses both platelet activation and inflammation.");
    }
    if (crp === "high") {
      result.score += 5;
      result.biomarkerFlags.push("Elevated CRP — aspirin's anti-inflammatory properties may be additionally beneficial.");
    }
  }

  if (name === "anticoagulation review") {
    if (subtype === "ischemic") {
      result.score += 15;
      result.reasons.push(
        "Anticoagulation review is warranted for cardioembolic ischemic stroke sources (e.g., AF, ventricular thrombus)."
      );
      result.evidenceTags.push("AHA/ASA Stroke Guidelines");
    } else if (subtype === "hemorrhagic") {
      result.score -= 20;
      result.reasons.push(
        "Anticoagulation is contraindicated in acute hemorrhagic stroke; review for reversal agents instead."
      );
    } else if (subtype === "tia") {
      result.score += 10;
      result.reasons.push("TIA may warrant anticoagulation evaluation if cardioembolic source identified.");
    }
    if (crp === "high") {
      result.score -= 5;
      result.reasons.push("High CRP may indicate active infection or inflammation — consider anticoagulation timing carefully.");
    }
    result.reasons.push("Anticoagulation choice (DOAC vs warfarin) does not depend on CYP2C19 status.");
  }

  if (name === "statin intensification") {
    if (subtype === "ischemic" || subtype === "tia") {
      result.score += 20;
      result.reasons.push(
        "High-intensity statin therapy is recommended for all ischemic stroke/TIA patients regardless of LDL — plaque stabilization and pleiotropic effects."
      );
      result.evidenceTags.push("SPARCL Trial", "AHA/ASA Stroke Guidelines");
    }
    if (crp === "high") {
      result.score += 10;
      result.biomarkerFlags.push("High CRP — statin anti-inflammatory benefit directly relevant to stroke pathophysiology.");
      result.reasons.push("Elevated CRP in stroke context reflects neuroinflammation; statins reduce CRP and vascular inflammation.");
    }
    if (inflammatory === "high") {
      result.score += 8;
      result.reasons.push("High inflammatory biomarker — statin intensification addresses neuroinflammatory component.");
    }
    if (recovery === "low") {
      result.score += 5;
      result.reasons.push("Poor recovery biomarker — early statin neuroprotective effects may support recovery.");
    }
    result.reasons.push("Statin metabolism is primarily CYP3A4/CYP2C9 — not significantly impacted by CYP2C19 in this panel.");
  }

  if (name === "neurorehabilitation pathway") {
    result.score += 15;
    result.reasons.push(
      "Neurorehabilitation is essential for functional recovery in all stroke subtypes."
    );
    if (recovery === "high") {
      result.score += 20;
      result.biomarkerFlags.push("High recovery biomarker — favorable neuroplasticity potential; aggressive rehabilitation recommended.");
      result.reasons.push("Favorable recovery biomarker profile indicates high neuroplasticity potential; intensive rehab strongly indicated.");
      result.evidenceTags.push("NICE Stroke Rehabilitation Guidelines");
    } else if (recovery === "medium") {
      result.score += 10;
      result.reasons.push("Moderate recovery biomarker — standard neurorehabilitation protocol appropriate.");
    } else {
      result.score += 0;
      result.reasons.push("Poor recovery biomarker — intensive rehabilitation may still provide benefit; ongoing assessment needed.");
    }
    if (inflammatory === "high") {
      result.score -= 5;
      result.biomarkerFlags.push("High inflammation — may impede neurorecovery; concurrent anti-inflammatory strategy warranted.");
    }
    if (subtype === "hemorrhagic") {
      result.score += 10;
      result.reasons.push("Neurorehabilitation is particularly critical post-hemorrhagic stroke for functional recovery.");
    }
    result.evidenceTags.push("AHA/ASA Stroke Guidelines");
  }

  return result;
}

export function evaluateStroke(input: PatientInput): DrugRecommendation[] {
  const drugs = [
    "clopidogrel",
    "aspirin pathway",
    "anticoagulation review",
    "statin intensification",
    "neurorehabilitation pathway",
  ];

  return drugs.map((drug) => {
    const s = scoreDrug(drug, input);
    const clampedScore = Math.max(0, Math.min(100, s.score));
    let category: "Preferred" | "Caution" | "Avoid";
    if (clampedScore >= 65) category = "Preferred";
    else if (clampedScore >= 40) category = "Caution";
    else category = "Avoid";

    return {
      drugName: s.drugName,
      suitabilityScore: clampedScore,
      category,
      reasons: s.reasons,
      genomicFlags: s.genomicFlags,
      biomarkerFlags: s.biomarkerFlags,
      pharmacogenomicFlags: s.pgxFlags,
      evidenceTags: s.evidenceTags,
    };
  });
}
