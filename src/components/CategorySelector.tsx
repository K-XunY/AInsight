import Link from "next/link";
import { Brain, CircuitBoard } from "lucide-react";

const categories = [
  {
    slug: "ai",
    name: "AI",
    icon: Brain,
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    glow: "group-hover:shadow-indigo-500/20",
    borderColor: "group-hover:border-indigo-500/30",
  },
  {
    slug: "embedded",
    name: "Embedded",
    icon: CircuitBoard,
    gradient: "from-cyan-500 via-teal-500 to-emerald-500",
    glow: "group-hover:shadow-cyan-500/20",
    borderColor: "group-hover:border-cyan-500/30",
  },
];

export default function CategorySelector() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/news/${cat.slug}`}
          className={`category-card group relative overflow-hidden rounded-2xl border border-border bg-card p-10 text-center shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${cat.glow} ${cat.borderColor}`}
        >
          {/* Gradient accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

          {/* Icon */}
          <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.gradient} p-0.5`}>
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-card">
              <cat.icon size={28} className="text-foreground" />
            </div>
          </div>

          {/* Name */}
          <h2 className="text-2xl font-bold text-card-foreground tracking-tight">
            {cat.name}
          </h2>

          {/* Subtle arrow */}
          <div className="mt-4 flex justify-center">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform duration-300 group-hover:translate-x-0.5">
                <path d="M5.25 3.5L8.75 7L5.25 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>

          {/* Background glow */}
          <div className={`absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${cat.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10`} />
        </Link>
      ))}
    </div>
  );
}
