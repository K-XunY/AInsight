"use client";

import { useState } from "react";
import type { ArticleWithFavorite } from "@/lib/types";

interface Props {
  article: ArticleWithFavorite;
  onToggleFavorite: (articleId: string, isFavorited: boolean) => void;
}

export default function ArticleCard({ article, onToggleFavorite }: Props) {
  const [expanded, setExpanded] = useState(false);

  const publishedDate = new Date(article.published_at).toLocaleDateString(
    "zh-CN",
    { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
  );

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
          >
            {article.title}
          </a>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
            <span>{article.source}</span>
            <span>&middot;</span>
            <span>{publishedDate}</span>
          </div>
        </div>

        <button
          onClick={() => onToggleFavorite(article.id, article.is_favorited)}
          className="shrink-0 p-2 rounded-full hover:bg-gray-100 transition"
          aria-label={article.is_favorited ? "取消收藏" : "收藏"}
        >
          {article.is_favorited ? (
            <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )}
        </button>
      </div>

      {article.summary && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-500 hover:underline"
          >
            {expanded ? "收起摘要" : "展开摘要"}
          </button>
          {expanded && (
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {article.summary}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
