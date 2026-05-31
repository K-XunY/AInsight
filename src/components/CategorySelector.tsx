import Link from "next/link";

const categories = [
  { slug: "ai", name: "AI" },
  { slug: "embedded", name: "Embedded" },
];

export default function CategorySelector() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/news/${cat.slug}`}
          className="block rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition hover:shadow-md hover:border-primary/50"
        >
          <h2 className="text-2xl font-bold text-card-foreground">{cat.name}</h2>
        </Link>
      ))}
    </div>
  );
}
