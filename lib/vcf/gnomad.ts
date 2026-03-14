/**
 * gnomAD population frequency integration.
 *
 * For each PGx variant we handle, this module provides:
 *  1. Pre-curated reference frequencies from gnomAD v4 (GRCh38) — used as
 *     immediate/fallback data so the UI is never blocked on network.
 *  2. A live-fetch helper that queries our /api/gnomad proxy, which calls the
 *     gnomAD GraphQL API, and merges fresh data over the reference values.
 *
 * Population IDs follow gnomAD v4 labels:
 *   afr = African/African American
 *   amr = Latino/Admixed American
 *   asj = Ashkenazi Jewish
 *   eas = East Asian
 *   fin = Finnish
 *   mid = Middle Eastern
 *   nfe = Non-Finnish European
 *   sas = South Asian
 */

export interface PopFreq {
  id: string;
  label: string;
  af: number; // allele frequency 0–1
}

export interface GnomadVariantInfo {
  rsId: string;
  gene: string;
  starAllele: string;
  /** gnomAD v4 variant ID: chrom-pos-ref-alt (GRCh38, no "chr" prefix) */
  gnomadId: string;
  overallAf: number;
  populations: PopFreq[];
  /** Plain-English clinical context for this frequency pattern */
  populationNote: string;
  source: "reference" | "live"; // did data come from API or pre-cached?
}

// ── Pre-curated reference frequencies (gnomAD v4, GRCh38) ─────────────────
// Sources: gnomAD v4.1 browser, CPIC guidelines, PharmVar database.

const REFERENCE_DATA: Record<string, Omit<GnomadVariantInfo, "source">> = {
  rs4244285: {
    rsId: "rs4244285",
    gene: "cyp2c19",
    starAllele: "*2",
    gnomadId: "10-94762706-G-A",
    overallAf: 0.143,
    populations: [
      { id: "afr", label: "African/Afr. American", af: 0.170 },
      { id: "amr", label: "Latino/Admixed American", af: 0.114 },
      { id: "asj", label: "Ashkenazi Jewish", af: 0.125 },
      { id: "eas", label: "East Asian", af: 0.295 },
      { id: "fin", label: "Finnish", af: 0.145 },
      { id: "mid", label: "Middle Eastern", af: 0.118 },
      { id: "nfe", label: "Non-Finnish European", af: 0.138 },
      { id: "sas", label: "South Asian", af: 0.153 },
    ],
    populationNote:
      "CYP2C19*2 (loss-of-function) is notably more common in East Asian populations (~30%) vs. European (~14%). Prevalence directly predicts poor metabolizer frequency.",
  },
  rs4986893: {
    rsId: "rs4986893",
    gene: "cyp2c19",
    starAllele: "*3",
    gnomadId: "10-94781858-G-A",
    overallAf: 0.008,
    populations: [
      { id: "afr", label: "African/Afr. American", af: 0.001 },
      { id: "amr", label: "Latino/Admixed American", af: 0.002 },
      { id: "asj", label: "Ashkenazi Jewish", af: 0.003 },
      { id: "eas", label: "East Asian", af: 0.052 },
      { id: "fin", label: "Finnish", af: 0.001 },
      { id: "mid", label: "Middle Eastern", af: 0.001 },
      { id: "nfe", label: "Non-Finnish European", af: 0.001 },
      { id: "sas", label: "South Asian", af: 0.003 },
    ],
    populationNote:
      "CYP2C19*3 is rare in most populations but reaches ~5% in East Asian populations. Combined with *2, drives elevated poor-metabolizer rates in East Asian patients.",
  },
  rs12248560: {
    rsId: "rs12248560",
    gene: "cyp2c19",
    starAllele: "*17",
    gnomadId: "10-94761900-C-T",
    overallAf: 0.207,
    populations: [
      { id: "afr", label: "African/Afr. American", af: 0.165 },
      { id: "amr", label: "Latino/Admixed American", af: 0.144 },
      { id: "asj", label: "Ashkenazi Jewish", af: 0.210 },
      { id: "eas", label: "East Asian", af: 0.025 },
      { id: "fin", label: "Finnish", af: 0.248 },
      { id: "mid", label: "Middle Eastern", af: 0.198 },
      { id: "nfe", label: "Non-Finnish European", af: 0.238 },
      { id: "sas", label: "South Asian", af: 0.161 },
    ],
    populationNote:
      "CYP2C19*17 (gain-of-function) is common in European and African populations but rare in East Asian (~2.5%). Ultrarapid metabolizers on this allele may under-respond to standard doses.",
  },
  rs3892097: {
    rsId: "rs3892097",
    gene: "cyp2d6",
    starAllele: "*4",
    gnomadId: "22-42524947-G-A",
    overallAf: 0.097,
    populations: [
      { id: "afr", label: "African/Afr. American", af: 0.012 },
      { id: "amr", label: "Latino/Admixed American", af: 0.049 },
      { id: "asj", label: "Ashkenazi Jewish", af: 0.148 },
      { id: "eas", label: "East Asian", af: 0.005 },
      { id: "fin", label: "Finnish", af: 0.167 },
      { id: "mid", label: "Middle Eastern", af: 0.074 },
      { id: "nfe", label: "Non-Finnish European", af: 0.163 },
      { id: "sas", label: "South Asian", af: 0.048 },
    ],
    populationNote:
      "CYP2D6*4 is the most common loss-of-function allele in European populations (~16%), but rare in East Asian and African populations. Critical for tamoxifen and antidepressant dosing.",
  },
  rs35742686: {
    rsId: "rs35742686",
    gene: "cyp2d6",
    starAllele: "*3",
    gnomadId: "22-42523805-AG-A",
    overallAf: 0.013,
    populations: [
      { id: "afr", label: "African/Afr. American", af: 0.001 },
      { id: "amr", label: "Latino/Admixed American", af: 0.006 },
      { id: "asj", label: "Ashkenazi Jewish", af: 0.017 },
      { id: "eas", label: "East Asian", af: 0.001 },
      { id: "fin", label: "Finnish", af: 0.015 },
      { id: "mid", label: "Middle Eastern", af: 0.009 },
      { id: "nfe", label: "Non-Finnish European", af: 0.018 },
      { id: "sas", label: "South Asian", af: 0.007 },
    ],
    populationNote:
      "CYP2D6*3 (1-bp deletion) is rare across all populations. When combined with *4, drives poor metabolizer status.",
  },
  rs1065852: {
    rsId: "rs1065852",
    gene: "cyp2d6",
    starAllele: "*10",
    gnomadId: "22-42526669-C-T",
    overallAf: 0.169,
    populations: [
      { id: "afr", label: "African/Afr. American", af: 0.043 },
      { id: "amr", label: "Latino/Admixed American", af: 0.126 },
      { id: "asj", label: "Ashkenazi Jewish", af: 0.049 },
      { id: "eas", label: "East Asian", af: 0.511 },
      { id: "fin", label: "Finnish", af: 0.039 },
      { id: "mid", label: "Middle Eastern", af: 0.072 },
      { id: "nfe", label: "Non-Finnish European", af: 0.042 },
      { id: "sas", label: "South Asian", af: 0.356 },
    ],
    populationNote:
      "CYP2D6*10 (decreased function) is the dominant CYP2D6 variant in East Asian (~51%) and South Asian (~36%) populations. A major contributor to intermediate metabolizer status in these groups.",
  },
  rs4149056: {
    rsId: "rs4149056",
    gene: "slco1b1",
    starAllele: "*5",
    gnomadId: "12-21239854-T-C",
    overallAf: 0.118,
    populations: [
      { id: "afr", label: "African/Afr. American", af: 0.012 },
      { id: "amr", label: "Latino/Admixed American", af: 0.082 },
      { id: "asj", label: "Ashkenazi Jewish", af: 0.141 },
      { id: "eas", label: "East Asian", af: 0.119 },
      { id: "fin", label: "Finnish", af: 0.162 },
      { id: "mid", label: "Middle Eastern", af: 0.123 },
      { id: "nfe", label: "Non-Finnish European", af: 0.148 },
      { id: "sas", label: "South Asian", af: 0.132 },
    ],
    populationNote:
      "SLCO1B1*5 affects ~12–15% of European and East Asian patients. Carriers have impaired hepatic statin uptake, raising myopathy risk — particularly with simvastatin and high-dose atorvastatin.",
  },
};

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Get reference (pre-cached) gnomAD data for a detected rsID.
 * Returns undefined if the rsID is not in our registry.
 */
