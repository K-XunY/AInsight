"use client";

import { useEffect, useRef, useCallback } from "react";
import CategorySelector from "@/components/CategorySelector";

export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const orbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);

  const scrollToCategories = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const updateLines = useCallback(() => {
    const container = visualRef.current;
    const core = coreRef.current;
    if (!container || !core) return;

    const containerRect = container.getBoundingClientRect();
    const coreRect = core.getBoundingClientRect();
    const cx = coreRect.left + coreRect.width / 2 - containerRect.left;
    const cy = coreRect.top + coreRect.height / 2 - containerRect.top;

    // Convert to SVG viewBox coordinates (400x400)
    const scaleX = 400 / containerRect.width;
    const scaleY = 400 / containerRect.height;

    orbRefs.current.forEach((orb, i) => {
      if (!orb || !lineRefs.current[i]) return;
      const orbRect = orb.getBoundingClientRect();
      const ox = (orbRect.left + orbRect.width / 2 - containerRect.left) * scaleX;
      const oy = (orbRect.top + orbRect.height / 2 - containerRect.top) * scaleY;

      const line = lineRefs.current[i]!;
      line.setAttribute("x1", String(cx * scaleX));
      line.setAttribute("y1", String(cy * scaleY));
      line.setAttribute("x2", String(ox));
      line.setAttribute("y2", String(oy));
    });

    requestAnimationFrame(updateLines);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(updateLines);
    return () => cancelAnimationFrame(raf);
  }, [updateLines]);

  return (
    <main>
      {/* Hero */}
      <section className="min-h-screen px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto pt-24 sm:pt-32 lg:pt-40">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20">
            {/* Left: Title & Tagline */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="ainsight-title text-7xl font-bold tracking-tight sm:text-8xl lg:text-9xl">
                AINSIGHT
              </h1>
              <p className="mt-6 font-mono text-lg font-light tracking-wider text-muted-foreground sm:text-xl">
                AI & Embedded industry news, aggregated daily with AI-powered Chinese summaries
              </p>
            </div>

            {/* Right: Abstract visuals */}
            <div ref={visualRef} className="hero-visual flex-1 relative w-full max-w-lg h-80 lg:h-96">
              {/* Central node */}
              <div ref={coreRef} className="hero-orb hero-orb-core absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 blur-sm" />
              {/* Orbiting orbs */}
              <div ref={(el) => { orbRefs.current[0] = el; }} className="hero-orb hero-orb-1 absolute w-16 h-16 rounded-full bg-pink-500/60 blur-md" />
              <div ref={(el) => { orbRefs.current[1] = el; }} className="hero-orb hero-orb-2 absolute w-12 h-12 rounded-full bg-indigo-400/50 blur-sm" />
              <div ref={(el) => { orbRefs.current[2] = el; }} className="hero-orb hero-orb-3 absolute w-20 h-20 rounded-full bg-violet-500/40 blur-lg" />
              <div ref={(el) => { orbRefs.current[3] = el; }} className="hero-orb hero-orb-4 absolute w-10 h-10 rounded-full bg-cyan-400/50 blur-sm" />
              {/* Connecting lines (SVG) */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <g filter="url(#glow)">
                  <line ref={(el) => { lineRefs.current[0] = el; }} x1="200" y1="200" x2="120" y2="100" className="hero-line" />
                  <line ref={(el) => { lineRefs.current[1] = el; }} x1="200" y1="200" x2="300" y2="120" className="hero-line" />
                  <line ref={(el) => { lineRefs.current[2] = el; }} x1="200" y1="200" x2="100" y2="280" className="hero-line" />
                  <line ref={(el) => { lineRefs.current[3] = el; }} x1="200" y1="200" x2="310" y2="290" className="hero-line" />
                </g>
              </svg>
            </div>
          </div>

          {/* Button — below both columns */}
          <div className="flex justify-center mt-16 lg:mt-24">
            <button
              onClick={scrollToCategories}
              className="hero-button pointer-events-auto group relative rounded-full px-16 py-6 text-2xl font-semibold text-white transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <span className="hero-button-bg absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-indigo-500 to-violet-500" />
              <span className="hero-button-glow absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-indigo-500 to-violet-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
              <span className="hero-button-shimmer absolute inset-0 rounded-full overflow-hidden" />
              <span className="hero-button-ring absolute -inset-1 rounded-full border-2 border-white/0 group-hover:border-white/30 transition-all duration-500 group-hover:inset-[-6px]" />
              <span className="relative z-10">What&apos;s New?</span>
            </button>
          </div>
        </div>
      </section>

      {/* Category Selection */}
      <section
        ref={sectionRef}
        className="py-20 px-4"
      >
        <h2 className="text-center text-2xl font-bold tracking-tight mb-10">
          Choose A Category
        </h2>
        <CategorySelector />
      </section>
    </main>
  );
}
