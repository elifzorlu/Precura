"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { z } from "zod";
import { AnalysisResult } from "@/lib/types";

// Zod schema matching your real form
export const PatientSchema = z.object({
  diseaseDomain: z.string(),
  conditionSubtype: z.string().optional(),
  genomicMarkers: z.record(z.string(), z.any()),
  pharmacogenomicMarkers: z.record(z.string(), z.any()),
  biomarkers: z.record(z.string(), z.any()),
  priorTreatmentFailure: z.boolean(),
});

export type PatientInput = z.infer<typeof PatientSchema>;

interface PatientContextType {
  patient: PatientInput | null;
  result: AnalysisResult | null;
  setPatient: (data: { input: PatientInput; result: AnalysisResult }) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patient, setPatientState] = useState<PatientInput | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const setPatient = (data: { input: PatientInput; result: AnalysisResult }) => {
    setPatientState(data.input);
    setResult(data.result);
  };

  return (
    <PatientContext.Provider value={{ patient, result, setPatient }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (!context) throw new Error("usePatient must be used within PatientProvider");
  return context;
}