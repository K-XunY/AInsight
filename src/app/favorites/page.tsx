"use client";

import { useEffect, useState, useCallback } from "react";
import { Star } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ArticleWithFavorite } from "@/lib/types";

export default function FavoritesPage() {
  const [articles, setArticles] = useState<ArticleWithFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/favorites");
    if (!res.ok) {
      setArticles([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setArticles(data.articles || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleToggleFavorite = async (
    articleId: string,
    isFavorited: boolean
  ) => {
    if (!isFavorited) return;

    setArticles((prev) => prev.filter((a) => a.id !== articleId));

    const res = await fetch("/api/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_id: articleId }),
    });

    if (!res.ok) {
      fetchFavorites();
      console.error("Unfavorite failed:", await res.json());
    }
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Star size={24} className="text-amber-500" />
          <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
          {!loading && (
            <Badge variant="secondary">{articles.length}</Badge>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
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
            <Star size={48} className="mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-4">No favorites yet</p>
            <Button variant="outline" asChild>
              <a href="/news/ai">Browse articles</a>
            </Button>
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
