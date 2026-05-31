"use client";

import { useState } from "react";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ArticleWithFavorite, Category } from "@/lib/types";

interface Props {
  article: ArticleWithFavorite;
  onToggleFavorite: (articleId: string, isFavorited: boolean) => void;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}小时前`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}天前`;
}

const categoryColors: Record<Category, string> = {
  ai: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  embedded:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
};

export default function ArticleCard({ article, onToggleFavorite }: Props) {
  const [expanded, setExpanded] = useState(false);
  const relativeTime = formatRelativeTime(article.published_at);

  return (
    <article className="rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-100 hover:border-indigo-400 hover:-translate-y-0.5 dark:hover:shadow-indigo-900/20 dark:hover:border-indigo-600 animate-fade-in">
      {/* Source row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">{article.source}</span>
          <span>·</span>
          <span>{relativeTime}</span>
        </div>
        <button
          onClick={() =>
            onToggleFavorite(article.id, article.is_favorited)
          }
          className="shrink-0 p-1.5 rounded-full hover:bg-accent transition"
          aria-label={article.is_favorited ? "取消收藏" : "收藏"}
        >
          <Star
            size={18}
            className={cn(
              "transition-all",
              article.is_favorited
                ? "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400"
                : "text-muted-foreground"
            )}
          />
        </button>
      </div>

      {/* Title */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-lg font-semibold text-card-foreground hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 transition-colors"
      >
        {article.title}
      </a>

      {/* Summary preview */}
      {article.summary && (
        <div className="mt-3">
          <p className={cn("text-sm text-muted-foreground leading-relaxed", !expanded && "line-clamp-2")}>
            {article.summary}
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {expanded ? (
              <>
                收起摘要 <ChevronUp size={14} />
              </>
            ) : (
              <>
                展开摘要 <ChevronDown size={14} />
              </>
            )}
          </button>
        </div>
      )}

      {/* Category badge */}
      <div className="mt-3">
        <Badge variant="secondary" className={cn("text-xs", categoryColors[article.category])}>
          {article.category === "ai" ? "AI" : "Embedded"}
        </Badge>
      </div>
    </article>
  );
}
