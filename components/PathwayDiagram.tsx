interface PathwayDiagramProps {
  gene: "cyp2c19" | "cyp2d6" | "slco1b1";
  phenotype: string;
}

const PATHWAY_DATA = {
  cyp2c19: {
    title: "CYP2C19 Metabolic Pathway",
    drug: "Clopidogrel (prodrug)",
    enzyme: "CYP2C19",
    product: "Active thiol metabolite",
    effect: "P2Y12 platelet inhibition",
    outcome: "Antiplatelet protection",
    affectedDrugs: ["Clopidogrel", "Escitalopram", "Sertraline"],
    population: "~30% of patients carry loss-of-function alleles",
  },
  cyp2d6: {
    title: "CYP2D6 Metabolic Pathway",
    drug: "Tamoxifen (prodrug)",
    enzyme: "CYP2D6",
    product: "Endoxifen (active)",
    effect: "Estrogen receptor antagonism",
    outcome: "Breast cancer suppression",
    affectedDrugs: ["Tamoxifen", "Fluoxetine", "Venlafaxine", "Amitriptyline"],
    population: "~7–10% of Caucasians are poor metabolizers",
  },
  slco1b1: {
    title: "SLCO1B1 Transporter Pathway",
    drug: "Atorvastatin / Simvastatin",
    enzyme: "SLCO1B1 transporter",
    product: "Hepatic uptake",
    effect: "Intrahepatic statin concentration",
    outcome: "LDL reduction",
    affectedDrugs: ["Atorvastatin", "Simvastatin", "Rosuvastatin"],
    population: "~15–20% carry SLCO1B1*5 risk allele",
  },
};

export default function PathwayDiagram({ gene, phenotype }: PathwayDiagramProps) {
  const data = PATHWAY_DATA[gene];
  const isPoor = phenotype === "poor";
  const isImpaired = isPoor || phenotype === "intermediate" || phenotype === "high";
  const isUltrarapid = phenotype === "ultrarapid";

  const nodeColor = isImpaired ? "#ef4444" : isUltrarapid ? "#f59e0b" : "#22d3ee";
  const arrowColor = isImpaired ? "#ef444466" : isUltrarapid ? "#f59e0b66" : "#22d3ee66";
  const statusLabel = isImpaired
    ? isPoor ? "DEFICIENT — minimal product" : "REDUCED — partial product"
    : isUltrarapid
    ? "ULTRARAPID — accelerated metabolism"
    : "NORMAL — full product";

  return (
    <div className="rounded-xl border border-white/5 bg-[#13131a] p-5">
      <p className="text-white/50 text-xs uppercase tracking-widest mb-4">{data.title}</p>

      {/* Pathway flow */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Drug node */}
        <div className="flex flex-col items-center">
          <div className="px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-center">
            <p className="text-white/40 text-xs mb-0.5">Input</p>
            <p className="text-white text-xs font-medium">{data.drug}</p>
          </div>
        </div>

        {/* Arrow 1 */}
        <div className="flex flex-col items-center gap-1">
          <svg width="40" height="20" viewBox="0 0 40 20">
            <defs>
              <marker id={`arrow-${gene}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={nodeColor} />
              </marker>
            </defs>
            <line x1="4" y1="10" x2="34" y2="10" stroke={nodeColor} strokeWidth="1.5"
              markerEnd={`url(#arrow-${gene})`} strokeDasharray={isImpaired ? "4,3" : "none"} />
          </svg>
        </div>

        {/* Enzyme node */}
        <div className="flex flex-col items-center">
          <div
            className="px-3 py-2 rounded-lg border text-center"
            style={{ borderColor: `${nodeColor}55`, backgroundColor: `${nodeColor}11` }}
          >
            <p className="text-white/40 text-xs mb-0.5">Enzyme</p>
            <p className="text-xs font-bold font-mono" style={{ color: nodeColor }}>
              {data.enzyme}
            </p>
            <p className="text-xs mt-0.5" style={{ color: `${nodeColor}bb` }}>
              {statusLabel}
            </p>
          </div>
        </div>

        {/* Arrow 2 */}
        <div className="flex flex-col items-center">
          <svg width="40" height="20" viewBox="0 0 40 20">
            <defs>
              <marker id={`arrow2-${gene}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={isImpaired ? "#ef444466" : nodeColor} />
              </marker>
            </defs>
            <line x1="4" y1="10" x2="34" y2="10"
              stroke={isImpaired ? "#ef444466" : nodeColor} strokeWidth="1.5"
              markerEnd={`url(#arrow2-${gene})`}
              strokeDasharray={isImpaired ? "4,3" : "none"} />
          </svg>
        </div>

        {/* Product node */}
        <div className="flex flex-col items-center">
          <div
            className={`px-3 py-2 rounded-lg border text-center ${
              isImpaired ? "border-red-500/20 bg-red-500/5" : "border-emerald-500/20 bg-emerald-500/5"
            }`}
          >
            <p className="text-white/40 text-xs mb-0.5">Product</p>
            <p className={`text-xs font-medium ${isImpaired ? "text-red-400" : "text-emerald-400"}`}>
              {isImpaired ? `↓↓↓ ${data.product}` : data.product}
            </p>
          </div>
        </div>

        {/* Arrow 3 */}
        <div className="flex flex-col items-center">
          <svg width="40" height="20" viewBox="0 0 40 20">
            <defs>
              <marker id={`arrow3-${gene}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={isImpaired ? "#ef444466" : "#22d3ee"} />
              </marker>
            </defs>
            <line x1="4" y1="10" x2="34" y2="10"
              stroke={isImpaired ? "#ef444466" : "#22d3ee"} strokeWidth="1.5"
              markerEnd={`url(#arrow3-${gene})`}
              strokeDasharray={isImpaired ? "4,3" : "none"} />
          </svg>
        </div>

        {/* Outcome node */}
        <div className="flex flex-col items-center">
          <div
            className={`px-3 py-2 rounded-lg border text-center ${
              isImpaired ? "border-red-500/30 bg-red-500/10" : "border-cyan-500/20 bg-cyan-500/5"
            }`}
          >
            <p className="text-white/40 text-xs mb-0.5">Outcome</p>
            <p className={`text-xs font-semibold ${isImpaired ? "text-red-300" : "text-cyan-300"}`}>
              {isImpaired ? `❌ ${data.outcome} absent` : `✓ ${data.outcome}`}
            </p>
          </div>
        </div>
      </div>

      {/* Population stat */}
      <p className="text-white/25 text-xs mt-4">
        Population frequency — {data.population}
      </p>
    </div>
  );
}
