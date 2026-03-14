export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 text-xs font-medium">MIT GrandHack · Research Prototype</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
          Precision treatment
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            reasoning
          </span>{" "}
          powered by
          <br />
          genomic context
        </h1>

        <p className="text-white/50 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
          A prototype decision interface demonstrating how pharmacogenomic and biomarker signals
          change treatment suitability — before a single prescription is written.
        </p>

        <a
          href="#patients"
          className="px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:shadow-[0_0_40px_rgba(6,182,212,0.35)]"
        >
          View Patients ↓
        </a>
      </div>
    </section>
  );
}
