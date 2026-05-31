# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign AInsight with shadcn/ui + indigo theme + dark mode, covering all pages.

**Architecture:** Introduce shadcn/ui component library on top of existing TailwindCSS. CSS variables drive theming (light/dark). Geist fonts loaded via Next.js font optimization. New standalone favorites page added.

**Tech Stack:** Next.js 14, React 18, TailwindCSS 3.4, shadcn/ui, Lucide React, Geist Sans/Mono

---

## File Structure

### Files to Modify
| File | Responsibility |
|------|---------------|
| `package.json` | Add shadcn/ui dependencies |
| `tailwind.config.ts` | shadcn/ui theme config, font families, animations |
| `src/app/globals.css` | shadcn/ui CSS variables (light + dark), base styles |
| `src/app/layout.tsx` | Geist fonts, ThemeProvider wrap, flash-prevention script, footer |
| `src/app/page.tsx` | Hero redesign with gradient, category cards with icons |
| `src/app/news/[category]/page.tsx` | Remove tabs, skeleton loading, improved empty states |
| `src/app/settings/page.tsx` | shadcn Cards, ToggleGroup, 3-way theme, password toggle |
| `src/components/Layout.tsx` | New navbar with desktop nav + mobile hamburger |
| `src/components/ArticleCard.tsx` | Redesign: source row, title, summary preview, category badge |
| `src/components/CategorySelector.tsx` | shadcn Card, Lucide icons, hover effects |
| `src/components/DateSelector.tsx` | shadcn Button styling, Lucide icons |
| `src/lib/types.ts` | Add `favorited_at` field to API response type |

### Files to Create
| File | Responsibility |
|------|---------------|
| `src/lib/utils.ts` | shadcn/ui `cn()` utility |
| `src/components/ThemeProvider.tsx` | Theme context + localStorage sync + system detection |
| `src/components/MobileNav.tsx` | Mobile bottom navigation bar |
| `src/app/favorites/page.tsx` | Standalone favorites page |
| `src/components/ui/button.tsx` | shadcn Button (auto-generated) |
| `src/components/ui/card.tsx` | shadcn Card (auto-generated) |
| `src/components/ui/input.tsx` | shadcn Input (auto-generated) |
| `src/components/ui/badge.tsx` | shadcn Badge (auto-generated) |
| `src/components/ui/skeleton.tsx` | shadcn Skeleton (auto-generated) |
| `src/components/ui/toggle-group.tsx` | shadcn ToggleGroup (auto-generated) |
| `src/components/ui/tooltip.tsx` | shadcn Tooltip (auto-generated) |
| `src/app/api/favorites/route.ts` | Extend GET to support fetching all favorites with article data |

---

### Task 1: Install Dependencies & Initialize shadcn/ui

