interface FlagPillProps {
  text: string;
  variant?: "genomic" | "biomarker" | "pgx" | "evidence";
}

export default function FlagPill({ text, variant = "pgx" }: FlagPillProps) {
  const styles = {
    genomic: "bg-violet-500/10 text-violet-300 border border-violet-500/20",
    biomarker: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
    pgx: "bg-orange-500/10 text-orange-300 border border-orange-500/20",
    evidence: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[variant]}`}>
      {text}
    </span>
  );
}
