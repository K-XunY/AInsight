import CategorySelector from "@/components/CategorySelector";
import Link from "next/link";

export default function NewsPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-primary hover:underline text-sm mb-6 inline-block"
        >
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-center mb-10">Categories</h1>
        <CategorySelector />
      </div>
    </main>
  );
}