**Files:**
- Modify: `package.json`
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/*` (shadcn components)

- [ ] **Step 1: Install base dependencies**

```bash
cd D:/AInsight
npm install clsx tailwind-merge lucide-react class-variance-authority
```

- [ ] **Step 2: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: New York
- Base color: Zinc
- CSS variables: Yes
- Tailwind CSS path: `src/app/globals.css`
- Components path: `src/components/ui`
- Tailwind config path: `tailwind.config.ts`

- [ ] **Step 3: Add shadcn/ui components**

```bash
npx shadcn@latest add button card input badge skeleton toggle-group tooltip
```

- [ ] **Step 4: Verify `src/lib/utils.ts` was created**

Expected content:
```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Verify build still works**

```bash
npm run build
```

Expected: Build succeeds (shadcn/ui components are additive, no breaking changes).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: install shadcn/ui and add base components"
```

---

### Task 2: Design System — Tailwind Config & CSS Variables

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out forwards",
        shimmer: "shimmer 1.5s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 2: Replace `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --primary: 239 84% 67%;
    --primary-foreground: 0 0% 100%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 239 84% 67%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --primary: 239 84% 77%;
    --primary-foreground: 240 10% 3.9%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 239 84% 77%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif;
  }
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds. Visual appearance may be broken until components are updated (expected).

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: add design system CSS variables and tailwind config"
```

---

### Task 3: Theme System — ThemeProvider & Flash Prevention

**Files:**
- Create: `src/components/ThemeProvider.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create `src/components/ThemeProvider.tsx`**

```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme) || "system";
    setThemeState(stored);
    const resolved = stored === "system" ? getSystemTheme() : stored;
    setResolvedTheme(resolved);
    applyTheme(stored);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        applyTheme("system");
        setResolvedTheme(getSystemTheme());
      }
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
    const resolved = t === "system" ? getSystemTheme() : t;
    setResolvedTheme(resolved);
    applyTheme(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

- [ ] **Step 2: Update `src/app/layout.tsx`**

Replace the entire file:

```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Layout from "@/components/Layout";
import { ThemeProvider } from "@/components/ThemeProvider";
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
    <html
      lang="zh-CN"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme:dark)").matches);if(d)document.documentElement.classList.add("dark")})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Install `geist` font package**

```bash
npm install geist
```

- [ ] **Step 4: Remove old font files**

```bash
rm -rf src/app/fonts
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: Build succeeds. Geist fonts load. Dark mode can be toggled by adding `.dark` to `<html>`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add ThemeProvider with system detection and flash prevention"
```

---

### Task 4: Layout — Navbar, Footer, Mobile Nav

**Files:**
- Modify: `src/components/Layout.tsx`
- Create: `src/components/MobileNav.tsx`

- [ ] **Step 1: Create `src/components/MobileNav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Star, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", icon: House, label: "首页" },
  { href: "/favorites", icon: Star, label: "收藏" },
  { href: "/settings", icon: Settings, label: "设置" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around h-14">
        {items.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Replace `src/components/Layout.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import MobileNav from "./MobileNav";

const navLinks = [
  { href: "/news/ai", label: "AI" },
  { href: "/news/embedded", label: "Embedded" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-bold text-lg tracking-tight"
          >
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              AI
            </span>
            nsight
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm transition-colors hover:text-foreground",
                  pathname.startsWith(href)
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/favorites"
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                pathname === "/favorites"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              <Star size={18} />
            </Link>
            <Link
              href="/settings"
              className={cn(
                "transition-colors hover:text-foreground",
                pathname === "/settings"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Settings size={18} />
            </Link>
          </div>

          {/* Mobile: just logo, bottom nav handles the rest */}
          <div className="md:hidden" />
        </div>
      </nav>

      <div className="flex-1 pb-14 md:pb-0">{children}</div>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span>© AInsight</span>
          <span>Powered by DeepSeek</span>
        </div>
      </footer>

      <MobileNav />
    </div>
  );
}
```

- [ ] **Step 3: Verify build and visual**

```bash
npm run build
```

Expected: Build succeeds. Navbar shows gradient logo, desktop nav links, footer visible. Mobile shows bottom nav bar.

- [ ] **Step 4: Commit**

```bash
git add src/components/Layout.tsx src/components/MobileNav.tsx
git commit -m "feat: redesign navbar with desktop nav, footer, and mobile bottom nav"
```

---

### Task 5: Landing Page Redesign

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/CategorySelector.tsx`

- [ ] **Step 1: Replace `src/components/CategorySelector.tsx`**

```tsx
import Link from "next/link";
import { Brain, Cpu, CircuitBoard, ArrowRight } from "lucide-react";

const categories = [
  {
    slug: "ai",
    name: "AI",
    description: "人工智能行业资讯",
    icon: Brain,
  },
  {
    slug: "embedded",
    name: "Embedded",
    description: "嵌入式系统行业资讯",
    icon: CircuitBoard,
  },
];

export default function CategorySelector() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
      {categories.map(({ slug, name, description, icon: Icon }) => (
        <Link
          key={slug}
          href={`/news/${slug}`}
          className="group block rounded-xl border border-border bg-card p-8 text-center transition-all hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700"
        >
          <Icon
            size={40}
            className="mx-auto mb-4 text-indigo-500"
            strokeWidth={1.5}
          />
          <h2 className="text-xl font-semibold text-card-foreground">
            {name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <ArrowRight
            size={16}
            className="mx-auto mt-4 text-muted-foreground transition-transform group-hover:translate-x-1"
          />
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Replace `src/app/page.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategorySelector from "@/components/CategorySelector";

export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const scrollToCategories = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom,rgba(129,140,248,0.06),transparent_70%)]" />

        <div className="animate-fade-in">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              AI
            </span>
            nsight
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg text-center sm:text-xl">
            AI & Embedded 行业资讯，每日自动聚合，中文摘要速览
          </p>
          <div className="mt-10 flex justify-center">
            <Button
              size="lg"
              onClick={scrollToCategories}
              className="rounded-full px-8"
            >
              What&apos;s New?
            </Button>
          </div>
        </div>

        <ChevronDown
          size={24}
          className="absolute bottom-8 text-muted-foreground animate-bounce"
        />
      </section>

      {/* Category Selection */}
      <section ref={sectionRef} className="py-20 px-4">
        <h2 className="text-center text-2xl font-bold tracking-tight mb-10">
          选择资讯类别
        </h2>
        <CategorySelector />
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Verify build and visual**

