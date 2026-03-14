"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnalysisResult, DiseaseAnalysis, DrugRecommendation } from "@/lib/types";
import RecommendationCard from "@/components/RecommendationCard";
import InterpretationPanel from "@/components/InterpretationPanel";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import PGxImpactPanel from "@/components/PGxImpactPanel";
import DDIWarning from "@/components/DDIWarning";
import PathwayDiagram from "@/components/PathwayDiagram";
import { findInteractions, getRecommendedDrugNames } from "@/lib/inference/interactions";

// ── Confidence badge ───────────────────────────────────────────────────────
function ConfidenceBadge({ confidence, factors }: { confidence: "high" | "medium" | "low"; factors: string[] }) {
  const styles = {
    high: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    medium: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    low: "text-white/40 border-white/15 bg-white/5",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded border text-xs font-medium cursor-help ${styles[confidence]}`}
      title={factors.join(" · ")}
    >
      {confidence} confidence
    </span>
  );
}

// ── Per-disease section ────────────────────────────────────────────────────
function DiseaseSection({ analysis, startRank }: { analysis: DiseaseAnalysis; startRank: number }) {
  const preferred = analysis.recommendations.filter((r) => r.category === "Preferred");
  const caution = analysis.recommendations.filter((r) => r.category === "Caution");
  const avoid = analysis.recommendations.filter((r) => r.category === "Avoid");
  const hasCritical = analysis.recommendations.some((r) =>
    r.pharmacogenomicFlags.some((f) => f.includes("BLACK BOX") || f.includes("⚠️") || f.includes("FDA WARNING"))
  );
  let rank = startRank;

  const subtypeLabel = analysis.conditionSubtype
    ? analysis.conditionSubtype.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <div className="mb-10 print:mb-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5 print:border-gray-200">
        <span className="text-3xl">{analysis.diseaseIcon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-white font-bold text-xl print:text-black">{analysis.diseaseLabel}</h2>
            {subtypeLabel && <span className="text-cyan-400/70 text-sm">— {subtypeLabel}</span>}
            {analysis.confidence && (
              <ConfidenceBadge confidence={analysis.confidence} factors={analysis.confidenceFactors ?? []} />
            )}
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">{preferred.length} Preferred</span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">{caution.length} Caution</span>
          <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{avoid.length} Avoid</span>
        </div>
      </div>

      {hasCritical && (
        <div className="mb-5 p-4 rounded-xl border border-red-500/30 bg-red-500/5 flex items-start gap-3 print:border-red-300">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-red-300 font-semibold text-sm mb-1">Critical PGx Alert — {analysis.diseaseLabel}</p>
            <p className="text-red-300/70 text-xs leading-relaxed">
              One or more treatments have FDA black box warnings or CPIC Level A contraindications based on this patient's genomic markers.
            </p>
          </div>
        </div>
      )}

      {preferred.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-cyan-400/70 text-xs font-medium uppercase tracking-wider">Recommended</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {preferred.map((rec) => { rank++; return <RecommendationCard key={rec.drugName} recommendation={rec} rank={rank} />; })}
          </div>
        </div>
      )}
      {caution.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-amber-400/70 text-xs font-medium uppercase tracking-wider">Use with Caution</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {caution.map((rec) => { rank++; return <RecommendationCard key={rec.drugName} recommendation={rec} rank={rank} />; })}
          </div>
        </div>
      )}
      {avoid.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-red-400/70 text-xs font-medium uppercase tracking-wider">Avoid</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {avoid.map((rec) => { rank++; return <RecommendationCard key={rec.drugName} recommendation={rec} rank={rank} />; })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("precura_result");
    if (stored) {
      try { setResult(JSON.parse(stored)); } catch { /* invalid */ }
    }
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white/30 text-sm">Loading…</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-6">
        <p className="text-white/50 text-lg">No analysis result found.</p>
        <Link href="/" className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors">
          Back to Patients →
        </Link>
      </div>
    );
  }

  const isMultiDisease = result.inferredDiseases && result.inferredDiseases.length > 0;

  // Drug-drug interactions across all recommended drugs
  const recommendedDrugNames = isMultiDisease
    ? getRecommendedDrugNames(result.inferredDiseases)
    : [];
  const interactions = findInteractions(recommendedDrugNames);

  // PGx-relevant genes for pathway diagrams
  const pgxMarkers = result.patientInput.pharmacogenomicMarkers;
  const showCyp2c19Pathway =
    (pgxMarkers.cyp2c19 && pgxMarkers.cyp2c19 !== "normal") &&
    isMultiDisease && result.inferredDiseases.some(
      (d) => d.diseaseDomain === "cardiovascular" || d.diseaseDomain === "stroke" || d.diseaseDomain === "depression"
    );
  const showCyp2d6Pathway =
    (pgxMarkers.cyp2d6 && pgxMarkers.cyp2d6 !== "normal") &&
    isMultiDisease && result.inferredDiseases.some(
      (d) => d.diseaseDomain === "breastCancer" || d.diseaseDomain === "depression"
    );
  const showSlco1b1Pathway =
    (pgxMarkers.slco1b1 && pgxMarkers.slco1b1 !== "low") &&
    isMultiDisease && result.inferredDiseases.some((d) => d.diseaseDomain === "cardiovascular");

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  // Legacy single-disease (demo page)
  const legacyRecs: DrugRecommendation[] = result.recommendations ?? [];
  const legacyPreferred = legacyRecs.filter((r) => r.category === "Preferred");
  const legacyCaution = legacyRecs.filter((r) => r.category === "Caution");
  const legacyAvoid = legacyRecs.filter((r) => r.category === "Avoid");
  const legacyHasCritical = legacyRecs.some((r) =>
    r.pharmacogenomicFlags.some((f) => f.includes("BLACK BOX") || f.includes("⚠️"))
  );
  let legacyRank = 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] print:bg-white">
      <DisclaimerBanner />

      <div className="mx-auto max-w-6xl px-6 pt-24 pb-20 print:pt-6 print:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 print:mb-6">
          <div>
            <Link href="/" className="text-white/30 hover:text-white/60 text-sm transition-colors print:hidden">
              ← Patient Registry
            </Link>
            <h1 className="text-3xl font-bold text-white mt-1 print:text-black print:text-2xl">
              {isMultiDisease ? result.patientLabel : result.diseaseLabel} — Clinical Report
            </h1>
            <p className="text-white/30 text-sm mt-1 print:text-gray-400">{formatDate(result.timestamp)}</p>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            {/* Print / PDF button */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] text-white/60 hover:text-white text-sm font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              Print / Save PDF
            </button>

            {/* Inferred disease jump links */}
            {isMultiDisease && (
              <div className="flex flex-wrap gap-2">
                {result.inferredDiseases.map((d) => (
                  <a
                    key={d.diseaseDomain}
                    href={`#${d.diseaseDomain}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-[#13131a] hover:border-cyan-500/30 transition-colors text-sm text-white/60 hover:text-white"
                  >
                    <span>{d.diseaseIcon}</span>
                    <span>{d.diseaseLabel}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Patient profile */}
        <div className="mb-10">
          <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4 print:text-gray-500">
            Patient Profile
          </h2>
          <InterpretationPanel input={result.patientInput} />
        </div>

        {/* PGx Impact — "how genomics changed this plan" */}
        {isMultiDisease && Object.keys(pgxMarkers).length > 0 && (
          <div className="mb-10">
            <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4 print:text-gray-500">
              Genomic Impact on Treatment
            </h2>
            <PGxImpactPanel
              patientInput={result.patientInput}
              inferredDiseases={result.inferredDiseases}
            />
          </div>
        )}

        {/* Treatment recommendations */}
        <div className="mb-10">
          <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-6 print:text-gray-500">
            Treatment Recommendations
          </h2>

          {isMultiDisease ? (
            result.inferredDiseases.map((analysis, i) => {
              const priorCount = result.inferredDiseases
                .slice(0, i)
                .reduce((sum, a) => sum + a.recommendations.length, 0);
              return (
                <div key={analysis.diseaseDomain} id={analysis.diseaseDomain}>
                  <DiseaseSection analysis={analysis} startRank={priorCount} />
                </div>
              );
            })
          ) : (
            // Legacy single-disease (demo page fallback)
            <>
              {legacyHasCritical && (
                <div className="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-500/5 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-red-300 font-semibold text-sm mb-1">Critical Pharmacogenomic Alert</p>
                    <p className="text-red-300/70 text-xs">One or more treatments have FDA black box warnings based on this patient's genomic markers.</p>
                  </div>
                </div>
              )}
              {[legacyPreferred, legacyCaution, legacyAvoid].map((group, gi) => {
                const labels = ["Recommended", "Use with Caution", "Avoid"];
                const colors = ["cyan", "amber", "red"];
                if (!group.length) return null;
                return (
                  <div key={gi} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full bg-${colors[gi]}-400`} />
                      <span className={`text-${colors[gi]}-400/70 text-xs font-medium uppercase tracking-wider`}>{labels[gi]}</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {group.map((rec) => { legacyRank++; return <RecommendationCard key={rec.drugName} recommendation={rec} rank={legacyRank} />; })}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Drug-Drug Interactions */}
        {interactions.length > 0 && (
          <div className="mb-10">
            <DDIWarning interactions={interactions} />
          </div>
        )}

        {/* Metabolic pathway diagrams */}
        {(showCyp2c19Pathway || showCyp2d6Pathway || showSlco1b1Pathway) && (
          <div className="mb-10">
            <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4 print:text-gray-500">
              Metabolic Pathway Diagrams
            </h2>
            <div className="space-y-4">
              {showCyp2c19Pathway && (
                <PathwayDiagram gene="cyp2c19" phenotype={pgxMarkers.cyp2c19} />
              )}
              {showCyp2d6Pathway && (
                <PathwayDiagram gene="cyp2d6" phenotype={pgxMarkers.cyp2d6} />
              )}
              {showSlco1b1Pathway && (
                <PathwayDiagram gene="slco1b1" phenotype={pgxMarkers.slco1b1} />
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <Link href="/" className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm font-medium transition-colors">
            ← Back to Patient Registry
          </Link>
          <p className="text-white/20 text-xs text-center max-w-sm">
            For research demonstration only. Not for clinical use. Consult a qualified clinician for medical decisions.
          </p>
        </div>

        {/* Print footer */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-200">
          <p className="text-gray-400 text-xs text-center">
            Precura — Pharmacogenomic Clinical Decision Support · Research Prototype · MIT GrandHack 2025 ·
            NOT FOR CLINICAL USE — always consult a qualified clinician
          </p>
        </div>
      </div>
    </div>
  );
}
