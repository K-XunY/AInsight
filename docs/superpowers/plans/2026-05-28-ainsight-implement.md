# AInsight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app that aggregates AI/embedded industry news from RSS, generates Chinese summaries via DeepSeek, and presents them in a categorized reading interface.

**Architecture:** Next.js frontend on Vercel reads from Supabase (PostgreSQL). A GitHub Actions pipeline runs daily at 22:50 UTC to fetch RSS feeds, generate DeepSeek summaries, and write to Supabase. No Prisma — use `@supabase/supabase-js` directly with manual TypeScript types.

**Tech Stack:** Next.js 14 (App Router), TypeScript, TailwindCSS, Supabase, DeepSeek API, rss-parser, GitHub Actions

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/lib/types.ts` | Shared TypeScript interfaces (Article, Favorite) |
| `src/lib/supabase.ts` | Supabase client singleton (used by frontend + pipeline) |
| `src/lib/deepseek.ts` | DeepSeek API client for generating summaries |
| `scripts/fetch-and-summarize.ts` | Data pipeline: fetch RSS → summarize → write Supabase |
| `.github/workflows/daily-fetch.yml` | GitHub Actions cron trigger |
| `src/app/layout.tsx` | Root layout (fonts, metadata, global providers) |
| `src/app/page.tsx` | Landing page (hero + "What's New?" + category cards) |
| `src/app/news/page.tsx` | Category selection page |
| `src/app/news/[category]/page.tsx` | News feed (article list, date picker, bookmarks) |
| `src/app/settings/page.tsx` | Settings (API key, theme) |
| `src/components/ArticleCard.tsx` | Single article card (title, source, summary, bookmark) |
| `src/components/DateSelector.tsx` | Date picker for browsing historical articles |
| `src/components/CategorySelector.tsx` | AI / Embedded category cards |
| `src/components/Layout.tsx` | Shared page layout (nav, footer) |
| `src/app/api/articles/route.ts` | API route: list articles by category/date |
| `src/app/api/favorites/route.ts` | API route: add/remove/list favorites |

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `.env.local.example`, `.gitignore`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd D:/AInsight
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Select: TypeScript YES, ESLint YES, Tailwind YES, `src/` directory YES, App Router YES, import alias `@/*`.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js rss-parser
npm install -D @types/node tsx dotenv
```

- [ ] **Step 3: Create environment example file**

Create `.env.local.example`e

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEEPSEEK_API_KEY=your-deepseek-api-key
```

- [ ] **Step 4: Update `.gitignore` to include `.env.local`**

Append to `.gitignore`:

```
.env.local
.env
```

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```

Open `http://localhost:3000`. Should see default Next.js page.

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js project with TypeScript and TailwindCSS"
```

---

## Task 2: Database Schema & Types

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/supabase.ts`
- Create: `supabase/schema.sql`

**Prerequisite:** A Supabase project. Create one at https://supabase.com if needed.

- [ ] **Step 1: Create SQL schema**

Create `supabase/schema.sql`:

```sql
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ai', 'embedded')),
  summary TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_favorites_article_id ON favorites(article_id);
```

- [ ] **Step 2: Run schema in Supabase**

Go to Supabase Dashboard → SQL Editor → paste the content of `supabase/schema.sql` → Run.

- [ ] **Step 3: Create TypeScript types**

Create `src/lib/types.ts`:

```typescript
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
```

- [ ] **Step 4: Create Supabase client**

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for server-side operations (pipeline, API routes)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql src/lib/types.ts src/lib/supabase.ts
git commit -m "feat: add database schema, types, and Supabase client"
```

---

## Task 3: DeepSeek Client

**Files:**
- Create: `src/lib/deepseek.ts`

- [ ] **Step 1: Create DeepSeek API client**

Create `src/lib/deepseek.ts`:

```typescript
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export async function generateSummary(
  title: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "你是一位科技资讯编辑。请用简洁的中文（约100字）概括以下英文文章标题和来源的核心内容。只输出摘要，不要添加额外说明。",
        },
        {
          role: "user",
          content: `标题: ${title}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `DeepSeek API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/deepseek.ts
git commit -m "feat: add DeepSeek API client for summary generation"
```

---

## Task 4: Data Pipeline Script

**Files:**
- Create: `scripts/fetch-and-summarize.ts`

- [ ] **Step 1: Create the pipeline script**

Create `scripts/fetch-and-summarize.ts`:

```typescript
import "dotenv/config";
import Parser from "rss-parser";
import { createClient } from "@supabase/supabase-js";
import { generateSummary } from "../src/lib/deepseek";
import type { Category } from "../src/lib/types";

// --- Config ---

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const deepseekApiKey = process.env.DEEPSEEK_API_KEY!;

interface RssSource {
  name: string;
  url: string;
  category: Category;
}

const RSS_SOURCES: RssSource[] = [
  // AI
  {
    name: "Hacker News",
    url: "https://hnrss.org/best",
    category: "ai",
  },
  {
    name: "Ars Technica",
    url: "https://feeds.arstechnica.com/arstechnica/technology-lab",
    category: "ai",
  },
  {
    name: "The Verge",
    url: "https://theverge.com/rss/ai-artificial-intelligence/index.xml",
    category: "ai",
  },
  {
    name: "Towards Data Science",
    url: "https://towardsdatascience.com/feed",
    category: "ai",
  },
  // Embedded
  {
    name: "IEEE Spectrum",
    url: "https://spectrum.ieee.org/feeds/feed.rss",
    category: "embedded",
  },
  {
    name: "Embedded.com",
    url: "https://embedded.com/feed",
    category: "embedded",
  },
];

// --- Fetch ---

interface RawArticle {
  title: string;
  url: string;
  source: string;
  category: Category;
  publishedAt: Date;
}

async function fetchFeed(source: RssSource): Promise<RawArticle[]> {
  const parser = new Parser();
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).slice(0, 10).map((item) => ({
      title: item.title || "Untitled",
      url: item.link || "",
      source: source.name,
      category: source.category,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    }));
  } catch (err) {
    console.error(`Failed to fetch ${source.name}: ${err}`);
    return [];
  }
}

async function fetchAllFeeds(): Promise<RawArticle[]> {
  const results = await Promise.all(RSS_SOURCES.map(fetchFeed));
  return results.flat();
}

// --- Deduplicate ---

async function filterNewArticles(
  articles: RawArticle[]
): Promise<RawArticle[]> {
  const urls = articles.map((a) => a.url).filter(Boolean);

  const { data: existing } = await supabase
    .from("articles")
    .select("url")
    .in("url", urls);

  const existingUrls = new Set((existing || []).map((r) => r.url));
  return articles.filter((a) => a.url && !existingUrls.has(a.url));
}

// --- Summarize ---

async function summarizeBatch(
  articles: RawArticle[],
  batchSize = 5
): Promise<
  { title: string; url: string; source: string; category: Category; publishedAt: Date; summary: string }[]
> {
  const results: {
    title: string;
    url: string;
    source: string;
    category: Category;
    publishedAt: Date;
    summary: string;
  }[] = [];

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    const summaries = await Promise.all(
      batch.map(async (article) => {
        try {
          const summary = await generateSummary(article.title, deepseekApiKey);
          return { ...article, summary };
        } catch (err) {
          console.error(`Summary failed for "${article.title}": ${err}`);
          return { ...article, summary: article.title }; // fallback to title
        }
      })
    );
    results.push(...summaries);

    // Rate limit: small delay between batches
    if (i + batchSize < articles.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return results;
}

// --- Insert ---

async function insertArticles(
  articles: {
    title: string;
    url: string;
    source: string;
    category: Category;
    publishedAt: Date;
    summary: string;
  }[]
) {
  if (articles.length === 0) {
    console.log("No new articles to insert.");
    return;
  }

  const rows = articles.map((a) => ({
    title: a.title,
    url: a.url,
    source: a.source,
    category: a.category,
    summary: a.summary,
    published_at: a.publishedAt.toISOString(),
  }));

  const { error } = await supabase.from("articles").insert(rows);

  if (error) {
    console.error("Insert error:", error);
    throw error;
  }

  console.log(`Inserted ${rows.length} articles.`);
}

// --- Main ---

async function main() {
  console.log("Starting AInsight data pipeline...");

  console.log("Step 1: Fetching RSS feeds...");
  const rawArticles = await fetchAllFeeds();
  console.log(`Fetched ${rawArticles.length} articles total.`);

  console.log("Step 2: Deduplicating...");
  const newArticles = await filterNewArticles(rawArticles);
  console.log(`${newArticles.length} new articles after dedup.`);

  if (newArticles.length === 0) {
    console.log("Nothing to do. Exiting.");
    return;
  }

  console.log("Step 3: Generating summaries...");
  const summarized = await summarizeBatch(newArticles);
  console.log(`Generated ${summarized.length} summaries.`);

  console.log("Step 4: Inserting into Supabase...");
  await insertArticles(summarized);

  console.log("Pipeline complete.");
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Create `.env.local` with real credentials**

Copy `.env.local.example` to `.env.local` and fill in real values from Supabase Dashboard → Settings → API, and DeepSeek dashboard.

- [ ] **Step 3: Test the pipeline locally**

```bash
npx tsx scripts/fetch-and-summarize.ts
```

Expected output:
```
Starting AInsight data pipeline...
Step 1: Fetching RSS feeds...
Fetched XX articles total.
Step 2: Deduplicating...
XX new articles after dedup.
Step 3: Generating summaries...
Generated XX summaries.
Step 4: Inserting into Supabase...
Inserted XX articles.
Pipeline complete.
```

Verify in Supabase Dashboard → Table Editor → articles that rows exist.

- [ ] **Step 4: Commit**

```bash
git add scripts/fetch-and-summarize.ts
git commit -m "feat: add RSS fetch and DeepSeek summary pipeline"
```

---

## Task 5: GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/daily-fetch.yml`

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/daily-fetch.yml`:

```yaml
name: Daily RSS Fetch & Summarize

on:
  schedule:
    - cron: "50 22 * * *" # 22:50 UTC = 6:50 Beijing time
  workflow_dispatch: # Allow manual trigger

jobs:
  fetch-and-summarize:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run pipeline
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
        run: npx tsx scripts/fetch-and-summarize.ts
```

- [ ] **Step 2: Add GitHub Secrets**

Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret. Add:

- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key
- `DEEPSEEK_API_KEY` = your DeepSeek API key

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/daily-fetch.yml
git commit -m "ci: add daily RSS fetch GitHub Actions workflow"
```

---

## Task 6: Landing Page

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/components/CategorySelector.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AInsight - AI & Embedded News",
  description: "Daily AI and embedded systems industry news with Chinese summaries",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create CategorySelector component**

Create `src/components/CategorySelector.tsx`:

```tsx
import Link from "next/link";

const categories = [
  {
    slug: "ai",
    name: "AI",
    description: "人工智能行业资讯",
  },
  {
    slug: "embedded",
    name: "Embedded",
    description: "嵌入式系统行业资讯",
  },
];

export default function CategorySelector() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/news/${cat.slug}`}
          className="block rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:shadow-md hover:border-blue-300"
        >
          <h2 className="text-2xl font-bold text-gray-800">{cat.name}</h2>
          <p className="mt-2 text-gray-500">{cat.description}</p>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create landing page**

Replace `src/app/page.tsx`:

```tsx
"use client";

import { useRef } from "react";
import CategorySelector from "@/components/CategorySelector";

export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const scrollToCategories = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          AInsight
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-md text-center">
          AI & Embedded 行业资讯，每日自动聚合，中文摘要速览
        </p>
        <button
          onClick={scrollToCategories}
          className="mt-10 rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700 active:scale-95"
        >
          What&apos;s New?
        </button>
      </section>

      {/* Category Selection */}
      <section
        ref={sectionRef}
        className="py-20 px-4"
      >
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-10">
          选择资讯类别
        </h2>
        <CategorySelector />
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Should see hero section with "AInsight" title and "What's New?" button. Click button → smooth scroll to category cards. Click a card → navigates to `/news/ai` or `/news/embedded`.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx src/components/CategorySelector.tsx
git commit -m "feat: add landing page with hero and category selection"
```

---

## Task 7: API Routes

**Files:**
- Create: `src/app/api/articles/route.ts`
- Create: `src/app/api/favorites/route.ts`

- [ ] **Step 1: Create articles API route**

Create `src/app/api/articles/route.ts`:

```typescript
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
```

- [ ] **Step 2: Create favorites API route**

Create `src/app/api/favorites/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST: add favorite
export async function POST(request: NextRequest) {
  const { article_id } = await request.json();

  if (!article_id) {
    return NextResponse.json(
      { error: "article_id is required" },
      { status: 400 }
    );
  }

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

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("article_id", article_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/articles/route.ts src/app/api/favorites/route.ts
git commit -m "feat: add articles and favorites API routes"
```

---

## Task 8: News Feed Page

**Files:**
- Create: `src/app/news/page.tsx`
- Create: `src/app/news/[category]/page.tsx`
- Create: `src/components/ArticleCard.tsx`
- Create: `src/components/DateSelector.tsx`

- [ ] **Step 1: Create category selection page**

Create `src/app/news/page.tsx`:

```tsx
import CategorySelector from "@/components/CategorySelector";
import Link from "next/link";

export default function NewsPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-blue-600 hover:underline text-sm mb-6 inline-block"
        >
          &larr; 返回首页
        </Link>
        <h1 className="text-3xl font-bold text-center mb-10">资讯分类</h1>
        <CategorySelector />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create ArticleCard component**

Create `src/components/ArticleCard.tsx`:

```tsx
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
```

- [ ] **Step 3: Create DateSelector component**

Create `src/components/DateSelector.tsx`:

```tsx
"use client";

interface Props {
  selectedDate: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

export default function DateSelector({ selectedDate, onChange }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const goBack = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onChange(d.toISOString().split("T")[0]);
  };

  const goForward = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    if (d.toISOString().split("T")[0] <= today) {
      onChange(d.toISOString().split("T")[0]);
    }
  };

  const isToday = selectedDate === today;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={goBack}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
        aria-label="前一天"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <input
        type="date"
        value={selectedDate}
        max={today}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
      />

      <button
        onClick={goForward}
        disabled={isToday}
        className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30"
        aria-label="后一天"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {!isToday && (
        <button
          onClick={() => onChange(today)}
          className="text-sm text-blue-600 hover:underline"
        >
          回到今天
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create news feed page**

Create `src/app/news/[category]/page.tsx`:

```tsx
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
```

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```

Navigate to `/news/ai` and `/news/embedded`. If the pipeline has been run, articles should appear. Test date navigation, tabs, and bookmark toggling.

- [ ] **Step 6: Commit**

```bash
git add src/app/news/page.tsx src/app/news/\[category\]/page.tsx src/components/ArticleCard.tsx src/components/DateSelector.tsx
git commit -m "feat: add news feed page with article list, date picker, and bookmarks"
```

---

## Task 9: Settings Page

**Files:**
- Create: `src/app/settings/page.tsx`

- [ ] **Step 1: Create settings page**

Create `src/app/settings/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Theme = "light" | "dark";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [theme, setTheme] = useState<Theme>("light");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("deepseek_api_key") || "";
    const storedTheme = (localStorage.getItem("theme") as Theme) || "light";
    setApiKey(storedKey);
    setTheme(storedTheme);
  }, []);

  const handleSave = () => {
    localStorage.setItem("deepseek_api_key", apiKey);
    localStorage.setItem("theme", theme);
    applyTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const applyTheme = (t: Theme) => {
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Apply theme on load
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          &larr; 返回首页
        </Link>

        <h1 className="text-3xl font-bold mt-4 mb-8">设置</h1>

        {/* API Key */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DeepSeek API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            存储在本地浏览器，用于未来客户端功能
          </p>
        </div>

        {/* Theme */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            主题
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`px-4 py-2 rounded-lg text-sm border transition ${
                theme === "light"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              浅色
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`px-4 py-2 rounded-lg text-sm border transition ${
                theme === "dark"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              深色
            </button>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          {saved ? "已保存 ✓" : "保存设置"}
        </button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `/settings`. Test API key input, theme toggle, and save button. Verify theme persists across page reloads.

- [ ] **Step 3: Commit**

```bash
git add src/app/settings/page.tsx
git commit -m "feat: add settings page with API key and theme toggle"
```

---

## Task 10: Layout Component & Navigation

**Files:**
- Create: `src/components/Layout.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create Layout component**

Create `src/components/Layout.tsx`:

```tsx
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-gray-900">
            AInsight
          </Link>
          <Link
            href="/settings"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            设置
          </Link>
        </div>
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Update root layout to use Layout component**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import Layout from "@/components/Layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "AInsight - AI & Embedded News",
  description:
    "Daily AI and embedded systems industry news with Chinese summaries",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify navigation**

Check that the nav bar appears on all pages with "AInsight" link (→ home) and "设置" link (→ settings).

- [ ] **Step 4: Commit**

```bash
git add src/components/Layout.tsx src/app/layout.tsx
git commit -m "feat: add shared layout with navigation bar"
```

---

## Task 11: Supabase Row Level Security

**Files:**
- Create: `supabase/rls.sql`

- [ ] **Step 1: Create RLS policy**

Create `supabase/rls.sql`:

```sql
-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Articles: anyone can read, only service role can insert/update/delete
CREATE POLICY "Articles are publicly readable"
  ON articles FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage articles"
  ON articles FOR ALL
  USING (auth.role() = 'service_role');

-- Favorites: anyone can read/insert/delete (single-user app)
CREATE POLICY "Favorites are publicly readable"
  ON favorites FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert favorites"
  ON favorites FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete favorites"
  ON favorites FOR DELETE
  USING (true);
```

- [ ] **Step 2: Run RLS in Supabase SQL Editor**

Go to Supabase Dashboard → SQL Editor → paste and run.

- [ ] **Step 3: Commit**

```bash
git add supabase/rls.sql
git commit -m "feat: add Row Level Security policies"
```

---

## Task 12: Final Integration & Deployment Prep

**Files:**
- Modify: `next.config.js` (if needed)
- Create: `vercel.json` (optional)

- [ ] **Step 1: Set up Vercel deployment**

```bash
npm i -g vercel
vercel login
vercel link
```

Add environment variables in Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Note: `SUPABASE_SERVICE_ROLE_KEY` and `DEEPSEEK_API_KEY` are NOT needed in Vercel (only in GitHub Actions).

- [ ] **Step 2: Test production build locally**

```bash
npm run build
npm start
```

Open `http://localhost:3000` and verify all pages work.

- [ ] **Step 3: Deploy to Vercel**

```bash
vercel --prod
```

- [ ] **Step 4: Verify production deployment**

Open the Vercel URL. Test:
1. Landing page loads, "What's New?" scrolls to categories
2. Category cards navigate to `/news/ai` and `/news/embedded`
3. Articles display (if pipeline has run)
4. Bookmark toggle works
5. Date navigation works
6. Settings page saves to localStorage

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Project scaffolding | 10 min |
| 2 | Database schema & types | 15 min |
| 3 | DeepSeek client | 5 min |
| 4 | Data pipeline script | 20 min |
| 5 | GitHub Actions workflow | 10 min |
| 6 | Landing page | 15 min |
| 7 | API routes | 10 min |
| 8 | News feed page | 20 min |
| 9 | Settings page | 10 min |
| 10 | Layout & navigation | 10 min |
| 11 | Row Level Security | 5 min |
| 12 | Deployment | 15 min |
| **Total** | | **~2.5 hours** |