```bash
npm run build
```

Expected: Landing page shows gradient hero with "AI" in indigo gradient, centered CTA button, bounce chevron, category cards with Lucide icons.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/CategorySelector.tsx
git commit -m "feat: redesign landing page with gradient hero and icon category cards"
```

---

### Task 6: Article Card Redesign

**Files:**
- Modify: `src/components/ArticleCard.tsx`

- [ ] **Step 1: Replace `src/components/ArticleCard.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Star, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
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
    <article className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 animate-fade-in">
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
                ? "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400 scale-110"
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
        <ExternalLink size={14} className="inline ml-1 opacity-0 group-hover:opacity-100" />
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
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds. Article cards show source row, title, summary preview (2-line clamp), category badge.

- [ ] **Step 3: Commit**

```bash
git add src/components/ArticleCard.tsx
git commit -m "feat: redesign article card with source row, summary preview, and category badge"
```

---

### Task 7: News Feed Page — Remove Tabs, Add Skeleton

**Files:**
- Modify: `src/app/news/[category]/page.tsx`

- [ ] **Step 1: Replace `src/app/news/[category]/page.tsx`**

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import DateSelector from "@/components/DateSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { ArticleWithFavorite, Category } from "@/lib/types";

export default function NewsFeedPage({
  params,
}: {
  params: { category: Category };
}) {
  const { category } = params;
  const [articles, setArticles] = useState<ArticleWithFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const searchParams = new URLSearchParams({
      category,
      tab: "today",
      date,
    });

    const res = await fetch(`/api/articles?${searchParams}`);
    if (!res.ok) {
      console.error("Failed to fetch articles:", await res.json());
      setArticles([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setArticles(data.articles || []);
    setLoading(false);
  }, [category, date]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleToggleFavorite = async (
    articleId: string,
    isFavorited: boolean
  ) => {
    setArticles((prev) =>
      prev.map((a) =>
        a.id === articleId ? { ...a, is_favorited: !isFavorited } : a
      )
    );

    const method = isFavorited ? "DELETE" : "POST";
    const res = await fetch("/api/favorites", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_id: articleId }),
    });

    if (!res.ok) {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === articleId ? { ...a, is_favorited: isFavorited } : a
        )
      );
      console.error("Favorite toggle failed:", await res.json());
    }
  };

  const categoryLabel = category === "ai" ? "AI" : "Embedded";

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            切换分类
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mt-2">
            {categoryLabel} 资讯
          </h1>
        </div>

        {/* Date selector */}
        <div className="mb-6">
          <DateSelector selectedDate={date} onChange={setDate} />
        </div>

        {/* Article list */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2 mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">该日期暂无资讯</p>
            <Button variant="outline" onClick={() => setDate(new Date().toISOString().split("T")[0])}>
              回到今天
            </Button>
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

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: News feed shows skeleton loading, date selector, article cards with new design. No tabs.

- [ ] **Step 3: Commit**

```bash
git add src/app/news/\[category\]/page.tsx
git commit -m "feat: remove tabs from news feed, add skeleton loading and improved empty state"
```

---

### Task 8: Favorites Page — New Standalone Page

**Files:**
- Modify: `src/app/api/favorites/route.ts` (add GET handler)
- Create: `src/app/favorites/page.tsx`
- Modify: `src/lib/types.ts` (add FavoritesApiResponse type)

- [ ] **Step 1: Add GET handler to `src/app/api/favorites/route.ts`**

Add this function after the existing DELETE handler:

```ts
// GET: fetch all favorited articles
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Get favorites with article data via join
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
```

- [ ] **Step 2: Create `src/app/favorites/page.tsx`**

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Star } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ArticleWithFavorite } from "@/lib/types";

