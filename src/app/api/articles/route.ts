import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") as Category | null;
  const date = searchParams.get("date"); // YYYY-MM-DD
  const tab = searchParams.get("tab") || "today"; // "today" | "bookmarked"

  let query = supabase
    .from("articles")
    .select("*, favorites(id)")
    .order("published_at", { ascending: false })
    .limit(50);

  if (category) {
    query = query.eq("category", category);
  }

  if (date) {
    // Filter by date (UTC day range)
    const start = `${date}T00:00:00Z`;
    const end = `${date}T23:59:59Z`;
    query = query.gte("published_at", start).lte("published_at", end);
  }

  if (tab === "bookmarked") {
    query = query.not("favorites", "is", null);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten favorites info
  const articles = (data || []).map((article) => ({
    ...article,
    is_favorited: article.favorites && article.favorites.length > 0,
    favorites: undefined,
  }));

  return NextResponse.json({ articles });
}
