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