export default function FavoritesPage() {
  const [articles, setArticles] = useState<ArticleWithFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/favorites");
    if (!res.ok) {
      setArticles([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setArticles(data.articles || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleToggleFavorite = async (
    articleId: string,
    isFavorited: boolean
  ) => {
    if (!isFavorited) return; // Only allow unfavorite from this page

    // Optimistic: remove from list
    setArticles((prev) => prev.filter((a) => a.id !== articleId));

    const res = await fetch("/api/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_id: articleId }),
    });

    if (!res.ok) {
      // Revert on failure
      fetchFavorites();
      console.error("Unfavorite failed:", await res.json());
    }
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Star size={24} className="text-amber-500" />
          <h1 className="text-2xl font-bold tracking-tight">收藏</h1>
          {!loading && (
            <Badge variant="secondary">{articles.length}</Badge>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2 mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <Star size={48} className="mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-4">还没有收藏的文章</p>
            <Button variant="outline" asChild>
              <a href="/news/ai">去浏览资讯</a>
            </Button>
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

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: `/favorites` page loads, shows skeleton then articles or empty state. Unfavorite removes card from list.

- [ ] **Step 4: Commit**

```bash
git add src/app/favorites/page.tsx src/app/api/favorites/route.ts
git commit -m "feat: add standalone favorites page with GET API endpoint"
```

---

### Task 9: Settings Page Redesign

**Files:**
- Modify: `src/app/settings/page.tsx`

- [ ] **Step 1: Replace `src/app/settings/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sun, Moon, Monitor, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("deepseek_api_key") || "";
    setApiKey(storedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem("deepseek_api_key", apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const themeOptions = [
    { value: "light" as const, label: "浅色", icon: Sun },
    { value: "system" as const, label: "系统", icon: Monitor },
    { value: "dark" as const, label: "深色", icon: Moon },
  ];

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          返回首页
        </Link>

        <h1 className="text-2xl font-bold tracking-tight mb-6">设置</h1>

        <div className="space-y-6">
          {/* API Config */}
          <Card>
            <CardHeader>
              <CardTitle>API 配置</CardTitle>
              <CardDescription>
                DeepSeek API Key 用于生成中文摘要，仅存储在本地浏览器
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showKey ? "隐藏" : "显示"}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button onClick={handleSave} className="mt-4 w-full">
                {saved ? "已保存 ✓" : "保存设置"}
              </Button>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>外观</CardTitle>
              <CardDescription>选择主题偏好</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {themeOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm transition-all",
                      theme === value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>关于</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>AInsight v1.0</p>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                GitHub <ExternalLink size={12} />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Settings page shows 3 cards (API, Appearance, About). Theme 3-way toggle works. Password eye toggle works.

- [ ] **Step 3: Commit**

```bash
git add src/app/settings/page.tsx
git commit -m "feat: redesign settings page with shadcn cards and 3-way theme toggle"
```

---

### Task 10: DateSelector Style Update

**Files:**
- Modify: `src/components/DateSelector.tsx`

- [ ] **Step 1: Replace `src/components/DateSelector.tsx`**

```tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  selectedDate: string;
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
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={goBack} aria-label="前一天">
        <ChevronLeft size={16} />
      </Button>

      <Input
        type="date"
        value={selectedDate}
        max={today}
        onChange={(e) => onChange(e.target.value)}
        className="w-auto"
      />

      <Button
        variant="outline"
        size="icon"
        onClick={goForward}
        disabled={isToday}
        aria-label="后一天"
      >
        <ChevronRight size={16} />
      </Button>

      {!isToday && (
        <Button variant="ghost" size="sm" onClick={() => onChange(today)}>
          回到今天
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: DateSelector uses shadcn Button and Input, Lucide chevron icons.

- [ ] **Step 3: Commit**

```bash
git add src/components/DateSelector.tsx
git commit -m "feat: restyle DateSelector with shadcn components and Lucide icons"
```

---

### Task 11: Final Polish — Verify Dark Mode & Responsive

**Files:**
- All modified files (verification only)

- [ ] **Step 1: Start dev server and test**

```bash
npm run dev
```

Open http://localhost:3000 and verify:

1. **Landing page**: gradient hero, "AI" in indigo gradient, category cards with icons
2. **News feed**: skeleton loading, article cards with source row + badge + summary preview
3. **Favorites page**: standalone page with count badge, empty state
4. **Settings**: 3 cards, 3-way theme toggle, password eye toggle
5. **Dark mode**: toggle works, all text readable, no contrast issues
6. **Mobile** (< 768px): bottom nav visible, top nav simplified, no horizontal scroll
7. **Desktop** (≥ 768px): full top nav, no bottom nav, footer visible

- [ ] **Step 2: Test dark mode toggle flow**

1. Open settings, select "深色" → page goes dark
2. Select "浅色" → page goes light
3. Select "系统" → follows OS preference
4. Refresh page → theme persists (no flash)

- [ ] **Step 3: Test favorites flow**

1. Go to AI news, star an article
2. Navigate to /favorites → article appears
3. Unstar → article removed from list with fade animation

- [ ] **Step 4: Run build to verify no errors**

```bash
npm run build
```

Expected: Clean build, no TypeScript errors, no missing imports.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "fix: polish responsive layout and dark mode contrast"
```
