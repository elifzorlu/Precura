import { NextRequest, NextResponse } from "next/server";

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

/** Normalize a row from IRIS — column names may come back in any case. */
function norm(row: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k.toLowerCase()] = String(v ?? "");
  }
  return out;
}

/**
 * GET /api/iris/patients?search=marcus
 * Returns a list of patients matching the search term (or all if no search).
 */
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";

  try {
    const query = search
      ? "SELECT PatientID, PatientLabel, Description FROM SQLUser.Patients WHERE LOWER(PatientLabel) LIKE ?"
      : "SELECT PatientID, PatientLabel, Description FROM SQLUser.Patients";
    const params = search ? [`%${search.toLowerCase()}%`] : [];

    const data = await irisQuery(query, params);
    const rows: Record<string, unknown>[] = data?.result?.content ?? [];

    const patients = await Promise.all(
      rows.map(async (rawRow) => {
        const row = norm(rawRow);
        const pgxData = await irisQuery(
          "SELECT Gene, Phenotype FROM SQLUser.PGxMarkers WHERE PatientID = ?",
          [row.patientid]
        );
        const pgx: Record<string, string> = {};
        for (const r of pgxData?.result?.content ?? []) {
          const nr = norm(r);
          pgx[nr.gene] = nr.phenotype;
        }
        return {
          id: row.patientid,
          label: row.patientlabel,
          description: row.description,
          pgxSummary: pgx,
        };
      })
    );

    return NextResponse.json({ patients });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "IRIS unavailable", detail: msg },
      { status: 503 }
    );
  }
}
