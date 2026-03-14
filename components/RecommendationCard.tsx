"use client";
import { useState } from "react";
import { DrugRecommendation } from "@/lib/types";
import CategoryBadge from "./CategoryBadge";
import ScoreBar from "./ScoreBar";
import FlagPill from "./FlagPill";

interface RecommendationCardProps {
  recommendation: DrugRecommendation;
  rank: number;
}

export default function RecommendationCard({ recommendation, rank }: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { drugName, suitabilityScore, category, reasons, genomicFlags, biomarkerFlags, pharmacogenomicFlags, evidenceTags } = recommendation;

  const hasCriticalFlag = pharmacogenomicFlags.some((f) => f.includes("BLACK BOX") || f.includes("CANNOT") || f.includes("⚠️"));

  const borderColor = {
    Preferred: "border-cyan-500/20",
    Caution: "border-amber-500/20",
    Avoid: "border-red-500/30",
  }[category];

  const bgGlow = {
    Preferred: "",
    Caution: "",
    Avoid: hasCriticalFlag ? "bg-red-500/[0.03]" : "",
  }[category];

  return (
    <div className={`rounded-xl border ${borderColor} ${bgGlow} bg-[#13131a] overflow-hidden`}>
      {/* Critical flag banner */}
      {hasCriticalFlag && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2.5 flex items-start gap-2">
          <span className="text-red-400 text-sm flex-shrink-0 mt-0.5">⚠️</span>
          <p className="text-red-300 text-xs leading-relaxed font-medium">
            {pharmacogenomicFlags.find((f) => f.includes("⚠️"))?.replace("⚠️", "").trim()}
          </p>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-white/40 text-xs font-bold">{rank}</span>
            </div>
            <div>
              <h3 className="text-white font-semibold text-base capitalize">{drugName}</h3>
            </div>
          </div>
          <CategoryBadge category={category} />
        </div>

        {/* Score bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/40 mb-1.5">
            <span>Suitability Score</span>
            <span>/ 100</span>
          </div>
          <ScoreBar score={suitabilityScore} category={category} />
        </div>

        {/* PGx flags (non-critical) */}
        {pharmacogenomicFlags.filter((f) => !f.includes("⚠️")).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {pharmacogenomicFlags.filter((f) => !f.includes("⚠️")).map((f, i) => (
              <FlagPill key={i} text={f} variant="pgx" />
            ))}
          </div>
        )}

        {/* Top reasons (first 2 always visible) */}
        <div className="space-y-1.5 mb-3">
          {reasons.slice(0, 2).map((r, i) => (
            <p key={i} className="text-white/60 text-sm flex gap-2">
              <span className="text-white/20 flex-shrink-0 mt-0.5">›</span>
              <span>{r}</span>
            </p>
          ))}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors group"
        >
          <span>Why this?</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
            {reasons.length > 2 && (
              <div>
                <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Additional Reasoning</p>
                <div className="space-y-1.5">
                  {reasons.slice(2).map((r, i) => (
                    <p key={i} className="text-white/50 text-sm flex gap-2">
                      <span className="text-white/20 flex-shrink-0">›</span>
                      <span>{r}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {genomicFlags.length > 0 && (
              <div>
                <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Genomic Flags</p>
                <div className="flex flex-wrap gap-1.5">
                  {genomicFlags.map((f, i) => (
                    <FlagPill key={i} text={f} variant="genomic" />
                  ))}
                </div>
              </div>
            )}

            {biomarkerFlags.length > 0 && (
              <div>
                <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Biomarker Flags</p>
                <div className="flex flex-wrap gap-1.5">
                  {biomarkerFlags.map((f, i) => (
                    <FlagPill key={i} text={f} variant="biomarker" />
                  ))}
                </div>
              </div>
            )}

            {evidenceTags.length > 0 && (
              <div>
                <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Evidence</p>
                <div className="flex flex-wrap gap-1.5">
                  {evidenceTags.map((t, i) => (
                    <FlagPill key={i} text={t} variant="evidence" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
