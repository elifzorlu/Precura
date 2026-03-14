"use client";
import { DiseaseConfig } from "@/lib/types";

interface DiseaseSelectorProps {
  diseases: DiseaseConfig[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function DiseaseSelector({ diseases, selected, onSelect }: DiseaseSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {diseases.map((disease) => (
        <button
          key={disease.id}
          onClick={() => !disease.isStub && onSelect(disease.id)}
          disabled={disease.isStub}
          className={`relative text-left p-4 rounded-xl border transition-all duration-200 ${
            disease.isStub
              ? "border-white/5 bg-[#13131a] opacity-50 cursor-not-allowed"
              : selected === disease.id
              ? "border-cyan-500/40 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.08)]"
              : "border-white/10 bg-[#13131a] hover:border-white/20 hover:bg-white/[0.03] cursor-pointer"
          }`}
        >
          {disease.isStub && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" className="text-white/30">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"/>
              </svg>
              <span className="text-white/30 text-xs">Soon</span>
            </div>
          )}
          {selected === disease.id && !disease.isStub && (
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}

          <div className="text-2xl mb-2">{disease.icon}</div>
          <h3 className="text-white font-semibold text-sm mb-1">{disease.label}</h3>
          <p className="text-white/40 text-xs leading-relaxed">{disease.description}</p>
        </button>
      ))}
    </div>
  );
}
