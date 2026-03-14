"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PatientInput } from "@/lib/types";
import { DISEASE_CONFIGS } from "@/lib/config/diseases";
import { buildMultiDiseaseResultFromSelected } from "@/lib/inference/engine";
import { parseVcf, ParsedVcfResult } from "@/lib/vcf/parser";

// ── Types ──────────────────────────────────────────────────────────────────

interface IrisPatientSummary {
  id: string;
  label: string;
  description: string;
  pgxSummary: Record<string, string>;
}

interface SelectedDisease {
  diseaseDomain: string;
  conditionSubtype?: string;
}

const ACTIVE_DISEASES = DISEASE_CONFIGS.filter((d) => !d.isStub);

const SUBTYPE_CONFIGS: Record<string, { value: string; label: string }[]> = {
  cardiovascular: [
    { value: "hypertension", label: "Hypertension" },
    { value: "cad", label: "Coronary Artery Disease (CAD)" },
    { value: "atrial_fibrillation", label: "Atrial Fibrillation" },
  ],
  stroke: [
    { value: "ischemic", label: "Ischemic Stroke" },
    { value: "hemorrhagic", label: "Hemorrhagic Stroke" },
    { value: "tia", label: "TIA" },
  ],
};

type Step = "search" | "vcf" | "diseases";

// ── Sub-components ─────────────────────────────────────────────────────────

