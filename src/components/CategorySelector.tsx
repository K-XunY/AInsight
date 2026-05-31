import Link from "next/link";
import { Brain, CircuitBoard, ArrowRight } from "lucide-react";

const categories = [
  {
    slug: "ai",
    name: "AI",
    description: "人工智能行业资讯",
    icon: Brain,
  },
  {
    slug: "embedded",
    name: "Embedded",
    description: "嵌入式系统行业资讯",
    icon: CircuitBoard,
  },
];

export default function CategorySelector() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
      {categories.map(({ slug, name, description, icon: Icon }) => (
        <Link
          key={slug}
          href={`/news/${slug}`}
          className="group block rounded-xl border border-border bg-card p-8 text-center transition-all hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700"
        >
          <Icon
            size={40}
            className="mx-auto mb-4 text-indigo-500"
            strokeWidth={1.5}
          />
          <h2 className="text-xl font-semibold text-card-foreground">
            {name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <ArrowRight
            size={16}
            className="mx-auto mt-4 text-muted-foreground transition-transform group-hover:translate-x-1"
          />
        </Link>
      ))}
    </div>
  );
}
