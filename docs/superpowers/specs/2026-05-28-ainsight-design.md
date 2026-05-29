# AInsight - AI/Embedded Industry News Aggregator

## Overview

AInsight is a web application that aggregates AI and embedded systems industry news from RSS feeds, generates Chinese summaries using DeepSeek API, and presents them in a clean, categorized reading interface.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Vercel (Frontend Only)                              │
│  Next.js UI → reads Supabase → renders news/favorites│
└─────────────────────────────────────────────────────┘
                        ↕ read/write
┌─────────────────────────────────────────────────────┐
│  Supabase (Database)                                 │
│  articles table + favorites table                    │
└─────────────────────────────────────────────────────┘
                        ↑ write
┌─────────────────────────────────────────────────────┐
│  GitHub Actions (Data Pipeline)                      │
│  Daily 6:50 UTC → fetch RSS → DeepSeek summary →    │
│  write to Supabase                                   │
└─────────────────────────────────────────────────────┘
```

**Rationale for GitHub Actions over Vercel Cron:**

- Vercel free tier has 10-second function timeout, insufficient for fetching 6 RSS feeds + generating ~60 summaries
- GitHub Actions free tier: 2,000 minutes/month (private repos), no per-job timeout constraint
- Native cron scheduling via `schedule` trigger
- Built-in secrets management for API keys

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | Next.js 14 (App Router) + TypeScript | Familiar tech stack, SSR for SEO |
| Styling | TailwindCSS | Rapid UI development |
| Database | Supabase (PostgreSQL) | 500MB free, auth-ready for future |
| ORM | Prisma | Type-safe DB access, schema migrations |
| RSS Parsing | rss-parser | Mature, handles various RSS formats |
| AI Summary | DeepSeek API | Cost-effective, Chinese output quality |
| Deployment | Vercel (frontend), GitHub Actions (pipeline) | Free tier sufficient |
| Language | English-first content, Chinese summaries | User preference |

## Data Model

```prisma
model Article {
  id           String   @id @default(uuid())
  title        String
  url          String   @unique
  source       String   // e.g. "Hacker News", "IEEE Spectrum"
  category     String   // "ai" | "embedded"
  summary      String?  // DeepSeek-generated Chinese summary
  publishedAt  DateTime
  fetchedAt    DateTime @default(now())
  isRead       Boolean  @default(false)

  favorites    Favorite[]
}

model Favorite {
  id        String   @id @default(uuid())
  articleId String
  article   Article  @relation(fields: [articleId], references: [id])
  createdAt DateTime @default(now())

  @@index([articleId])
}
```

## RSS Sources

### AI Category
| Source | Feed URL |
|--------|----------|
| Hacker News (Best) | https://hnrss.org/best |
| Ars Technica - AI | https://feeds.arstechnica.com/arstechnica/technology-lab |
| The Verge - AI | https://theverge.com/rss/ai-artificial-intelligence/index.xml |
| Towards Data Science | https://towardsdatascience.com/feed |

### Embedded Category
| Source | Feed URL |
|--------|----------|
| IEEE Spectrum | https://spectrum.ieee.org/feeds/feed.rss |
| Embedded.com | https://embedded.com/feed |

## User Flow

```
Landing Page (Hero + "What's New?" button)
    → Click → smooth scroll down
    → Category Selection (AI / Embedded)
    → Select → News Feed Page (filtered by category)
    → Article Card → expand for summary
    → Settings page (API key, theme)
```

## Pages

### 1. Landing Page (`/`)
- Hero section with app name and tagline
- "What's New?" call-to-action button
- Click scrolls down to category selection
- Two category cards: "AI" and "Embedded"

### 2. News Feed (`/news/[category]`)
- Category header (AI or Embedded)
- Date selector for browsing historical articles
- Article cards showing: title, source, publish time, expandable summary
- Click title → opens original article in new tab
- Bookmark button on each card
- Tabs: "Today" / "Bookmarked"

### 3. Settings (`/settings`)
- DeepSeek API Key input (stored in localStorage, personal device only)
- Theme toggle (light/dark)

## Data Pipeline (GitHub Actions)

**Schedule:** Daily at 22:50 UTC

**Steps:**
1. Fetch RSS feeds from all configured sources
2. Parse and deduplicate against existing articles
3. For each new article, call DeepSeek API to generate a ~100 character Chinese summary
4. Write new articles with summaries to Supabase

**Script:** `scripts/fetch-and-summarize.ts`

**Environment Variables (GitHub Secrets):**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEEPSEEK_API_KEY`

**Note:** The DeepSeek API key is used server-side only (in GitHub Actions). The settings page API key input (stored in localStorage) is reserved for future client-side features.

## Project Structure

```
AInsight/
├── .github/
│   └── workflows/
│       └── daily-fetch.yml          # GitHub Actions scheduled task
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   ├── news/
│   │   │   ├── page.tsx              # Category selection
│   │   │   └── [category]/
│   │   │       └── page.tsx          # News feed
│   │   └── settings/
│   │       └── page.tsx              # Settings
│   ├── components/
│   │   ├── ArticleCard.tsx
│   │   ├── CategorySelector.tsx
│   │   ├── DateSelector.tsx
│   │   └── Layout.tsx
│   └── lib/
│       ├── supabase.ts              # Supabase client
│       ├── deepseek.ts              # DeepSeek API client
│       └── types.ts                 # TypeScript types
├── scripts/
│   └── fetch-and-summarize.ts       # Data pipeline script
├── prisma/
│   └── schema.prisma
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Future Extensions (Out of Scope)

- User authentication (Supabase Auth)
- Push notifications / email digest
- Search and advanced filtering
- AI-powered content recommendations
- More RSS sources and categories
- RSS source management in settings UI (currently hardcoded in pipeline script)
