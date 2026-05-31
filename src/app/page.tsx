"use client";

import { useRef } from "react";
import CategorySelector from "@/components/CategorySelector";

export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const scrollToCategories = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-screen px-4">
        {/* Title & Tagline — upper area */}
        <div className="flex flex-col items-center pt-40 sm:pt-48">
          <h1 className="ainsight-title text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            AINSIGHT
          </h1>
          <p className="mt-4 font-mono text-lg font-light tracking-wider text-muted-foreground max-w-lg text-center sm:text-xl">
            AI & Embedded industry news, aggregated daily with AI-powered Chinese summaries
          </p>
        </div>

        {/* Button — vertically centered in viewport */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
      </section>

      {/* Category Selection */}
      <section
        ref={sectionRef}
        className="py-20 px-4"
      >
        <h2 className="text-center text-2xl font-bold tracking-tight mb-10">
          选择资讯类别
        </h2>
        <CategorySelector />
      </section>
    </main>
  );
}
