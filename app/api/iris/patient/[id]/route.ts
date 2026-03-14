import { NextRequest, NextResponse } from "next/server";
import { PatientInput } from "@/lib/types";

const IRIS_URL = "http://localhost:52773/api/sql/USER";
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

/**
 * GET /api/iris/patient/[id]
 * Returns the full PatientInput for a given patient ID.
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
    const base = baseData?.result?.content?.[0];
    if (!base) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // 2. Symptoms
    const sympData = await irisQuery(
      "SELECT Symptom FROM SQLUser.PatientSymptoms WHERE PatientID = ?",
      [id]
    );
    const symptoms: string[] = (sympData?.result?.content ?? []).map(
      (r: Record<string, string>) => r.Symptom
    );

    // 3. PGx markers
    const pgxData = await irisQuery(
      "SELECT Gene, Phenotype FROM SQLUser.PGxMarkers WHERE PatientID = ?",
      [id]
    );
    const pharmacogenomicMarkers: Record<string, string> = {};
    for (const r of pgxData?.result?.content ?? []) {
      pharmacogenomicMarkers[r.Gene] = r.Phenotype;
    }

    // 4. Genomic markers (HER2, ER)
    const genData = await irisQuery(
      "SELECT MarkerKey, MarkerValue FROM SQLUser.GenomicMarkers WHERE PatientID = ?",
      [id]
    );
    const genomicMarkers: Record<string, string> = {};
    for (const r of genData?.result?.content ?? []) {
      genomicMarkers[r.MarkerKey] = r.MarkerValue;
    }

    // 5. Lab values
    const labData = await irisQuery(
      "SELECT BiomarkerKey, Category, DisplayValue, Unit FROM SQLUser.LabValues WHERE PatientID = ?",
      [id]
    );
    const biomarkers: Record<string, string> = {};
    const labValues: Record<string, { value: string; unit: string }> = {};
    for (const r of labData?.result?.content ?? []) {
      biomarkers[r.BiomarkerKey] = r.Category;
      if (r.DisplayValue) {
        labValues[r.BiomarkerKey] = { value: r.DisplayValue, unit: r.Unit };
      }
    }

    const patientInput: PatientInput = {
      symptoms,
      genomicMarkers,
      pharmacogenomicMarkers,
      biomarkers,
      labValues: Object.keys(labValues).length > 0 ? labValues : undefined,
      priorTreatmentFailure: base.PriorTreatmentFailure === 1,
    };

    return NextResponse.json({
      patientInput,
      label: base.PatientLabel,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "IRIS unavailable", detail: msg },
      { status: 503 }
    );
  }
}
