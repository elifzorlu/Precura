"use client";
import { DiseaseConfig, InputFieldConfig, PatientInput } from "@/lib/types";

interface DynamicPatientFormProps {
  disease: DiseaseConfig;
  values: PatientInput;
  onChange: (updated: PatientInput) => void;
}

function SelectField({ field, value, onChange }: { field: InputFieldConfig; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-white/70 text-sm font-medium mb-1.5">
        {field.label}
        {field.description && (
          <span className="ml-2 text-white/30 text-xs font-normal">— {field.description}</span>
        )}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0d0d14] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all appearance-none cursor-pointer"
      >
        <option value="" disabled>Select…</option>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleField({ field, value, onChange }: { field: InputFieldConfig; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02]">
      <div>
        <p className="text-white/70 text-sm font-medium">{field.label}</p>
        {field.description && <p className="text-white/30 text-xs">{field.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? "bg-cyan-600" : "bg-white/10"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

const GROUP_LABELS: Record<string, string> = {
  clinical: "Clinical",
  pharmacogenomic: "Pharmacogenomics",
  genomic: "Genomic Markers",
  biomarker: "Biomarkers",
};

const GROUP_COLORS: Record<string, string> = {
  clinical: "bg-white/5 text-white/40",
  pharmacogenomic: "bg-orange-500/10 text-orange-400",
  genomic: "bg-violet-500/10 text-violet-400",
  biomarker: "bg-blue-500/10 text-blue-400",
};

export default function DynamicPatientForm({ disease, values, onChange }: DynamicPatientFormProps) {
  const groups = ["clinical", "pharmacogenomic", "genomic", "biomarker"] as const;

  function updateField(field: InputFieldConfig, value: string | boolean) {
    const updated = { ...values };
    if (field.key === "conditionSubtype") {
      updated.conditionSubtype = value as string;
    } else if (field.key === "priorTreatmentFailure") {
      updated.priorTreatmentFailure = value as boolean;
    } else if (field.group === "genomic") {
      updated.genomicMarkers = { ...updated.genomicMarkers, [field.key]: value as string };
    } else if (field.group === "pharmacogenomic") {
      updated.pharmacogenomicMarkers = { ...updated.pharmacogenomicMarkers, [field.key]: value as string };
    } else if (field.group === "biomarker") {
      updated.biomarkers = { ...updated.biomarkers, [field.key]: value as string };
    }
    onChange(updated);
  }

  function getFieldValue(field: InputFieldConfig): string {
    if (field.key === "conditionSubtype") return values.conditionSubtype ?? "";
    if (field.group === "genomic") return values.genomicMarkers[field.key] ?? "";
    if (field.group === "pharmacogenomic") return values.pharmacogenomicMarkers[field.key] ?? "";
    if (field.group === "biomarker") return values.biomarkers[field.key] ?? "";
    return "";
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const fields = disease.requiredInputs.filter(
          (f) => f.group === group || (group === "clinical" && f.key === "priorTreatmentFailure")
        );
        // Avoid duplicating priorTreatmentFailure in biomarker group
        const filteredFields = group === "biomarker"
          ? fields.filter((f) => f.key !== "priorTreatmentFailure")
          : fields;

        if (filteredFields.length === 0) return null;

        return (
          <div key={group}>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium mb-3 ${GROUP_COLORS[group]}`}>
              {GROUP_LABELS[group]}
            </div>
            <div className="space-y-3">
              {filteredFields.map((field) => {
                if (field.type === "toggle") {
                  return (
                    <ToggleField
                      key={field.key}
                      field={field}
                      value={values.priorTreatmentFailure}
                      onChange={(v) => updateField(field, v)}
                    />
                  );
                }
                return (
                  <SelectField
                    key={field.key}
                    field={field}
                    value={getFieldValue(field)}
                    onChange={(v) => updateField(field, v)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
