import { NextRequest, NextResponse } from "next/server";
import { PatientInput } from "@/lib/types";

const IRIS_URL = "http://localhost:52773/api/atelier/v1/USER/action/query";
const IRIS_AUTH = "Basic " + Buffer.from("demo:demo").toString("base64");

async function irisQuery(query: string, parameters: (string | number)[] = []) {
  const res = await fetch(IRIS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: IRIS_AUTH },
    body: JSON.stringify({ query, parameters }),
  });
  if (!res.ok) throw new Error(`IRIS HTTP ${res.status}`);
  return res.json();
}

/** Normalize a row — IRIS may return column names in any case. */
function norm(row: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k.toLowerCase()] = String(v ?? "");
  }
  return out;
}

/**
 * GET /api/iris/patient/[id]
 * Returns the full PatientInput + disease history for a given patient ID.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 1. Base patient record
    const baseData = await irisQuery(
      "SELECT PatientID, PatientLabel, PriorTreatmentFailure FROM SQLUser.Patients WHERE PatientID = ?",
      [id]
    );
    const baseRaw = baseData?.result?.content?.[0];
    if (!baseRaw) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    const base = norm(baseRaw);

    // 2. Symptoms
    const sympData = await irisQuery(
      "SELECT Symptom FROM SQLUser.PatientSymptoms WHERE PatientID = ?",
      [id]
    );
    const symptoms: string[] = (sympData?.result?.content ?? []).map(
      (r: Record<string, unknown>) => norm(r).symptom
    );

    // 3. PGx markers
    const pgxData = await irisQuery(
      "SELECT Gene, Phenotype FROM SQLUser.PGxMarkers WHERE PatientID = ?",
      [id]
    );
    const pharmacogenomicMarkers: Record<string, string> = {};
    for (const r of pgxData?.result?.content ?? []) {
      const nr = norm(r);
      pharmacogenomicMarkers[nr.gene] = nr.phenotype;
    }

    // 4. Genomic markers (HER2, ER)
    const genData = await irisQuery(
      "SELECT MarkerKey, MarkerValue FROM SQLUser.GenomicMarkers WHERE PatientID = ?",
      [id]
    );
    const genomicMarkers: Record<string, string> = {};
    for (const r of genData?.result?.content ?? []) {
      const nr = norm(r);
      genomicMarkers[nr.markerkey] = nr.markervalue;
    }

    // 5. Lab values
    const labData = await irisQuery(
      "SELECT BiomarkerKey, Category, DisplayValue, Unit FROM SQLUser.LabValues WHERE PatientID = ?",
      [id]
    );
    const biomarkers: Record<string, string> = {};
    const labValues: Record<string, { value: string; unit: string }> = {};
    for (const r of labData?.result?.content ?? []) {
      const nr = norm(r);
      biomarkers[nr.biomarkerkey] = nr.category;
      if (nr.displayvalue) {
        labValues[nr.biomarkerkey] = { value: nr.displayvalue, unit: nr.unit };
      }
    }

    // 6. Disease history — pre-confirmed conditions from medical record
    const diseaseData = await irisQuery(
      "SELECT DiseaseDomain, ConditionSubtype FROM SQLUser.DiseaseHistory WHERE PatientID = ?",
      [id]
    );
    const diseaseHistory: { diseaseDomain: string; conditionSubtype?: string }[] = (
      diseaseData?.result?.content ?? []
    ).map((r: Record<string, unknown>) => {
      const nr = norm(r);
      return {
        diseaseDomain: nr.diseasedomain,
        conditionSubtype: nr.conditionsubtype || undefined,
      };
    });

    const patientInput: PatientInput = {
      symptoms,
      genomicMarkers,
      pharmacogenomicMarkers,
      biomarkers,
      labValues: Object.keys(labValues).length > 0 ? labValues : undefined,
      priorTreatmentFailure: base.priortreatmentfailure === "1",
    };

    return NextResponse.json({
      patientInput,
      label: base.patientlabel,
      diseaseHistory,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "IRIS unavailable", detail: msg },
      { status: 503 }
    );
  }
}