export function getReferenceFrequency(rsId: string): GnomadVariantInfo | undefined {
  const ref = REFERENCE_DATA[rsId];
  if (!ref) return undefined;
  return { ...ref, source: "reference" };
}

/**
 * Fetch live gnomAD data via the /api/gnomad proxy.
 * Falls back to reference data if the fetch fails or returns no data.
 */
export async function fetchGnomadFrequency(
  rsId: string
): Promise<GnomadVariantInfo | undefined> {
  const reference = getReferenceFrequency(rsId);
  if (!reference) return undefined;

  try {
    const res = await fetch(
      `/api/gnomad?rsid=${encodeURIComponent(rsId)}&variantId=${encodeURIComponent(
        reference.gnomadId
      )}`
    );
    if (!res.ok) return reference;
    const data = await res.json();
    if (!data?.overallAf) return reference;

    // Merge live population data over reference
    return {
      ...reference,
      overallAf: data.overallAf ?? reference.overallAf,
      populations: data.populations?.length ? data.populations : reference.populations,
      source: "live",
    };
  } catch {
    return reference;
  }
}

/**
 * Fetch gnomAD frequencies for all detected rsIDs.
 * Returns a map of rsId → GnomadVariantInfo.
 */
export async function fetchAllGnomadFrequencies(
  rsIds: string[]
): Promise<Record<string, GnomadVariantInfo>> {
  const results = await Promise.all(
    rsIds.map(async (rsId) => {
      const data = await fetchGnomadFrequency(rsId);
      return [rsId, data] as const;
    })
  );
  const out: Record<string, GnomadVariantInfo> = {};
  for (const [rsId, data] of results) {
    if (data) out[rsId] = data;
  }
  return out;
}

/** Format allele frequency as a percentage string, e.g. "14.3%" */
export function formatAf(af: number): string {
  if (af < 0.001) return "<0.1%";
  if (af < 0.01) return `${(af * 100).toFixed(2)}%`;
  return `${(af * 100).toFixed(1)}%`;
}
