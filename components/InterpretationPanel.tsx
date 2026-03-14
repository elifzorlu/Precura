import { PatientInput } from "@/lib/types";

interface InterpretationPanelProps {
  input: PatientInput;
}

function PanelRow({ label, value, note, actualValue }: { label: string; value: string; note?: string; actualValue?: { value: string; unit: string } }) {
  const valueColor =
    value.toLowerCase().includes("poor") || value.toLowerCase().includes("high risk")
      ? "text-red-300"
      : value.toLowerCase().includes("intermediate") || value.toLowerCase().includes("medium") || value.toLowerCase().includes("high")
      ? "text-amber-300"
      : value.toLowerCase().includes("preferred") || value.toLowerCase().includes("ultrarapid") || value.toLowerCase().includes("positive")
      ? "text-cyan-300"
      : "text-emerald-300";

  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-white/50 text-sm">{label}</span>
      <div className="text-right">
        {actualValue ? (
          <>
            <span className="text-sm font-medium text-white">
              {actualValue.value} {actualValue.unit}
            </span>
            <span className={`text-xs ml-1.5 ${valueColor}`}>({value})</span>
          </>
        ) : (
          <span className={`text-sm font-medium ${valueColor}`}>{value}</span>
        )}
        {note && <p className="text-white/30 text-xs mt-0.5">{note}</p>}
      </div>
    </div>
  );
}

export default function InterpretationPanel({ input }: InterpretationPanelProps) {
  const pgxEntries = Object.entries(input.pharmacogenomicMarkers);
  const genomicEntries = Object.entries(input.genomicMarkers);
  const biomarkerEntries = Object.entries(input.biomarkers);
  const labValues = input.labValues ?? {};
  const symptoms = input.symptoms ?? [];

  const pgxNotes: Record<string, string> = {
    cyp2c19: "Metabolizes clopidogrel, PPIs, and other drugs",
    cyp2d6: "Converts tamoxifen → active endoxifen",
    slco1b1: "Hepatic statin transporter",
    cyp2c9: "Warfarin, NSAIDs metabolism",
  };

  const genomicNotes: Record<string, string> = {
    her2: "HER2 overexpression drives targeted therapy eligibility",
    er: "Estrogen receptor status governs hormone therapy use",
  };

  const biomarkerNotes: Record<string, string> = {
    crp: "C-Reactive Protein — systemic inflammation",
    ldl: "Low-density lipoprotein — cardiovascular risk",
    ca153: "CA 15-3 — breast cancer tumor marker",
    inflammatory: "Composite inflammatory status",
    recovery: "Neurological recovery indicators",
  };

  return (
    <div className="space-y-4">
      {/* Symptoms */}
      {symptoms.length > 0 && (
        <div className="rounded-xl border border-white/5 bg-[#13131a] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-rose-400" />
            <h3 className="text-white/70 text-sm font-medium uppercase tracking-wider">Presenting Symptoms</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((s) => (
              <span
                key={s}
                className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-white/70"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pharmacogenomics */}
        {pgxEntries.length > 0 && (
          <div className="rounded-xl border border-white/5 bg-[#13131a] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <h3 className="text-white/70 text-sm font-medium uppercase tracking-wider">Pharmacogenomics</h3>
            </div>
            {pgxEntries.map(([key, val]) => (
              <PanelRow
                key={key}
                label={key.toUpperCase()}
                value={val.charAt(0).toUpperCase() + val.slice(1).replace("_", " ")}
                note={pgxNotes[key]}
              />
            ))}
          </div>
        )}

        {/* Genomics */}
        {genomicEntries.length > 0 && (
          <div className="rounded-xl border border-white/5 bg-[#13131a] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              <h3 className="text-white/70 text-sm font-medium uppercase tracking-wider">Genomic Markers</h3>
            </div>
            {genomicEntries.map(([key, val]) => (
              <PanelRow
                key={key}
                label={key.toUpperCase()}
                value={val.charAt(0).toUpperCase() + val.slice(1)}
                note={genomicNotes[key]}
              />
            ))}
          </div>
        )}

        {/* Biomarkers */}
        {biomarkerEntries.length > 0 && (
          <div className="rounded-xl border border-white/5 bg-[#13131a] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <h3 className="text-white/70 text-sm font-medium uppercase tracking-wider">Biomarkers / Proteomic</h3>
            </div>
            {biomarkerEntries.map(([key, val]) => (
              <PanelRow
                key={key}
                label={key.toUpperCase().replace(/_/g, " ")}
                value={val.charAt(0).toUpperCase() + val.slice(1)}
                actualValue={labValues[key]}
                note={biomarkerNotes[key]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
