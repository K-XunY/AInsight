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
      <section className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          AInsight
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-md text-center">
          AI & Embedded 行业资讯，每日自动聚合，中文摘要速览
        </p>
        <button
          onClick={scrollToCategories}
          className="mt-10 rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700 active:scale-95"
        >
          What&apos;s New?
        </button>
      </section>

      {/* Category Selection */}
      <section
        ref={sectionRef}
        className="py-20 px-4"
      >
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-10">
          选择资讯类别
        </h2>
        <CategorySelector />
      </section>
    </main>
  );
}
