"use client";
import { usePatient } from "@/context/PatientContext";
import RecommendationCard from "@/components/RecommendationCard";
import InterpretationPanel from "@/components/InterpretationPanel";
import DisclaimerBanner from "@/components/DisclaimerBanner";

export default function ResultsPage() {
  const { patient, result } = usePatient();

  if (!patient || !result) return <p className="text-white p-6">No patient data available.</p>;

  const preferred = result.recommendations.filter((r) => r.category === "Preferred");
  const caution = result.recommendations.filter((r) => r.category === "Caution");
  const avoid = result.recommendations.filter((r) => r.category === "Avoid");

  const hasCriticalFlags = result.recommendations.some((r) =>
    r.pharmacogenomicFlags.some((f) => f.includes("BLACK BOX") || f.includes("⚠️"))
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <DisclaimerBanner />
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        <h1 className="text-3xl font-bold text-white mb-2">{result.diseaseLabel} Report</h1>
        <p className="text-white/50 mb-10">Analysis completed for the provided patient data.</p>

        {/* Critical alert banner */}
        {hasCriticalFlags && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-500/5 flex items-start gap-3">
            <div>
              <p className="text-red-300 font-semibold text-sm mb-1">Critical Pharmacogenomic Alert Detected</p>
              <p className="text-red-300/70 text-xs leading-relaxed">
                One or more treatments have FDA black box warnings or contraindications based on genomic markers.
              </p>
            </div>
          </div>
        )}

        {/* Patient Profile */}
        <div className="mb-8">
          <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">Patient Profile</h2>
          <InterpretationPanel input={result.patientInput} />
        </div>

        {/* Treatment Recommendations */}
        <div>
          <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">Treatment Recommendations</h2>

          {preferred.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-cyan-400/70 text-xs font-medium uppercase tracking-wider">Preferred</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {preferred.map((rec, index) => (
                  <RecommendationCard key={rec.drugName} recommendation={rec} rank={index + 1} />
                ))}
              </div>
            </div>
          )}

          {caution.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-amber-400/70 text-xs font-medium uppercase tracking-wider">Use with Caution</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {caution.map((rec, index) => (
                  <RecommendationCard key={rec.drugName} recommendation={rec} rank={preferred.length + index + 1} />
                ))}
              </div>
            </div>
          )}

          {avoid.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-red-400/70 text-xs font-medium uppercase tracking-wider">Avoid</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {avoid.map((rec, index) => (
                  <RecommendationCard key={rec.drugName} recommendation={rec} rank={preferred.length + caution.length + index + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}