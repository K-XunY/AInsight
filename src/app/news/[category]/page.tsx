"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import DateSelector from "@/components/DateSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { ArticleWithFavorite, Category } from "@/lib/types";

export default function NewsFeedPage({
  params,
}: {
  params: { category: Category };
}) {
  const { category } = params;
  const pathname = usePathname();
  const [articles, setArticles] = useState<ArticleWithFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  function formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const [date, setDate] = useState(() => formatDate(new Date()));

  // Reset to today when navigating to this page
  useEffect(() => {
    setDate(formatDate(new Date()));
  }, [pathname]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const searchParams = new URLSearchParams({
      category,
      tab: "today",
      date,
    });

    const res = await fetch(`/api/articles?${searchParams}`);
    if (!res.ok) {
      console.error("Failed to fetch articles:", await res.json());
      setArticles([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setArticles(data.articles || []);
    setLoading(false);
  }, [category, date]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleToggleFavorite = async (
    articleId: string,
    isFavorited: boolean
  ) => {
    setArticles((prev) =>
      prev.map((a) =>
        a.id === articleId ? { ...a, is_favorited: !isFavorited } : a
      )
    );

    const method = isFavorited ? "DELETE" : "POST";
    const res = await fetch("/api/favorites", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_id: articleId }),
    });

    if (!res.ok) {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === articleId ? { ...a, is_favorited: isFavorited } : a
        )
      );
      console.error("Favorite toggle failed:", await res.json());
    }
  };

  const categoryLabel = category === "ai" ? "AI" : "Embedded";

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Switch category
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mt-2">
            {categoryLabel} News
          </h1>
        </div>

        {/* Date selector */}
        <div className="mb-6">
          <DateSelector selectedDate={date} onChange={setDate} />
        </div>

        {/* Article list */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2 mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No articles for this date</p>
            {date !== formatDate(new Date()) && (
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5 rounded-full"
                onClick={() => setDate(formatDate(new Date()))}
              >
                <ArrowLeft size={14} />
                Back to today
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
