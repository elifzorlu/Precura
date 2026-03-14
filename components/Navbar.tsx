"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">Precura</span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-xs font-medium">Research Demo</span>
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              Home
            </Link>
            <Link
              href="/demo"
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/demo" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              Demo
            </Link>
            <Link
              href="/results"
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/results" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              Results
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
