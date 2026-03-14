"use client";
import { SamplePatient } from "@/lib/types";

interface SamplePatientPickerProps {
  patients: SamplePatient[];
  onSelect: (patient: SamplePatient) => void;
}

export default function SamplePatientPicker({ patients, onSelect }: SamplePatientPickerProps) {
  if (patients.length === 0) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-white/40 text-sm">Quick load:</span>
      {patients.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-150"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-white/30 group-hover:text-cyan-400 transition-colors">
            <path d="M8 1a3 3 0 100 6A3 3 0 008 1zM3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z" fill="currentColor"/>
          </svg>
          <span className="text-white/60 group-hover:text-white/90 text-xs font-medium transition-colors">{p.label}</span>
        </button>
      ))}
    </div>
  );
}
