"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SAMPLE_PATIENTS } from "@/lib/data/samplePatients";
import { inferDiseases } from "@/lib/inference/diagnose";
import { buildMultiDiseaseResult } from "@/lib/inference/engine";
import { DISEASE_CONFIGS } from "@/lib/config/diseases";
import { SamplePatient } from "@/lib/types";
import AddPatientModal from "./AddPatientModal";

const stubDiseases = DISEASE_CONFIGS.filter((d) => d.isStub);

export default function PatientPicker() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const selectedPatient: SamplePatient | null =
    SAMPLE_PATIENTS.find((p) => p.id === selectedId) ?? null;

  const inferredDiseases = selectedPatient
    ? inferDiseases(selectedPatient.input)
    : [];

  function handleViewReport(patient: SamplePatient) {
    setLoading(true);
    const result = buildMultiDiseaseResult(patient.input, patient.label);
    localStorage.setItem("precura_result", JSON.stringify(result));
    router.push("/results");
  }

  return (
    <section id="patients" className="px-6 py-20 border-t border-white/5">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Patient Registry</p>
          <h2 className="text-3xl font-bold text-white">Select a patient.</h2>
          <p className="text-white/40 text-base mt-3 max-w-xl mx-auto">
            Each patient's genomic, proteomic, and symptom data is analyzed to infer their
            conditions and generate a pharmacogenomic treatment report.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.35)]"
            >
              + Load Patient from IRIS
            </button>
          </div>
        </div>

        {/* Patient cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SAMPLE_PATIENTS.map((patient) => {
            const isSelected = selectedId === patient.id;
            const pgxKeys = Object.keys(patient.input.pharmacogenomicMarkers);
            return (
              <button
                key={patient.id}
                onClick={() => setSelectedId(isSelected ? null : patient.id)}
                className={`text-left p-5 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? "border-cyan-500/50 bg-cyan-500/[0.06]"
                    : "border-white/10 bg-[#13131a] hover:border-cyan-500/30 hover:bg-cyan-500/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-white font-semibold text-sm">{patient.label}</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {pgxKeys.map((k) => (
                      <span
                        key={k}
                        className={`px-1.5 py-0.5 rounded text-xs font-mono border ${
                          patient.input.pharmacogenomicMarkers[k] === "poor"
                            ? "border-red-500/40 text-red-400 bg-red-500/10"
                            : patient.input.pharmacogenomicMarkers[k] === "intermediate"
                            ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                            : "border-white/10 text-white/40 bg-white/5"
                        }`}
                      >
                        {k.toUpperCase()} {patient.input.pharmacogenomicMarkers[k]}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-white/40 text-xs leading-relaxed mb-3">{patient.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {patient.input.symptoms.slice(0, 2).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-xs border border-white/10 bg-white/5 text-white/40">
                      {s}
                    </span>
                  ))}
                  {patient.input.symptoms.length > 2 && (
                    <span className="text-white/30 text-xs">+{patient.input.symptoms.length - 2} more</span>
                  )}
                </div>
                <div className="mt-3 text-cyan-500 text-xs font-medium">
                  {isSelected ? "↑ Collapse" : "Select patient →"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Inferred conditions panel */}
        {selectedPatient && (
          <div className="mt-4 rounded-xl border border-cyan-500/20 bg-[#0d1117] p-5">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">
              Inferred Conditions — {selectedPatient.label}
            </p>
            <p className="text-white/50 text-xs mb-5">
              Based on presenting symptoms, genomic markers, and biomarker profile.
            </p>

            {inferredDiseases.length === 0 ? (
              <p className="text-white/30 text-sm">No conditions could be inferred from this profile.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
                {inferredDiseases.map(({ diseaseDomain, conditionSubtype }) => {
                  const config = DISEASE_CONFIGS.find((d) => d.id === diseaseDomain);
                  if (!config) return null;
                  const subtypeLabel = config.requiredInputs
                    .find((f) => f.key === "conditionSubtype")
                    ?.options.find((o) => o.value === conditionSubtype)?.label;

                  return (
                    <div
                      key={diseaseDomain}
                      className="p-4 rounded-lg border border-white/10 bg-[#13131a] flex items-center gap-3"
                    >
                      <span className="text-2xl">{config.icon}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{config.label}</p>
                        {subtypeLabel && (
                          <p className="text-cyan-400/70 text-xs mt-0.5">{subtypeLabel}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => handleViewReport(selectedPatient)}
              disabled={loading || inferredDiseases.length === 0}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                !loading && inferredDiseases.length > 0
                  ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.35)]"
                  : "bg-white/5 text-white/30 cursor-not-allowed"
              }`}
            >
              {loading ? "Generating report…" : "View Full Pharmacogenomic Report →"}
            </button>
          </div>
        )}

        {/* Coming soon stubs */}
        {stubDiseases.length > 0 && (
          <div className="mt-8">
            <p className="text-white/20 text-xs uppercase tracking-widest mb-3">Coming Soon</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stubDiseases.map((d) => (
                <div
                  key={d.id}
                  className="relative p-5 rounded-xl border border-white/5 bg-[#13131a] opacity-40"
                >
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30 text-xs">
                    Coming Soon
                  </div>
                  <div className="text-3xl mb-3">{d.icon}</div>
                  <h3 className="text-white font-semibold text-sm mb-1">{d.label}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{d.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {modalOpen && <AddPatientModal onClose={() => setModalOpen(false)} />}
    </section>
  );
}
