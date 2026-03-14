"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SamplePatient } from "@/lib/types";
import { DISEASE_CONFIGS } from "@/lib/config/diseases";
import { SAMPLE_PATIENTS } from "@/lib/data/samplePatients";
import { buildAnalysisResult } from "@/lib/inference/engine";
import DiseaseSelector from "@/components/DiseaseSelector";
import SamplePatientPicker from "@/components/SamplePatientPicker";
import DynamicPatientForm from "@/components/DynamicPatientForm";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import { usePatient, PatientSchema, PatientInput } from "@/context/PatientContext";
import { AnalysisResult } from "@/lib/types";

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
  const { setPatient } = usePatient();
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

    const parseResult = PatientSchema.safeParse(patientInput);
    if (!parseResult.success) {
      console.error(parseResult.error.format());
      setIsRunning(false);
      return;
    }

    const analysisResult: AnalysisResult = buildAnalysisResult(parseResult.data);
    setPatient({ input: parseResult.data, result: analysisResult });
    localStorage.setItem("precura_result", JSON.stringify(analysisResult));
    router.push("/results");
  }, [patientInput, router, setPatient]);

  const disease = DISEASE_CONFIGS.find((d) => d.id === selectedDisease);
  const samplePatients = SAMPLE_PATIENTS[selectedDisease] ?? [];
  const isValid = PatientSchema.safeParse(patientInput).success;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <DisclaimerBanner />
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        <h1 className="text-3xl font-bold text-white mb-2">Patient Analysis</h1>
        <p className="text-white/50 mb-10">Select a disease domain, load a sample patient or enter values manually, then run analysis.</p>

        <DiseaseSelector
          diseases={DISEASE_CONFIGS}
          selected={selectedDisease}
          onSelect={handleDiseaseSelect}
        />

        {disease && !disease.isStub && (
          <>
            {samplePatients.length > 0 && (
              <SamplePatientPicker patients={samplePatients} onSelect={handleSampleSelect} />
            )}
            <DynamicPatientForm
              disease={disease}
              values={patientInput}
              onChange={setPatientInput}
            />
            <button
              onClick={handleRun}
              disabled={!isValid || isRunning}
              className={`px-8 py-3.5 rounded-xl font-semibold text-sm ${
                isValid && !isRunning ? "bg-cyan-600 hover:bg-cyan-500" : "bg-white/5 text-white/30"
              }`}
            >
              {isRunning ? "Analyzing…" : "Run Analysis →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}