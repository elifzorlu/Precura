import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import { DISEASE_CONFIGS } from "@/lib/config/diseases";

export default function Home() {
  const activeDiseases = DISEASE_CONFIGS.filter((d) => !d.isStub);
  const stubDiseases = DISEASE_CONFIGS.filter((d) => d.isStub);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <HeroSection />

      {/* Problem statement */}
      <section id="how-it-works" className="px-6 py-20 border-t border-white/5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-3">The Problem</p>
            <h2 className="text-3xl font-bold text-white mb-4">The diagnosis was correct. The treatment still failed.</h2>
            <p className="text-white/50 text-lg max-w-3xl mx-auto leading-relaxed">
              Standard clinical workflows determine <em>what</em> to treat. They rarely account for{" "}
              <em>how</em> a patient will metabolize, respond to, or be harmed by a given drug —
              because pharmacogenomic and biomarker data is siloed or ignored at the point of decision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              {
                icon: "🧬",
                title: "CYP2C19 + Clopidogrel",
                body: "~30% of patients are poor/intermediate CYP2C19 metabolizers. Standard clopidogrel dosing provides inadequate antiplatelet effect — the FDA issued a black box warning, yet prescribing patterns often don't reflect genotype.",
              },
              {
                icon: "🎗️",
                title: "CYP2D6 + Tamoxifen",
                body: "Tamoxifen requires CYP2D6 to produce endoxifen, its active form. CYP2D6 poor metabolizers achieve only 25% of normal endoxifen levels — but tamoxifen remains widely prescribed without genotyping.",
              },
              {
                icon: "💊",
                title: "SLCO1B1 + Statins",
                body: "SLCO1B1*5 carriers have impaired hepatic statin uptake, leading to elevated plasma levels and myopathy risk — especially with simvastatin. Rosuvastatin is a safer alternative, rarely selected without PGx data.",
              },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl border border-white/5 bg-[#13131a]">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-white font-semibold text-base mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disease domains */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Supported Domains</p>
            <h2 className="text-3xl font-bold text-white">Three diseases. Full PGx-aware reasoning.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {activeDiseases.map((d) => (
              <Link
                key={d.id}
                href="/demo"
                className="group p-5 rounded-xl border border-white/10 bg-[#13131a] hover:border-cyan-500/30 hover:bg-cyan-500/[0.03] transition-all duration-200"
              >
                <div className="text-3xl mb-3">{d.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{d.label}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{d.description}</p>
                <div className="mt-3 flex items-center gap-1 text-cyan-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore →
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stubDiseases.map((d) => (
              <div key={d.id} className="relative p-5 rounded-xl border border-white/5 bg-[#13131a] opacity-50">
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30 text-xs">
                  Coming Soon
                </div>
                <div className="text-3xl mb-3">{d.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{d.label}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Try a sample patient in under 60 seconds</h2>
          <p className="text-white/50 mb-8 text-lg">
            Load a pre-built patient profile and see how genomic context reshapes the treatment landscape.
          </p>
          <Link
            href="/demo"
            className="inline-flex px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.35)]"
          >
            Launch Demo →
          </Link>
        </div>
      </section>

      {/* Footer disclaimer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-white/20 text-xs leading-relaxed max-w-2xl mx-auto">
            <strong className="text-white/30">Disclaimer:</strong> Precura is a hackathon prototype built for MIT GrandHack.
            It is not medical advice, not validated for clinical use, and must not inform real treatment decisions.
            All pharmacogenomic rules are illustrative and based on published guidelines (CPIC, FDA). Always consult a qualified clinician.
          </p>
          <p className="text-white/15 text-xs mt-4">MIT GrandHack · 2025 · Research Demo</p>
        </div>
      </footer>
    </div>
  );
}
