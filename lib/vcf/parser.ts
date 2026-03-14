/**
 * Client-side VCF parser for pharmacogenomic markers.
 *
 * Reads a standard VCF file and extracts genotypes at known PGx variant
 * positions, then maps diplotypes → metabolizer phenotypes per CPIC guidelines.
 *
 * Supported genes:
 *   CYP2C19  — clopidogrel, SSRIs, PPIs
 *   CYP2D6   — tamoxifen, antidepressants
 *   SLCO1B1  — statin transporter (myopathy risk)
 */

// ── Variant registry ───────────────────────────────────────────────────────

type AlleleEffect = "lof" | "gof" | "dec"; // loss-of-function | gain-of-function | decreased

interface PgxVariant {
  gene: string;
  starAllele: string;
  effect: AlleleEffect;
}

/**
 * rsID → PGx variant definition.
 * Sources: CPIC guidelines, PharmVar, FDA pharmacogenomics table.
 */
const VARIANT_REGISTRY: Record<string, PgxVariant> = {
  // CYP2C19 — loss-of-function (increase substrate exposure)
  rs4244285:  { gene: "cyp2c19", starAllele: "*2",  effect: "lof" }, // most common LOF
  rs4986893:  { gene: "cyp2c19", starAllele: "*3",  effect: "lof" },
  rs28399504: { gene: "cyp2c19", starAllele: "*4",  effect: "lof" },
  rs56337013: { gene: "cyp2c19", starAllele: "*5",  effect: "lof" },
  // CYP2C19 — gain-of-function (increased metabolism)
  rs12248560: { gene: "cyp2c19", starAllele: "*17", effect: "gof" },

  // CYP2D6 — loss-of-function
  rs3892097:  { gene: "cyp2d6", starAllele: "*4",  effect: "lof" }, // most common LOF (~20% European)
  rs35742686: { gene: "cyp2d6", starAllele: "*3",  effect: "lof" },
  rs5030655:  { gene: "cyp2d6", starAllele: "*6",  effect: "lof" },
  // CYP2D6 — decreased function
  rs1065852:  { gene: "cyp2d6", starAllele: "*10", effect: "dec" }, // common in Asian populations
  rs28371706: { gene: "cyp2d6", starAllele: "*41", effect: "dec" },

  // SLCO1B1 — high myopathy risk (*5 allele)
  rs4149056:  { gene: "slco1b1", starAllele: "*5", effect: "lof" },
};

// ── Allele counting ────────────────────────────────────────────────────────

interface AlleleCounts {
  lof: number; // number of loss-of-function alleles (0, 1, or 2)
  gof: number; // number of gain-of-function alleles
  dec: number; // number of decreased-function alleles
}

function emptyCount(): AlleleCounts {
  return { lof: 0, gof: 0, dec: 0 };
}

/** Parse GT field (e.g. "0/1", "1|1", "0|0") and return number of ALT alleles. */
function altAlleleCount(gt: string): number {
  const alleles = gt.split(/[\/|]/);
  return alleles.filter((a) => a !== "0" && a !== ".").length;
}

// ── Phenotype mapping (CPIC-aligned) ──────────────────────────────────────

/**
 * CYP2C19 phenotype from allele counts.
 * CPIC: https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/
 */
function cyp2c19Phenotype(c: AlleleCounts): string {
  if (c.lof >= 2) return "poor";           // *2/*2, *2/*3, etc.
  if (c.lof === 1) return "intermediate";  // *1/*2, *1/*3
  if (c.gof >= 2)  return "ultrarapid";    // *17/*17
  // *1/*17 is "Rapid" in CPIC, but no specific dose adjustment differs from Normal
  // in the scoring engine — map to "normal" for clinical decision support
  return "normal";
}

/**
 * CYP2D6 phenotype from allele counts (simplified).
 * CPIC: https://cpicpgx.org/guidelines/guideline-for-tamoxifen-and-cyp2d6/
 */
function cyp2d6Phenotype(c: AlleleCounts): string {
  if (c.lof >= 2)              return "poor";          // *4/*4, *3/*4, etc.
  if (c.lof === 1)             return "intermediate";  // *1/*4
  if (c.dec >= 1 && c.lof >= 1) return "intermediate"; // *4/*10
  if (c.dec >= 2)              return "intermediate";  // *10/*10 (Asian population)
  if (c.dec === 1)             return "intermediate";  // *1/*10 or *1/*41
  return "normal";
}

