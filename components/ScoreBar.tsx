"use client";
import { useEffect, useState } from "react";

interface ScoreBarProps {
  score: number;
  category: "Preferred" | "Caution" | "Avoid";
}

export default function ScoreBar({ score, category }: ScoreBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const color = {
    Preferred: "bg-cyan-500",
    Caution: "bg-amber-500",
    Avoid: "bg-red-500",
  }[category];

  const glowColor = {
    Preferred: "shadow-[0_0_8px_rgba(6,182,212,0.4)]",
    Caution: "shadow-[0_0_8px_rgba(245,158,11,0.4)]",
    Avoid: "shadow-[0_0_8px_rgba(239,68,68,0.4)]",
  }[category];

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color} ${glowColor}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-white/60 text-xs tabular-nums w-8 text-right">{score}</span>
    </div>
  );
}
