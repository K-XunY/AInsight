export type Category = "ai" | "embedded";

export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  category: Category;
  summary: string | null;
  published_at: string;
  fetched_at: string;
  is_read: boolean;
}

export interface Favorite {
  id: string;
  article_id: string;
  created_at: string;
}

export interface ArticleWithFavorite extends Article {
  is_favorited: boolean;
}