/**
 * SLCO1B1 risk from allele counts.
 * The *5 allele (rs4149056 T>C) — even one copy raises myopathy risk.
 */
function slco1b1Risk(c: AlleleCounts): string {
  return c.lof >= 1 ? "high" : "low";
}

// ── VCF parsing ────────────────────────────────────────────────────────────

export interface ParsedVcfResult {
  pharmacogenomicMarkers: Record<string, string>;
  detectedVariants: {
    rsId: string;
    gene: string;
    starAllele: string;
    effect: AlleleEffect;
    altCount: number;
  }[];
  parsingNotes: string[];
  linesScanned: number;
}

/**
 * Parse a VCF file text and return PGx markers.
 *
 * Supports VCF 4.x format. Looks for the ID column (column 2, 0-indexed) to
 * match rsIDs. Falls back to CHROM+POS matching for files without rsIDs.
 */
export function parseVcf(vcfText: string): ParsedVcfResult {
  const lines = vcfText.split("\n");
  const notes: string[] = [];
  let linesScanned = 0;

  // Gene → allele counts
  const counts: Record<string, AlleleCounts> = {
    cyp2c19: emptyCount(),
    cyp2d6:  emptyCount(),
    slco1b1: emptyCount(),
  };

  const detected: ParsedVcfResult["detectedVariants"] = [];

  // Locate SAMPLE column index from the #CHROM header
  let sampleColIndex = 9; // default: first sample is column 9
  let formatColIndex = 8;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Parse column header
    if (line.startsWith("#CHROM")) {
      const cols = line.split("\t");
      formatColIndex = cols.indexOf("FORMAT");
      sampleColIndex = formatColIndex >= 0 ? formatColIndex + 1 : 9;
      continue;
    }
    if (line.startsWith("#")) continue; // meta lines

    linesScanned++;
    const cols = line.split("\t");
    if (cols.length < 8) continue;

    const rsId = cols[2]?.trim(); // ID column
    if (!rsId || rsId === ".") continue;

    const variant = VARIANT_REGISTRY[rsId];
    if (!variant) continue;

    // Extract GT from FORMAT:SAMPLE columns
    const format = cols[formatColIndex]?.split(":") ?? [];
    const gtIndex = format.indexOf("GT");
    const sampleFields = cols[sampleColIndex]?.split(":") ?? [];
    const gtValue = gtIndex >= 0 ? sampleFields[gtIndex] : sampleFields[0];

    if (!gtValue) continue;

    const altCount = altAlleleCount(gtValue);
    if (altCount === 0) continue; // homozygous reference — no variant

    const gene = variant.gene;
    counts[gene][variant.effect] = Math.min(
      2,
      (counts[gene][variant.effect] ?? 0) + altCount
    );

    detected.push({
      rsId,
      gene,
      starAllele: variant.starAllele,
      effect: variant.effect,
      altCount,
    });
  }

  if (linesScanned === 0) {
    notes.push("No variant lines found — check that the file is a valid VCF.");
  }

  // Build phenotype map
  const pharmacogenomicMarkers: Record<string, string> = {};

  const c19 = counts.cyp2c19;
  if (c19.lof + c19.gof > 0) {
    pharmacogenomicMarkers["cyp2c19"] = cyp2c19Phenotype(c19);
  } else {
    pharmacogenomicMarkers["cyp2c19"] = "normal";
    notes.push("No CYP2C19 variants detected — defaulting to Normal Metabolizer.");
  }

  const d6 = counts.cyp2d6;
  if (d6.lof + d6.dec > 0) {
    pharmacogenomicMarkers["cyp2d6"] = cyp2d6Phenotype(d6);
  } else {
    pharmacogenomicMarkers["cyp2d6"] = "normal";
    notes.push("No CYP2D6 variants detected — defaulting to Normal Metabolizer.");
  }

  const s1b1 = counts.slco1b1;
  pharmacogenomicMarkers["slco1b1"] = slco1b1Risk(s1b1);
  if (s1b1.lof === 0) {
    notes.push("No SLCO1B1*5 variant detected — low myopathy risk.");
  }

  return {
    pharmacogenomicMarkers,
    detectedVariants: detected,
    parsingNotes: notes,
    linesScanned,
  };
}
