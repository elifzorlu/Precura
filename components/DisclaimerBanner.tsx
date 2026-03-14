export default function DisclaimerBanner() {
  return (
    <div className="w-full bg-amber-500/5 border-b border-amber-500/20">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center gap-3">
        <div className="flex-shrink-0 w-5 h-5 text-amber-400">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-amber-300/90 text-xs leading-relaxed">
          <span className="font-semibold text-amber-300">Research Prototype Only.</span>{" "}
          Precura is a hackathon demonstration for MIT GrandHack. It is{" "}
          <span className="font-semibold">not medical advice</span>, not validated for clinical use, and must not inform
          real treatment decisions. All outputs are illustrative only.
        </p>
      </div>
    </div>
  );
}
