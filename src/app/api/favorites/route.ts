import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST: add favorite
export async function POST(request: NextRequest) {
  const { article_id } = await request.json();

  if (!article_id) {
    return NextResponse.json(
      { error: "article_id is required" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("favorites")
    .insert({ article_id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ favorite: data });
}

// DELETE: remove favorite
export async function DELETE(request: NextRequest) {
  const { article_id } = await request.json();

  if (!article_id) {
    return NextResponse.json(
      { error: "article_id is required" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("article_id", article_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// GET: fetch all favorited articles
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/favorites?select=created_at,articles(*)`,
    {
      cache: "no-store",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );

  const data = await res.json();

  if (!Array.isArray(data)) {
    return NextResponse.json({ articles: [] });
  }

  const articles = data
    .filter((f) => f.articles)
    .map((f) => ({
      ...f.articles,
      is_favorited: true,
      favorited_at: f.created_at,
    }))
    .sort(
      (a, b) =>
        new Date(b.favorited_at).getTime() - new Date(a.favorited_at).getTime()
    );

  return NextResponse.json({ articles });
}
