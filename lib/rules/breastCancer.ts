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

  const her2 = input.genomicMarkers["her2"] ?? "negative";
  const er = input.genomicMarkers["er"] ?? "negative";
  const cyp2d6 = input.pharmacogenomicMarkers["cyp2d6"] ?? "normal";
  const crp = input.biomarkers["crp"] ?? "low";
  const ca153 = input.biomarkers["ca153"] ?? "low";
  const priorFail = input.priorTreatmentFailure;

  if (name === "trastuzumab") {
    if (her2 === "positive") {
      result.score += 40;
      result.genomicFlags.push("HER2 Positive — trastuzumab-targeted therapy indicated.");
      result.reasons.push(
        "HER2 overexpression makes trastuzumab the cornerstone of targeted therapy; significantly improves PFS and OS."
      );
      result.evidenceTags.push("HERA Trial", "FDA Approved");
    } else {
      result.score -= 35;
      result.genomicFlags.push("HER2 Negative — no therapeutic target for trastuzumab.");
      result.reasons.push(
        "Trastuzumab only benefits HER2-positive tumors. Use in HER2-negative disease provides no benefit and unnecessary toxicity."
      );
    }
    if (ca153 === "high") {
      result.score += 5;
      result.biomarkerFlags.push("Elevated CA 15-3 — active disease burden; targeted therapy urgency increased.");
    }
    // Trastuzumab not CYP2D6-dependent
    result.reasons.push("Trastuzumab pharmacokinetics are not affected by CYP2D6 status.");
    result.evidenceTags.push("NCCN Breast Guidelines");
  }

  if (name === "tamoxifen") {
    if (er === "positive") {
      result.score += 20;
      result.genomicFlags.push("ER Positive — hormone therapy indicated.");
      result.reasons.push(
        "Estrogen receptor positivity establishes eligibility for endocrine therapy including tamoxifen."
      );
      result.evidenceTags.push("EBCTCG Meta-analysis");
    } else {
      result.score -= 30;
      result.genomicFlags.push("ER Negative — tamoxifen provides no benefit in ER-negative disease.");
      result.reasons.push("Tamoxifen is ineffective in ER-negative tumors; it acts by competitive ER antagonism.");
    }
    // CYP2D6 — the centerpiece rule for breast cancer
    if (cyp2d6 === "poor") {
      result.score -= 45;
      result.pgxFlags.push(
        "⚠️ CYP2D6 POOR METABOLIZER — tamoxifen CANNOT be converted to its active metabolite endoxifen. Therapeutic failure expected. Select an aromatase inhibitor instead."
      );
      result.reasons.push(
        "CYP2D6 is required to metabolize tamoxifen into endoxifen, the pharmacologically active form responsible for ~70% of antiestrogenic activity. Poor metabolizers achieve only 25% of normal endoxifen levels."
      );
      result.evidenceTags.push("CPIC Level A", "Multiple prospective studies");
    } else if (cyp2d6 === "intermediate") {
      result.score -= 20;
      result.pgxFlags.push(
        "CYP2D6 intermediate metabolizer — reduced endoxifen production. Consider aromatase inhibitor or dose escalation with monitoring."
      );
      result.reasons.push(
        "Intermediate CYP2D6 activity yields suboptimal endoxifen levels; clinical benefit of tamoxifen is attenuated."
      );
      result.evidenceTags.push("CPIC Level A");
    } else if (cyp2d6 === "ultrarapid") {
      result.score += 5;
      result.reasons.push(
        "Ultrarapid CYP2D6 — enhanced endoxifen production; tamoxifen efficacy may be superior to average."
      );
    } else {
      result.score += 10;
      result.reasons.push(
        "Normal CYP2D6 — standard tamoxifen conversion to endoxifen expected; full therapeutic benefit anticipated."
      );
    }
    if (priorFail) {
      result.score -= 10;
      result.reasons.push("Prior endocrine therapy failure — resistance mechanisms may limit tamoxifen benefit.");
    }
  }

  if (name === "letrozole") {
    if (er === "positive") {
      result.score += 30;
      result.genomicFlags.push("ER Positive — aromatase inhibitor highly effective in postmenopausal-equivalent context.");
      result.reasons.push(
        "Letrozole (aromatase inhibitor) is preferred over tamoxifen in settings where CYP2D6 metabolism is compromised."
      );
      result.evidenceTags.push("BIG 1-98 Trial", "NCCN Breast Guidelines");
    } else {
      result.score -= 25;
      result.reasons.push("Letrozole provides no benefit in ER-negative disease.");
    }
    // Letrozole not CYP2D6-dependent
    if (cyp2d6 === "poor" || cyp2d6 === "intermediate") {
      result.score += 15;
      result.pgxFlags.push(
        "CYP2D6 poor/intermediate — letrozole is NOT CYP2D6-dependent and is the preferred endocrine therapy over tamoxifen."
      );
      result.reasons.push(
        "Letrozole metabolism is independent of CYP2D6; it maintains full efficacy regardless of CYP2D6 phenotype."
      );
      result.evidenceTags.push("CPIC Guideline Implication");
    }
    if (crp === "high") {
      result.score += 5;
      result.reasons.push("Elevated CRP — letrozole's anti-proliferative effects beneficial in inflammatory context.");
    }
    if (ca153 === "high") {
      result.score += 5;
      result.biomarkerFlags.push("Elevated CA 15-3 — aggressive disease warrants potent endocrine blockade.");
    }
  }

  if (name === "paclitaxel") {
    // Chemo — more relevant if HER2- or as combination
    if (her2 === "negative" && er === "negative") {
      result.score += 25;
      result.reasons.push(
        "Triple-negative profile (HER2-/ER-) — chemotherapy with taxane is standard of care."
      );
      result.evidenceTags.push("NCCN Guidelines");
    } else if (her2 === "positive") {
      result.score += 10;
      result.reasons.push("Paclitaxel may be used in combination with trastuzumab for HER2+ disease.");
      result.evidenceTags.push("APHINITY Trial");
    }
    if (crp === "high") {
      result.score -= 5;
      result.biomarkerFlags.push("High CRP — elevated inflammation may increase paclitaxel neurotoxicity risk.");
    }
    if (ca153 === "high") {
      result.score += 10;
      result.biomarkerFlags.push("Elevated CA 15-3 — high tumor burden supports chemotherapy intensification.");
    }
    if (priorFail) {
      result.score += 10;
      result.reasons.push("Prior endocrine failure — escalation to chemotherapy may be warranted.");
    }
    result.reasons.push("Paclitaxel metabolism not significantly affected by CYP2D6 in this context.");
  }

  if (name === "doxorubicin") {
    if (ca153 === "high") {
      result.score += 15;
      result.biomarkerFlags.push("Elevated CA 15-3 — anthracycline-based regimen appropriate for high disease burden.");
      result.reasons.push("High CA 15-3 suggests significant tumor burden; anthracycline regimen may be needed.");
      result.evidenceTags.push("NCCN Breast Guidelines");
    }
    if (her2 === "positive") {
      result.score -= 10;
      result.reasons.push("Doxorubicin cardiac risk amplified when combined with trastuzumab — typically avoided in HER2+ targeted therapy context.");
    }
    if (crp === "high") {
      result.score -= 5;
      result.reasons.push("Elevated CRP may predict increased anthracycline-related cardiac toxicity risk.");
    }
    if (priorFail) {
      result.score += 15;
      result.reasons.push("Prior treatment failure — salvage anthracycline-based therapy considered.");
    }
    result.reasons.push("Doxorubicin pharmacokinetics are not meaningfully affected by CYP2D6 or CYP2C19.");
    result.evidenceTags.push("Standard of Care");
  }

  return result;
}

export function evaluateBreastCancer(input: PatientInput): DrugRecommendation[] {
  const drugs = ["trastuzumab", "tamoxifen", "letrozole", "paclitaxel", "doxorubicin"];

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
