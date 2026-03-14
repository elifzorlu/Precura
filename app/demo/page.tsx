"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PatientInput, SamplePatient } from "@/lib/types";
import { DISEASE_CONFIGS } from "@/lib/config/diseases";
import { SAMPLE_PATIENTS } from "@/lib/data/samplePatients";
import { buildAnalysisResult } from "@/lib/inference/engine";
import DiseaseSelector from "@/components/DiseaseSelector";
import SamplePatientPicker from "@/components/SamplePatientPicker";
import DynamicPatientForm from "@/components/DynamicPatientForm";
import DisclaimerBanner from "@/components/DisclaimerBanner";

function emptyInput(diseaseId: string): PatientInput {
  return {
    diseaseDomain: diseaseId,
    conditionSubtype: undefined,
    genomicMarkers: {},
    pharmacogenomicMarkers: {},
    biomarkers: {},
    priorTreatmentFailure: false,
  };
}

export default function DemoPage() {
  const router = useRouter();
  const [selectedDisease, setSelectedDisease] = useState("cardiovascular");
  const [patientInput, setPatientInput] = useState<PatientInput>(emptyInput("cardiovascular"));
  const [isRunning, setIsRunning] = useState(false);

  const handleDiseaseSelect = useCallback((id: string) => {
    setSelectedDisease(id);
    setPatientInput(emptyInput(id));
  }, []);

  const handleSampleSelect = useCallback((patient: SamplePatient) => {
    setSelectedDisease(patient.input.diseaseDomain);
    setPatientInput(patient.input);
  }, []);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    try {
      const result = buildAnalysisResult(patientInput);
      localStorage.setItem("precura_result", JSON.stringify(result));
      router.push("/results");
    } catch (err) {
      console.error(err);
      setIsRunning(false);
    }
  }, [patientInput, router]);

  const disease = DISEASE_CONFIGS.find((d) => d.id === selectedDisease);
  const samplePatients = SAMPLE_PATIENTS[selectedDisease] ?? [];

  const isValid = disease && !disease.isStub && (
    disease.requiredInputs
      .filter((f) => f.type !== "toggle" && f.key !== "priorTreatmentFailure")
      .every((field) => {
        if (field.key === "conditionSubtype") return !!patientInput.conditionSubtype;
        if (field.group === "genomic") return !!patientInput.genomicMarkers[field.key];
        if (field.group === "pharmacogenomic") return !!patientInput.pharmacogenomicMarkers[field.key];
        if (field.group === "biomarker") return !!patientInput.biomarkers[field.key];
        return true;
      })
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <DisclaimerBanner />

      <div className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Patient Analysis</h1>
          <p className="text-white/50">Select a disease domain, load a sample patient or enter values manually, then run analysis.</p>
        </div>

        {/* Disease selector */}
        <div className="mb-8">
          <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">1 · Select Disease Domain</h2>
          <DiseaseSelector
            diseases={DISEASE_CONFIGS}
            selected={selectedDisease}
            onSelect={handleDiseaseSelect}
          />
        </div>

        {disease && !disease.isStub && (
          <>
            {/* Sample patient picker */}
            {samplePatients.length > 0 && (
              <div className="mb-8 p-4 rounded-xl border border-white/5 bg-[#13131a]">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Sample Patients — click to auto-populate form</p>
                <SamplePatientPicker patients={samplePatients} onSelect={handleSampleSelect} />
                {samplePatients.map((p) => (
                  <div key={p.id} className="mt-2 first:mt-3">
                    {patientInput.diseaseDomain === p.input.diseaseDomain &&
                      JSON.stringify(patientInput) === JSON.stringify(p.input) && (
                        <div className="flex gap-2 items-start p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                          <span className="text-cyan-400 text-xs font-medium">{p.label}:</span>
                          <span className="text-white/50 text-xs">{p.description}</span>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}

            {/* Form */}
            <div className="mb-8">
              <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">2 · Patient Profile</h2>
              <div className="rounded-xl border border-white/5 bg-[#13131a] p-6">
                <DynamicPatientForm
                  disease={disease}
                  values={patientInput}
                  onChange={setPatientInput}
                />
              </div>
            </div>

            {/* Run button */}
            <div>
              <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">3 · Run Analysis</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleRun}
                  disabled={!isValid || isRunning}
                  className={`px-8 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    isValid && !isRunning
                      ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.35)] cursor-pointer"
                      : "bg-white/5 text-white/30 cursor-not-allowed"
                  }`}
                >
                  {isRunning ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing…
                    </span>
                  ) : (
                    "Run Analysis →"
                  )}
                </button>
                {!isValid && (
                  <p className="text-white/30 text-sm">Complete all required fields to continue.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
