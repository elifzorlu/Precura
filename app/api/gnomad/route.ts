import { NextRequest, NextResponse } from "next/server";

const GNOMAD_API = "https://gnomad.broadinstitute.org/api";

const POPULATION_LABELS: Record<string, string> = {
  afr: "African/Afr. American",
  amr: "Latino/Admixed American",
  asj: "Ashkenazi Jewish",
  eas: "East Asian",
  fin: "Finnish",
  mid: "Middle Eastern",
  nfe: "Non-Finnish European",
  sas: "South Asian",
};

/**
 * GET /api/gnomad?variantId=10-94762706-G-A&rsid=rs4244285
 *
 * Server-side proxy to the gnomAD GraphQL API (avoids browser CORS).
 * Queries gnomAD v4 for genome-wide allele frequencies by variant position.
 * Returns overall AF + per-population breakdown.
 */
export async function GET(req: NextRequest) {
  const variantId = req.nextUrl.searchParams.get("variantId");
  if (!variantId) {
    return NextResponse.json({ error: "variantId is required" }, { status: 400 });
  }

  const query = `
    {
      variant(variantId: "${variantId}", dataset: gnomad_r4) {
        rsids
        genome {
          ac
          an
          af
          populations {
            id
            ac
            an
            af
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(GNOMAD_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "gnomAD API error" }, { status: 502 });
    }

    const json = await res.json();
    const variant = json?.data?.variant;

    if (!variant?.genome) {
      return NextResponse.json({ error: "Variant not found in gnomAD" }, { status: 404 });
    }

    const genome = variant.genome;
    const overallAf: number = genome.af ?? 0;

    // Filter to main population groups and exclude those with no data
    const populations = (genome.populations ?? [])
      .filter((p: { id: string; af: number }) => POPULATION_LABELS[p.id] && p.af > 0)
      .map((p: { id: string; ac: number; an: number; af: number }) => ({
        id: p.id,
        label: POPULATION_LABELS[p.id] ?? p.id,
        af: p.af,
      }))
      .sort((a: { af: number }, b: { af: number }) => b.af - a.af);

    return NextResponse.json({
      variantId,
      overallAf,
      overallAc: genome.ac,
      overallAn: genome.an,
      populations,
      source: "live",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "gnomAD unavailable", detail: msg }, { status: 503 });
  }
}
