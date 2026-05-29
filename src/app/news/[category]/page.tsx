"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import DateSelector from "@/components/DateSelector";
import type { ArticleWithFavorite, Category } from "@/lib/types";

type Tab = "today" | "bookmarked";

export default function NewsFeedPage({
  params,
}: {
  params: { category: Category };
}) {
  const { category } = params;
  const [articles, setArticles] = useState<ArticleWithFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("today");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const searchParams = new URLSearchParams({
      category,
      tab,
    });

    if (tab === "today") {
      searchParams.set("date", date);
    }

    const res = await fetch(`/api/articles?${searchParams}`);
    const data = await res.json();
    setArticles(data.articles || []);
    setLoading(false);
  }, [category, tab, date]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleToggleFavorite = async (
    articleId: string,
    isFavorited: boolean
  ) => {
    const method = isFavorited ? "DELETE" : "POST";
    await fetch("/api/favorites", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_id: articleId }),
    });
    // Optimistic update
    setArticles((prev) =>
      prev.map((a) =>
        a.id === articleId ? { ...a, is_favorited: !isFavorited } : a
      )
    );
  };

  const categoryLabel = category === "ai" ? "AI" : "Embedded";

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/news"
            className="text-blue-600 hover:underline text-sm"
          >
            &larr; 切换分类
          </Link>
          <h1 className="text-3xl font-bold mt-2">{categoryLabel} 资讯</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b border-gray-200">
          <button
            onClick={() => setTab("today")}
            className={`pb-2 text-sm font-medium transition ${
              tab === "today"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            今日
          </button>
          <button
            onClick={() => setTab("bookmarked")}
            className={`pb-2 text-sm font-medium transition ${
              tab === "bookmarked"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            收藏
          </button>
        </div>

        {/* Date selector (only in today tab) */}
        {tab === "today" && (
          <div className="mb-6">
            <DateSelector selectedDate={date} onChange={setDate} />
          </div>
        )}

        {/* Article list */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">加载中...</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            {tab === "bookmarked"
              ? "还没有收藏的文章"
              : "该日期暂无资讯"}
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
