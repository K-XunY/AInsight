import Link from "next/link";

const categories = [
  {
    slug: "ai",
    name: "AI",
    description: "人工智能行业资讯",
  },
  {
    slug: "embedded",
    name: "Embedded",
    description: "嵌入式系统行业资讯",
  },
];

export default function CategorySelector() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/news/${cat.slug}`}
          className="block rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:shadow-md hover:border-blue-300"
        >
          <h2 className="text-2xl font-bold text-gray-800">{cat.name}</h2>
          <p className="mt-2 text-gray-500">{cat.description}</p>
        </Link>
      ))}
    </div>
  );
}
