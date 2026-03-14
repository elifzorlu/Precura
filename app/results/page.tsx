"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnalysisResult } from "@/lib/types";
import RecommendationCard from "@/components/RecommendationCard";
import InterpretationPanel from "@/components/InterpretationPanel";
import DisclaimerBanner from "@/components/DisclaimerBanner";

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("precura_result");
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {
        // invalid data
      }
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
        <Link
          href="/demo"
          className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors"
        >
          Run Analysis →
        </Link>
      </div>
    );
  }

  const preferred = result.recommendations.filter((r) => r.category === "Preferred");
  const caution = result.recommendations.filter((r) => r.category === "Caution");
  const avoid = result.recommendations.filter((r) => r.category === "Avoid");

  const hasCriticalFlags = result.recommendations.some((r) =>
    r.pharmacogenomicFlags.some((f) => f.includes("BLACK BOX") || f.includes("⚠️"))
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  let rank = 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <DisclaimerBanner />

      <div className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/demo" className="text-white/30 hover:text-white/60 text-sm transition-colors">
                ← New Analysis
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-white">{result.diseaseLabel} Report</h1>
            <p className="text-white/30 text-sm mt-1">{formatDate(result.timestamp)}</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <span className="text-cyan-400 text-lg font-bold">{preferred.length}</span>
              <span className="text-cyan-400/70 text-xs">Preferred</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-amber-400 text-lg font-bold">{caution.length}</span>
              <span className="text-amber-400/70 text-xs">Caution</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <span className="text-red-400 text-lg font-bold">{avoid.length}</span>
              <span className="text-red-400/70 text-xs">Avoid</span>
            </div>
          </div>
        </div>

        {/* Critical alert banner */}
        {hasCriticalFlags && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-500/5 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
            </svg>
            <div>
              <p className="text-red-300 font-semibold text-sm mb-1">Critical Pharmacogenomic Alert Detected</p>
              <p className="text-red-300/70 text-xs leading-relaxed">
                One or more treatments in this profile have FDA black box warnings or CPIC Level A contraindications
                based on this patient's genomic markers. Review flagged treatments carefully.
              </p>
            </div>
          </div>
        )}

        {/* Interpretation panels */}
        <div className="mb-8">
          <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">Patient Profile</h2>
          <InterpretationPanel input={result.patientInput} />
        </div>

        {/* Treatment rankings */}
        <div>
          <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">Treatment Recommendations</h2>

          {preferred.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-cyan-400/70 text-xs font-medium uppercase tracking-wider">Preferred</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {preferred.map((rec) => {
                  rank++;
                  return <RecommendationCard key={rec.drugName} recommendation={rec} rank={rank} />;
                })}
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
                {caution.map((rec) => {
                  rank++;
                  return <RecommendationCard key={rec.drugName} recommendation={rec} rank={rank} />;
                })}
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
                {avoid.map((rec) => {
                  rank++;
                  return <RecommendationCard key={rec.drugName} recommendation={rec} rank={rank} />;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/demo"
            className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm font-medium transition-colors"
          >
            ← Run Another Analysis
          </Link>
          <p className="text-white/20 text-xs text-center max-w-sm">
            For research demonstration only. Not for clinical use. Consult a qualified clinician for medical decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
