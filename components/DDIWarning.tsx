import { DrugInteraction } from "@/lib/inference/interactions";

interface DDIWarningProps {
  interactions: DrugInteraction[];
}

const SEVERITY_STYLES = {
  major: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    badge: "bg-red-500/15 border-red-500/30 text-red-400",
    icon: "⚠️",
    label: "MAJOR",
  },
  moderate: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    badge: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    icon: "⚡",
    label: "MODERATE",
  },
  minor: {
    border: "border-white/10",
    bg: "bg-white/[0.02]",
    badge: "bg-white/10 border-white/20 text-white/50",
    icon: "ℹ️",
    label: "MINOR",
  },
};

export default function DDIWarning({ interactions }: DDIWarningProps) {
  if (interactions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider">
          Drug–Drug Interactions ({interactions.length})
        </h3>
      </div>

      {interactions.map((interaction, i) => {
        const style = SEVERITY_STYLES[interaction.severity];
        return (
          <div
            key={i}
            className={`rounded-xl border ${style.border} ${style.bg} p-4 print:border-gray-300`}
          >
            <div className="flex items-start gap-3">
              <span className="text-base shrink-0 mt-0.5">{style.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-white font-semibold text-sm">
                    {interaction.drug1} + {interaction.drug2}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded border text-xs font-bold tracking-wider ${style.badge}`}
                  >
                    {style.label}
                  </span>
                </div>
                <p className="text-white/60 text-xs mb-1">
                  <span className="text-white/30">Mechanism: </span>
                  {interaction.mechanism}
                </p>
                <p className="text-white/60 text-xs mb-2">
                  <span className="text-white/30">Effect: </span>
                  {interaction.effect}
                </p>
                <div className="flex items-start gap-1.5">
                  <span className="text-cyan-500 text-xs shrink-0 mt-0.5">→</span>
                  <p className="text-cyan-400/80 text-xs">{interaction.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
