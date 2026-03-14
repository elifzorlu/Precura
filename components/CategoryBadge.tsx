interface CategoryBadgeProps {
  category: "Preferred" | "Caution" | "Avoid";
  size?: "sm" | "md";
}

export default function CategoryBadge({ category, size = "md" }: CategoryBadgeProps) {
  const config = {
    Preferred: {
      className:
        "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]",
      dot: "bg-cyan-400",
    },
    Caution: {
      className:
        "bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
      dot: "bg-amber-400",
    },
    Avoid: {
      className:
        "bg-red-500/10 text-red-300 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]",
      dot: "bg-red-400",
    },
  };

  const { className, dot } = config[category];
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${padding} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {category}
    </span>
  );
}
