"use client"

import { createContext, useContext, useState } from "react"
import { PatientInput } from "@/lib/types"

type PatientContextType = {
  patient: PatientInput | null
  setPatient: (data: PatientInput) => void
}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<PatientInput | null>(null)

  return (
    <PatientContext.Provider value={{ patient, setPatient }}>
      {children}
    </PatientContext.Provider>
  )
}

export function usePatient() {
  const context = useContext(PatientContext)
  if (!context) {
    throw new Error("usePatient must be used within PatientProvider")
  }
  return context
}