function PgxBadge({ gene, phenotype }: { gene: string; phenotype: string }) {
  const color =
    phenotype === "poor"
      ? "border-red-500/40 text-red-400 bg-red-500/10"
      : phenotype === "intermediate"
      ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
      : phenotype === "ultrarapid"
      ? "border-cyan-500/40 text-cyan-400 bg-cyan-500/10"
      : "border-white/10 text-white/40 bg-white/5";
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs font-mono border ${color}`}>
      {gene.toUpperCase()} {phenotype}
    </span>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "search", label: "1. Find Patient" },
    { id: "vcf",    label: "2. VCF Upload" },
    { id: "diseases", label: "3. Select Conditions" },
  ];
  return (
    <div className="flex items-center gap-1 mb-6">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-1">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              s.id === current
                ? "bg-cyan-600 text-white"
                : "bg-white/5 text-white/30"
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="text-white/20 text-xs">→</span>}
        </div>
      ))}
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────

export default function AddPatientModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("search");

  // Search
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<IrisPatientSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const [irisError, setIrisError] = useState<string | null>(null);

  // Loaded patient from IRIS
  const [loadedPatient, setLoadedPatient] = useState<{
    label: string;
    input: PatientInput;
    diseaseHistory: { diseaseDomain: string; conditionSubtype?: string }[];
  } | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  // VCF parsing state
  const [vcfResult, setVcfResult] = useState<ParsedVcfResult | null>(null);
  const [vcfFileName, setVcfFileName] = useState<string | null>(null);
  const [vcfParsing, setVcfParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Disease selection
  const [selectedDiseases, setSelectedDiseases] = useState<SelectedDisease[]>([]);
  const [generating, setGenerating] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced IRIS search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(search.trim()), 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Load all patients on mount
  useEffect(() => { runSearch(""); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function runSearch(term: string) {
    setSearching(true);
    setIrisError(null);
    try {
      const url = term
        ? `/api/iris/patients?search=${encodeURIComponent(term)}`
        : "/api/iris/patients";
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        setIrisError(data.detail ?? data.error);
        setSearchResults([]);
      } else {
        setSearchResults(data.patients ?? []);
      }
    } catch {
      setIrisError("Cannot reach IRIS. Is the container running?");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function handleSelectPatient(id: string) {
    setLoadingPatient(true);
    setIrisError(null);
    try {
      const res = await fetch(`/api/iris/patient/${id}`);
      const data = await res.json();
      if (data.error) {
        setIrisError(data.detail ?? data.error);
      } else {
        setLoadedPatient({
          label: data.label,
          input: data.patientInput,
          diseaseHistory: data.diseaseHistory ?? [],
        });
        setVcfResult(null);
        setVcfFileName(null);
        // Pre-populate diseases from IRIS history
        setSelectedDiseases(data.diseaseHistory ?? []);
        setStep("vcf");
      }
    } catch {
      setIrisError("Failed to load patient data from IRIS.");
    } finally {
      setLoadingPatient(false);
    }
  }

  // ── VCF handling ──────────────────────────────────────────────────────────

  function handleVcfFile(file: File) {
    setVcfParsing(true);
    setVcfFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const result = parseVcf(text);
        setVcfResult(result);
      } catch {
        setVcfResult(null);
      } finally {
        setVcfParsing(false);
      }
    };
    reader.readAsText(file);
  }

  /** Merge VCF-derived PGx markers into the loaded patient input (VCF takes precedence). */
  function getMergedInput(): PatientInput {
    if (!loadedPatient) throw new Error("No patient loaded");
    if (!vcfResult) return loadedPatient.input;
    return {
      ...loadedPatient.input,
      pharmacogenomicMarkers: {
        ...loadedPatient.input.pharmacogenomicMarkers,
        ...vcfResult.pharmacogenomicMarkers,
      },
    };
  }

  function handleProceedFromVcf() {
    setStep("diseases");
  }

  // ── Disease selection ──────────────────────────────────────────────────────

  function toggleDisease(domain: string) {
    setSelectedDiseases((prev) => {
      const exists = prev.find((d) => d.diseaseDomain === domain);
      if (exists) return prev.filter((d) => d.diseaseDomain !== domain);
      const defaultSubtype = SUBTYPE_CONFIGS[domain]?.[0]?.value;
      return [...prev, { diseaseDomain: domain, conditionSubtype: defaultSubtype }];
    });
  }

  function setSubtype(domain: string, subtype: string) {
    setSelectedDiseases((prev) =>
      prev.map((d) =>
        d.diseaseDomain === domain ? { ...d, conditionSubtype: subtype } : d
      )
    );
  }

  function handleGenerate() {
    if (!loadedPatient || selectedDiseases.length === 0) return;
    setGenerating(true);
    const mergedInput = getMergedInput();
    const result = buildMultiDiseaseResultFromSelected(
      mergedInput,
      loadedPatient.label,
      selectedDiseases
    );
    localStorage.setItem("precura_result", JSON.stringify(result));
    router.push("/results");
  }

  // The effective PGx markers to display (post-VCF merge)
  const effectivePgx = vcfResult
    ? { ...loadedPatient?.input.pharmacogenomicMarkers, ...vcfResult.pharmacogenomicMarkers }
    : loadedPatient?.input.pharmacogenomicMarkers ?? {};

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0e0e16] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-white font-bold text-lg">Add Patient</h2>
            <p className="text-white/40 text-xs mt-0.5">
              {step === "search" && "Search InterSystems IRIS patient database"}
              {step === "vcf" && `${loadedPatient?.label} — upload genomic VCF`}
              {step === "diseases" && `${loadedPatient?.label} — select conditions`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <StepIndicator current={step} />

          {/* ── Step 1: IRIS Search ── */}
          {step === "search" && (
            <div className="space-y-5">
              {irisError ? (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                  <p className="text-red-300 text-sm font-semibold mb-1">IRIS Unavailable</p>
                  <p className="text-red-300/70 text-xs leading-relaxed">{irisError}</p>
                  <p className="text-white/30 text-xs mt-2">
                    Start the container:{" "}
                    <code className="font-mono text-white/50">docker start iris-comm</code>
                    {", then run "}
                    <code className="font-mono text-white/50">python seed_iris.py</code>
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400/70 text-xs">IRIS connected</span>
                </div>
              )}

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by patient name…"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
              />

              {searching ? (
                <p className="text-white/30 text-sm text-center py-4">Searching IRIS…</p>
              ) : searchResults.length === 0 && !irisError ? (
                <p className="text-white/30 text-sm text-center py-4">No patients found.</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPatient(p.id)}
                      disabled={loadingPatient}
                      className="w-full text-left p-4 rounded-xl border border-white/10 bg-[#13131a] hover:border-cyan-500/30 hover:bg-cyan-500/[0.03] transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <span className="text-white font-semibold text-sm">{p.label}</span>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {Object.entries(p.pgxSummary).map(([gene, phenotype]) => (
                            <PgxBadge key={gene} gene={gene} phenotype={phenotype} />
                          ))}
                        </div>
                      </div>
                      <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
                        {p.description}
                      </p>
                      <p className="text-cyan-500 text-xs font-medium mt-2">
                        {loadingPatient ? "Loading…" : "Load patient →"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: VCF Upload ── */}
          {step === "vcf" && loadedPatient && (
            <div className="space-y-5">
              {/* Current PGx from IRIS */}
              <div className="rounded-xl border border-white/5 bg-[#13131a] p-4">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-3">
                  PGx from IRIS
                </p>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(loadedPatient.input.pharmacogenomicMarkers).length > 0 ? (
                    Object.entries(loadedPatient.input.pharmacogenomicMarkers).map(
                      ([gene, phenotype]) => (
                        <PgxBadge key={gene} gene={gene} phenotype={phenotype} />
                      )
                    )
                  ) : (
                    <p className="text-white/30 text-xs">No PGx data stored in IRIS for this patient.</p>
                  )}
                </div>
              </div>

              {/* VCF upload */}
              <div>
                <p className="text-white/60 text-sm font-medium mb-1">
                  Upload VCF file{" "}
                  <span className="text-white/30 font-normal">(optional)</span>
                </p>
                <p className="text-white/30 text-xs mb-4">
                  Upload a pharmacogenomics VCF to extract CYP2C19, CYP2D6, and SLCO1B1
                  genotypes. Parsed results override values from IRIS.
                </p>

                <div
                  className="relative border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-cyan-500/30 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) handleVcfFile(file);
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".vcf,.vcf.gz"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVcfFile(file);
                    }}
                  />
                  {vcfParsing ? (
                    <p className="text-white/50 text-sm">Parsing VCF…</p>
                  ) : vcfFileName ? (
                    <div>
                      <p className="text-cyan-400 text-sm font-medium">{vcfFileName}</p>
                      <p className="text-white/30 text-xs mt-1">Click to replace</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white/50 text-sm mb-1">
                        Drop VCF file here or click to browse
                      </p>
                      <p className="text-white/20 text-xs">
                        Supports VCF 4.x · CYP2C19, CYP2D6, SLCO1B1
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* VCF parse results */}
              {vcfResult && (
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.03] p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <p className="text-cyan-400/80 text-xs font-medium uppercase tracking-wider">
                      VCF Parsed — {vcfResult.linesScanned} variants scanned
                    </p>
                  </div>

                  {/* Detected variants */}
                  {vcfResult.detectedVariants.length > 0 ? (
                    <div>
                      <p className="text-white/40 text-xs mb-2">Detected PGx variants</p>
                      <div className="space-y-1">
                        {vcfResult.detectedVariants.map((v, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="font-mono text-white/50">{v.rsId}</span>
                            <span className="text-white/30">→</span>
                            <span className="text-white/70 font-medium">
                              {v.gene.toUpperCase()} {v.starAllele}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs ${
                                v.effect === "lof"
                                  ? "text-red-400 bg-red-500/10"
                                  : v.effect === "dec"
                                  ? "text-amber-400 bg-amber-500/10"
                                  : "text-cyan-400 bg-cyan-500/10"
                              }`}
                            >
                              {v.effect === "lof"
                                ? "loss-of-function"
                                : v.effect === "dec"
                                ? "decreased function"
                                : "gain-of-function"}
                            </span>
                            <span className="text-white/20">
                              ({v.altCount === 1 ? "het" : "hom"})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/40 text-xs">
                      No known PGx variants detected in this VCF.
                    </p>
                  )}

                  {/* Inferred phenotypes */}
                  <div>
                    <p className="text-white/40 text-xs mb-2">Inferred phenotypes (will override IRIS)</p>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(vcfResult.pharmacogenomicMarkers).map(([gene, phenotype]) => (
                        <PgxBadge key={gene} gene={gene} phenotype={phenotype} />
                      ))}
                    </div>
                  </div>

                  {/* Parsing notes */}
                  {vcfResult.parsingNotes.length > 0 && (
                    <div className="border-t border-white/5 pt-2">
                      {vcfResult.parsingNotes.map((note, i) => (
                        <p key={i} className="text-white/30 text-xs">{note}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Effective PGx summary */}
              {(vcfResult || Object.keys(loadedPatient.input.pharmacogenomicMarkers).length > 0) && (
                <div className="rounded-xl border border-white/5 bg-[#13131a] p-4">
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-2">
                    Effective PGx Profile
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(effectivePgx).map(([gene, phenotype]) => (
                      <PgxBadge key={gene} gene={gene} phenotype={phenotype} />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setStep("search")}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleProceedFromVcf}
                  className="flex-1 px-6 py-2.5 rounded-xl font-semibold text-sm bg-cyan-600 hover:bg-cyan-500 text-white transition-all"
                >
                  Continue to Conditions →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Disease selection ── */}
          {step === "diseases" && loadedPatient && (
            <div className="space-y-5">
              {/* Effective PGx + biomarker summary */}
              <div className="rounded-xl border border-white/5 bg-[#13131a] p-4 space-y-3">
                {Object.keys(effectivePgx).length > 0 && (
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-2">
                      PGx Profile
                      {vcfResult && (
                        <span className="ml-2 text-cyan-400/60 normal-case tracking-normal">
                          (VCF + IRIS)
                        </span>
                      )}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(effectivePgx).map(([gene, phenotype]) => (
                        <PgxBadge key={gene} gene={gene} phenotype={phenotype} />
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(loadedPatient.input.genomicMarkers).length > 0 && (
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-2">
                      Genomic Markers
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(loadedPatient.input.genomicMarkers).map(([k, v]) => (
                        <span
                          key={k}
                          className="px-2 py-0.5 rounded text-xs border border-violet-500/30 text-violet-300 bg-violet-500/10"
                        >
                          {k.toUpperCase()} {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(loadedPatient.input.biomarkers).length > 0 && (
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-2">
                      Lab Values (IRIS)
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(loadedPatient.input.biomarkers).map(([key, category]) => {
                        const lv = loadedPatient.input.labValues?.[key];
                        return (
                          <span
                            key={key}
                            className={`px-2 py-0.5 rounded text-xs border ${
                              category === "high" || category === "medium"
                                ? "border-amber-500/30 text-amber-300 bg-amber-500/10"
                                : "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
                            }`}
                          >
                            {key.toUpperCase()}
                            {lv ? `: ${lv.value} ${lv.unit}` : ` (${category})`}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Disease checkboxes */}
              <div>
                <p className="text-white/60 text-sm font-medium mb-1">
                  Select applicable conditions
                </p>
                <p className="text-white/30 text-xs mb-4">
                  Pre-filled from IRIS medical history — confirm or adjust before generating.
                </p>
                <div className="space-y-3">
                  {ACTIVE_DISEASES.map((disease) => {
                    const isSelected = !!selectedDiseases.find(
                      (d) => d.diseaseDomain === disease.id
                    );
                    const selectedEntry = selectedDiseases.find(
                      (d) => d.diseaseDomain === disease.id
                    );
                    const subtypes = SUBTYPE_CONFIGS[disease.id];

                    return (
                      <div
                        key={disease.id}
                        className={`rounded-xl border p-4 transition-all ${
                          isSelected
                            ? "border-cyan-500/40 bg-cyan-500/[0.05]"
                            : "border-white/10 bg-[#13131a]"
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDisease(disease.id)}
                            className="w-4 h-4 rounded accent-cyan-500"
                          />
                          <span className="text-xl">{disease.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium text-sm">{disease.label}</p>
                              {loadedPatient?.diseaseHistory.some(
                                (d) => d.diseaseDomain === disease.id
                              ) && (
                                <span className="px-1.5 py-0.5 rounded text-xs border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                                  from IRIS
                                </span>
                              )}
                            </div>
                            <p className="text-white/40 text-xs">{disease.description}</p>
                          </div>
                        </label>

                        {isSelected && subtypes && (
                          <div className="mt-3 ml-7">
                            <p className="text-white/40 text-xs mb-2">Subtype</p>
                            <div className="flex gap-2 flex-wrap">
                              {subtypes.map((st) => (
                                <button
                                  key={st.value}
                                  onClick={() => setSubtype(disease.id, st.value)}
                                  className={`px-3 py-1 rounded-lg text-xs border transition-all ${
                                    selectedEntry?.conditionSubtype === st.value
                                      ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                                      : "border-white/10 text-white/50 hover:border-white/20"
                                  }`}
                                >
                                  {st.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setStep("vcf")}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={selectedDiseases.length === 0 || generating}
                  className={`flex-1 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    selectedDiseases.length > 0 && !generating
                      ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                      : "bg-white/5 text-white/30 cursor-not-allowed"
                  }`}
                >
                  {generating
                    ? "Generating report…"
                    : `Generate Report (${selectedDiseases.length} condition${selectedDiseases.length !== 1 ? "s" : ""}) →`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
