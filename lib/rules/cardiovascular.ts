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
  const slco1b1 = input.pharmacogenomicMarkers["slco1b1"] ?? "low";
  const crp = input.biomarkers["crp"] ?? "low";
  const ldl = input.biomarkers["ldl"] ?? "low";
  const subtype = input.conditionSubtype ?? "cad";
  const priorFail = input.priorTreatmentFailure;

  if (name === "clopidogrel") {
    // Indication bonus
    if (subtype === "cad" || subtype === "atrial_fibrillation") {
      result.score += 15;
      result.reasons.push("Indicated for CAD and AF antiplatelet prophylaxis.");
      result.evidenceTags.push("ACC/AHA Guidelines");
    }
    // CYP2C19 pharmacogenomic rules — centerpiece
    if (cyp2c19 === "poor") {
      result.score -= 50;
      result.pgxFlags.push(
        "⚠️ FDA BLACK BOX WARNING: CYP2C19 poor metabolizer — clopidogrel cannot be adequately activated. Inadequate platelet inhibition expected."
      );
      result.reasons.push(
        "CYP2C19 poor metabolizer status severely impairs conversion of clopidogrel to its active thiol metabolite, rendering it clinically ineffective."
      );
      result.evidenceTags.push("FDA Black Box Warning", "CPIC Level A");
    } else if (cyp2c19 === "intermediate") {
      result.score -= 20;
      result.pgxFlags.push(
        "CYP2C19 intermediate metabolizer — reduced clopidogrel activation. Consider dose adjustment or prasugrel/ticagrelor."
      );
      result.reasons.push(
        "Intermediate CYP2C19 activity leads to reduced active metabolite exposure; platelet inhibition may be subtherapeutic."
      );
      result.evidenceTags.push("CPIC Level A");
    } else if (cyp2c19 === "ultrarapid") {
      result.score += 5;
      result.reasons.push(
        "Ultrarapid CYP2C19 metabolizer — enhanced clopidogrel activation, standard dosing appropriate."
      );
    } else {
      result.score += 10;
      result.reasons.push(
        "Normal CYP2C19 metabolizer — standard clopidogrel dosing expected to provide adequate platelet inhibition."
      );
    }
    if (priorFail) {
      result.score -= 10;
      result.reasons.push("Prior treatment failure — re-evaluate antiplatelet strategy.");
    }
  }

  if (name === "atorvastatin") {
    // Statin for LDL
    if (ldl === "high") {
      result.score += 20;
      result.biomarkerFlags.push("Elevated LDL ≥100 mg/dL — high-intensity statin indicated.");
      result.reasons.push("Elevated LDL strongly supports high-intensity statin therapy.");
      result.evidenceTags.push("ACC/AHA Cholesterol Guidelines");
    } else {
      result.score += 5;
      result.reasons.push("LDL within target range — moderate statin benefit.");
    }
    if (crp === "high") {
      result.score += 10;
      result.biomarkerFlags.push("High CRP — statin pleiotropic anti-inflammatory benefit applies.");
      result.reasons.push("High CRP supports statin use for anti-inflammatory pleiotropic benefit (JUPITER trial evidence).");
      result.evidenceTags.push("JUPITER Trial");
    }
    if (slco1b1 === "high") {
      result.score -= 15;
      result.pgxFlags.push(
        "SLCO1B1 *5 carrier — increased plasma atorvastatin exposure, elevated myopathy risk. Consider lower dose or rosuvastatin."
      );
      result.reasons.push(
        "SLCO1B1 reduced-function variant impairs hepatic uptake, increasing systemic statin levels and myopathy risk."
      );
      result.evidenceTags.push("CPIC SLCO1B1 Guidelines");
    } else {
      result.score += 5;
      result.reasons.push("Normal SLCO1B1 — standard atorvastatin dosing tolerated.");
    }
    if (subtype === "cad") {
      result.score += 10;
      result.reasons.push("High-intensity statin is guideline-directed therapy for established CAD.");
    }
  }

  if (name === "rosuvastatin") {
    if (ldl === "high") {
      result.score += 20;
      result.biomarkerFlags.push("Elevated LDL — rosuvastatin preferred for potent LDL reduction.");
      result.reasons.push("Rosuvastatin provides robust LDL reduction; appropriate for high LDL.");
      result.evidenceTags.push("ACC/AHA Cholesterol Guidelines");
    }
    // Rosuvastatin less affected by SLCO1B1 than simvastatin
    if (slco1b1 === "high") {
      result.score -= 5;
      result.pgxFlags.push(
        "SLCO1B1 *5 carrier — rosuvastatin carries lower myopathy risk than simvastatin; preferred statin choice in this patient."
      );
      result.reasons.push(
        "Rosuvastatin is less dependent on SLCO1B1 hepatic uptake; myopathy risk increase is modest compared to simvastatin."
      );
      result.evidenceTags.push("CPIC SLCO1B1 Guidelines");
    } else {
      result.score += 8;
      result.reasons.push("Normal SLCO1B1 — rosuvastatin well tolerated at standard doses.");
    }
    if (crp === "high") {
      result.score += 8;
      result.reasons.push("Elevated CRP — statin anti-inflammatory benefit applies.");
      result.evidenceTags.push("JUPITER Trial");
    }
    if (subtype === "cad") {
      result.score += 10;
      result.reasons.push("Rosuvastatin is guideline-supported for secondary prevention in CAD.");
    }
  }

  if (name === "metoprolol") {
    if (subtype === "hypertension") {
      result.score += 20;
      result.reasons.push("Beta-blocker is first-line for hypertension, particularly with concurrent heart disease.");
      result.evidenceTags.push("JNC 8 Guidelines");
    }
    if (subtype === "atrial_fibrillation") {
      result.score += 25;
      result.reasons.push("Metoprolol is first-line rate control agent for atrial fibrillation.");
      result.evidenceTags.push("ACC/AHA AF Guidelines");
    }
    if (subtype === "cad") {
      result.score += 15;
      result.reasons.push("Beta-blockade reduces cardiac workload and mortality in CAD.");
    }
    // CYP2D6 note (metoprolol is CYP2D6 substrate — but we don't have that input for cardio)
    result.reasons.push("Metoprolol efficacy not significantly altered by CYP2C19 or SLCO1B1 genotype in this panel.");
    if (priorFail) {
      result.score -= 5;
      result.reasons.push("Prior treatment failure — review dosing adequacy and adherence.");
    }
  }

  if (name === "apixaban") {
    if (subtype === "atrial_fibrillation") {
      result.score += 30;
      result.reasons.push("Apixaban is first-line DOAC for stroke prevention in atrial fibrillation.");
      result.evidenceTags.push("ARISTOTLE Trial", "ACC/AHA AF Guidelines");
    } else {
      result.score -= 10;
      result.reasons.push("Apixaban has limited indication outside atrial fibrillation in this context.");
    }
    // Apixaban is NOT CYP2C19-dependent, so poor CYP2C19 patients actually benefit
    if (cyp2c19 === "poor" || cyp2c19 === "intermediate") {
      result.score += 10;
      result.reasons.push(
        "Apixaban metabolism is independent of CYP2C19 — preferred anticoagulant when clopidogrel is contraindicated by CYP2C19 status."
      );
      result.genomicFlags.push("CYP2C19-independent — safe in poor/intermediate metabolizers.");
    }
    if (crp === "high") {
      result.score += 5;
      result.reasons.push("Elevated inflammation increases stroke risk in AF — reinforces anticoagulation need.");
    }
    result.evidenceTags.push("FDA Approved");
  }

  return result;
}

export function evaluateCardiovascular(input: PatientInput): DrugRecommendation[] {
  const drugs = ["clopidogrel", "atorvastatin", "rosuvastatin", "metoprolol", "apixaban"];

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
