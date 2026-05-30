import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") as Category | null;
  const date = searchParams.get("date"); // YYYY-MM-DD
  const tab = searchParams.get("tab") || "today"; // "today" | "bookmarked"

  const supabase = getSupabase();

  // Always get favorited article IDs — use direct REST API to avoid client caching
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const favRes = await fetch(`${supabaseUrl}/rest/v1/favorites?select=article_id`, {
    cache: "no-store",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  const favs = await favRes.json();
  const favoritedIds = (Array.isArray(favs) ? favs : []).map((f: { article_id: string }) => f.article_id);

  // If bookmarked tab and no favorites, return early
  if (tab === "bookmarked" && favoritedIds.length === 0) {
    return NextResponse.json({ articles: [] });
  }

  let query = supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(50);

  if (category) {
    query = query.eq("category", category);
  }

  if (date) {
    const start = `${date}T00:00:00Z`;
    const end = `${date}T23:59:59Z`;
    query = query.gte("published_at", start).lte("published_at", end);
  }

  if (tab === "bookmarked") {
    query = query.in("id", favoritedIds);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const articles = (data || []).map((article) => ({
    ...article,
    is_favorited: favoritedIds.includes(article.id),
  }));

  return NextResponse.json({ articles });
}
