"use client";
import { PatientInput, DiseaseAnalysis } from "@/lib/types";
import { buildStandardOfCare, computeChanges, DrugCategoryChange } from "@/lib/inference/compare";
import { runInference, sortRecommendations } from "@/lib/inference/engine";

interface PGxImpactPanelProps {
  patientInput: PatientInput;
  inferredDiseases: DiseaseAnalysis[];
}

function CategoryBadge({ cat }: { cat: "Preferred" | "Caution" | "Avoid" }) {
  const styles = {
    Preferred: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    Caution: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    Avoid: "text-red-400 border-red-500/30 bg-red-500/10",
  };
  return (
    <span className={`px-2 py-0.5 rounded border text-xs font-medium ${styles[cat]}`}>
      {cat}
    </span>
  );
}

function ChangeRow({ change }: { change: DrugCategoryChange }) {
  const icon =
    change.type === "harm-prevented" ? "🛡️" :
    change.type === "better-option" ? "✅" : "⬇️";

  const label =
    change.type === "harm-prevented" ? "Harm prevented" :
    change.type === "better-option" ? "Better option identified" : "Downgraded";

  const labelColor =
    change.type === "harm-prevented" ? "text-red-400" :
    change.type === "better-option" ? "text-emerald-400" : "text-amber-400";

  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <span className="text-lg shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-white font-semibold text-sm">{change.drugName}</span>
          <span className={`text-xs font-medium ${labelColor}`}>{label}</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-white/30 text-xs">Without PGx:</span>
          <CategoryBadge cat={change.standardCategory} />
          <span className="text-white/20 text-xs">→</span>
          <span className="text-white/30 text-xs">With PGx:</span>
          <CategoryBadge cat={change.pgxCategory} />
        </div>
        {change.pgxReason && (
          <p className="text-white/40 text-xs leading-relaxed">{change.pgxReason}</p>
        )}
      </div>
    </div>
  );
}

export default function PGxImpactPanel({ patientInput, inferredDiseases }: PGxImpactPanelProps) {
  const allChanges: { change: DrugCategoryChange; diseaseLabel: string; diseaseIcon: string }[] = [];

  for (const disease of inferredDiseases) {
    const diseaseInput: PatientInput = {
      ...patientInput,
      diseaseDomain: disease.diseaseDomain,
      conditionSubtype: disease.conditionSubtype,
    };
    const standard = buildStandardOfCare(diseaseInput);
    const changes = computeChanges(standard, disease.recommendations);
    for (const change of changes) {
      allChanges.push({ change, diseaseLabel: disease.diseaseLabel, diseaseIcon: disease.diseaseIcon });
    }
  }

  if (allChanges.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#13131a] p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🧬</span>
          <h3 className="text-white font-semibold text-sm">No changes from standard of care</h3>
        </div>
        <p className="text-white/40 text-xs">
          This patient's pharmacogenomic profile aligns with standard metabolizer assumptions. No drug switches or dose adjustments are indicated by genomic data.
        </p>
      </div>
    );
  }

  const harmsPreventedCount = allChanges.filter((c) => c.change.type === "harm-prevented").length;
  const betterOptionsCount = allChanges.filter((c) => c.change.type === "better-option").length;

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.03] p-5 print:border-gray-300 print:bg-white">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🧬</span>
            <h3 className="text-white font-bold text-base print:text-black">
              How Genomic Data Changed This Treatment Plan
            </h3>
          </div>
          <p className="text-white/40 text-xs print:text-gray-500">
            Compared against what a standard prescribing algorithm would recommend without pharmacogenomic data.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {harmsPreventedCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-red-400 text-lg font-bold leading-none">{harmsPreventedCount}</p>
              <p className="text-red-400/60 text-xs mt-0.5">harm{harmsPreventedCount > 1 ? "s" : ""} prevented</p>
            </div>
          )}
          {betterOptionsCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-emerald-400 text-lg font-bold leading-none">{betterOptionsCount}</p>
              <p className="text-emerald-400/60 text-xs mt-0.5">better option{betterOptionsCount > 1 ? "s" : ""}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        {allChanges.map(({ change, diseaseIcon }, i) => (
          <div key={`${change.drugName}-${i}`}>
            <ChangeRow change={change} />
          </div>
        ))}
      </div>
    </div>
  );
}
