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
  {
    title: string;
    url: string;
    source: string;
    category: Category;
    publishedAt: Date;
    summary: string;
  }[]
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
          const summary = await generateSummary(
            article.title,
            deepseekApiKey
          );
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
