"use client";

import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategorySelector from "@/components/CategorySelector";

export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const scrollToCategories = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-start pt-[20vh] min-h-screen px-4">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom,rgba(129,140,248,0.06),transparent_70%)]" />

        <div className="animate-fade-in text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-white">
            AINSIGHT
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto sm:text-xl">
            AI & Embedded industry news, aggregated daily with Chinese summaries
          </p>
          <div className="mt-16 flex justify-center">
            <Button
              size="lg"
              onClick={scrollToCategories}
              className="rounded-full px-16 py-8 text-2xl font-bold text-white bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_40px_rgba(168,85,247,0.25)] transition-all"
            >
              What&apos;s New?
            </Button>
          </div>
        </div>

        <ChevronDown
          size={24}
          className="absolute bottom-8 text-muted-foreground animate-bounce"
        />
      </section>

      {/* Category Selection */}
      <section ref={sectionRef} className="py-20 px-4">
        <h2 className="text-center text-2xl font-bold tracking-tight mb-10">
          选择资讯类别
        </h2>
        <CategorySelector />
      </section>
    </main>
  );
}
