import { NextRequest, NextResponse } from "next/server";

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
    const rows: Record<string, string>[] = data?.result?.content ?? [];

    // Fetch one PGx marker per patient for the preview badge
    const patients = await Promise.all(
      rows.map(async (row) => {
        const pgxData = await irisQuery(
          "SELECT Gene, Phenotype FROM SQLUser.PGxMarkers WHERE PatientID = ?",
          [row.PatientID]
        );
        const pgx: Record<string, string> = {};
        for (const r of pgxData?.result?.content ?? []) {
          pgx[r.Gene] = r.Phenotype;
        }
        return {
          id: row.PatientID,
          label: row.PatientLabel,
          description: row.Description,
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
