# AInsight UI Redesign — Design Spec

## Overview

AInsight 的 UI 全面升级。当前界面功能完整但视觉平淡：无设计系统、暗色模式损坏、无组件库、字体未加载、缺少动画和空状态处理。

本次重做目标：引入 shadcn/ui 组件库 + 靛蓝/紫配色 + Geist 字体，修复暗色模式，统一所有页面的视觉语言，打造现代极简风格的资讯阅读体验。

## Design Decisions

| 决策 | 选择 | 理由 |
|------|------|------|
| 视觉风格 | 现代极简 | 资讯阅读产品，内容优先，克制设计 |
| 主色调 | 靛蓝/紫 (Indigo) | 科技感、独特性，区分 AI 和 Embedded 两个板块 |
| 组件库 | shadcn/ui | 质量高、可访问性好、暗色模式原生支持 |
| 字体 | Geist Sans + Geist Mono | 项目已有文件，现代无衬线，Vercel 出品 |
| 暗色模式 | CSS 变量 + `.dark` class | shadcn/ui 标准方案，修复当前损坏的实现 |
| 范围 | 全部页面 | 保证视觉一致性 |

## Design System

### Colors (CSS Variables)

**浅色模式 (`:root`)**
```css
--background: 0 0% 100%;           /* white */
--foreground: 240 10% 3.9%;        /* zinc-900 */
--card: 0 0% 100%;                 /* white */
--card-foreground: 240 10% 3.9%;   /* zinc-900 */
--primary: 239 84% 67%;            /* indigo-600 #4F46E5 */
--primary-foreground: 0 0% 100%;   /* white */
--secondary: 240 4.8% 95.9%;       /* zinc-100 */
--secondary-foreground: 240 5.9% 10%; /* zinc-900 */
--muted: 240 4.8% 95.9%;           /* zinc-100 */
--muted-foreground: 240 3.8% 46.1%; /* zinc-500 */
--accent: 240 4.8% 95.9%;          /* zinc-100 */
--accent-foreground: 240 5.9% 10%; /* zinc-900 */
--destructive: 0 84.2% 60.2%;     /* red-500 */
--border: 240 5.9% 90%;            /* zinc-200 */
--input: 240 5.9% 90%;             /* zinc-200 */
--ring: 239 84% 67%;               /* indigo-600 */
--radius: 0.75rem;
```

**暗色模式 (`.dark`)**
```css
--background: 240 10% 3.9%;        /* zinc-950 */
--foreground: 0 0% 98%;            /* zinc-50 */
--card: 240 10% 3.9%;              /* zinc-900 */
--card-foreground: 0 0% 98%;       /* zinc-50 */
--primary: 239 84% 77%;            /* indigo-400 #818CF8 */
--primary-foreground: 240 10% 3.9%; /* zinc-950 */
--secondary: 240 3.7% 15.9%;       /* zinc-800 */
--secondary-foreground: 0 0% 98%;  /* zinc-50 */
--muted: 240 3.7% 15.9%;           /* zinc-800 */
--muted-foreground: 240 5% 64.9%;  /* zinc-400 */
--accent: 240 3.7% 15.9%;          /* zinc-800 */
--accent-foreground: 0 0% 98%;     /* zinc-50 */
--destructive: 0 62.8% 30.6%;     /* red-900 */
--border: 240 3.7% 15.9%;          /* zinc-800 */
--input: 240 3.7% 15.9%;           /* zinc-800 */
--ring: 239 84% 77%;               /* indigo-400 */
```

### Semantic Colors (Component-Level)

| Token | 浅色 | 暗色 | 用途 |
|-------|------|------|------|
| favorite | `amber-500` | `amber-400` | 收藏星标 |
| category-ai | `indigo-600` | `indigo-400` | AI 分类 badge |
| category-embedded | `violet-600` | `violet-400` | Embedded 分类 badge |
| success | `emerald-600` | `emerald-400` | 保存成功等 |

### Typography

- **Heading**: Geist Sans, weight 600-700
- **Body**: Geist Sans, weight 400
- **Mono/Metadata**: Geist Mono, weight 400
- **Base size**: 16px
- **Line height**: 1.5 (body), 1.25 (headings)
- **Letter spacing**: `tracking-tight` for headings

### Spacing & Radius

- Spacing scale: 4px base (shadcn/ui default)
- Card radius: `rounded-xl` (12px)
- Button radius: `rounded-lg` (8px) or `rounded-full` (pill)
- Badge radius: `rounded-full`
- Container: `max-w-4xl mx-auto px-4 sm:px-6`

## Layout & Navigation

### Navbar

- Sticky top, `backdrop-blur-xl`, border-bottom
- Height: `h-14`
- Left: AInsight logo (Geist Sans 700, indigo gradient on "AI")
- Right (desktop): 分类链接 (AI / Embedded) + 收藏链接 (Star icon, 带数量角标, → `/favorites`) + 设置齿轮
- Right (mobile): logo + hamburger menu icon
- Mobile menu: slide-in panel with 分类 + 收藏 + 设置

### Page Container

All pages use: `max-w-4xl mx-auto px-4 sm:px-6 py-6`
Landing hero: full-width centered, exception to max-width rule.

### Footer (New)

- `border-t` separator
- Left: © AInsight
- Right: GitHub link + "Powered by DeepSeek"
- Style: `text-sm text-muted-foreground`

### Mobile Bottom Navigation (< 768px)

Fixed bottom bar with 3 items:
- 首页 (House icon)
- 收藏 (Star icon)
- 设置 (Settings icon)

Visible only on mobile. Hidden on `md:` and above.

## Pages

### Landing Page (`/`)

**Hero:**
- Background: white/zinc-50 with subtle indigo→violet radial gradient (5-10% opacity) at bottom
- Title: "AInsight", Geist Sans 700, `text-5xl sm:text-6xl lg:text-7xl`, `tracking-tight`. "AI" letters have indigo gradient (`bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent`)
- Subtitle: Chinese tagline, `text-lg sm:text-xl text-muted-foreground`, `max-w-lg` centered
- CTA: shadcn/ui Button, `size="lg"`, indigo, `rounded-full`, subtle hover scale

**Category Cards (scroll target):**
- 2-column grid (`sm:grid-cols-2`), `gap-6`, `max-w-2xl mx-auto`
- shadcn/ui Card component
- Top: large Lucide icon (Brain/Cpu for AI, CircuitBoard for Embedded), `text-indigo-500`, `size={40}`
- Title: `text-xl font-semibold`
- Description: one-line summary
- Bottom: arrow hint, `group-hover:translate-x-1` on hover
- Hover: `shadow-lg`, border → `indigo-300` (light) / `indigo-700` (dark)

**Entrance Animation:**
- Hero content: fade-in + slide-up from below, stagger 100ms
- Category cards: staggered entrance, 100ms delay between cards
- Respect `prefers-reduced-motion`

### News Feed (`/news/[category]`)

**Page Header:**
- Category title (AI / Embedded) + date, `text-2xl font-bold`
- DateSelector: styled with shadcn/ui buttons and input
- No tabs — this page now only shows today's/historical articles

**Loading State:**
- 3-5 Skeleton cards (shadcn/ui Skeleton), simulating title + metadata + summary lines

**Empty State:**
- Centered icon + message + action button
- Date empty: "该日期暂无资讯" + "回到今天" button

### Favorites Page (`/favorites`) — New

独立收藏页，汇总所有分类的收藏文章。

**Page Header:**
- Title: "收藏", `text-2xl font-bold`, Star icon
- Count badge: 显示收藏总数, shadcn/ui Badge
- Category filter (optional): 两个 toggle 按钮 "AI" / "Embedded"，默认全部显示

**Content:**
- 复用 ArticleCard 组件，显示分类 badge 区分来源
- 按收藏时间倒序排列
- 取消收藏后卡片淡出移除

**Empty State:**
- 大号 Star 图标 (outline), `text-muted-foreground`
- "还没有收藏的文章"
- "去浏览资讯" button → 跳转到 `/news/ai`

**Loading State:**
- Skeleton 卡片 ×3

**API:**
- 需要新的 API 端点或扩展现有 `/api/articles` 支持无分类过滤的收藏查询
- 返回格式与文章列表一致，附加 `favoritedAt` 字段用于排序

### Article Card

```
┌─────────────────────────────────────────┐
│  [source_icon]  TechCrunch   2小时前   ★ │
│                                         │
│  OpenAI 发布 GPT-5：多模态能力再次突破    │
│                                         │
│  OpenAI 宣布推出新一代大语言模型...       │
│  [展开摘要]                              │
│                                         │
│  ┌─────┐                                │
│  │ AI  │                                │
│  └─────┘                                │
└─────────────────────────────────────────┘
```

- **Row 1**: Source icon/favicon + source name (`text-sm text-muted-foreground`) + relative time + favorite star (right)
- **Title**: `text-lg font-semibold`, hover → `text-indigo-600` (light) / `text-indigo-400` (dark), clickable → original article
- **Summary preview**: `line-clamp-2` by default, click "展开摘要" to show full text (replaces current hide-by-default)
- **Category badge**: small pill, AI = indigo, Embedded = violet, `text-xs rounded-full px-2 py-0.5`
- **Card style**: `rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800`
- **Entrance animation**: staggered fade-in, 50ms per card

**Favorite Interaction:**
- Star: outline → filled animation (`scale-125 → scale-100` spring bounce)
- Dark mode: `amber-400`

### Settings Page (`/settings`)

Grouped in shadcn/ui Cards:

**API 配置 Card:**
- DeepSeek API Key input (shadcn/ui Input, `type="password"`)
- Eye icon toggle for show/hide
- Helper text: purpose and storage explanation

**外观 Card:**
- Theme toggle group (shadcn/ui ToggleGroup): 浅色 (Sun) / 系统 (Monitor) / 深色 (Moon)
- Default: "系统" (follow OS preference)
- Stored in localStorage key `theme`

**关于 Card:**
- Version: AInsight v1.0
- GitHub link with ExternalLink icon
- Copyright

## Dark Mode Implementation

### Bug Fix

Current: settings page toggles `.dark` class on `<html>`, but CSS uses `@media (prefers-color-scheme)`.
Fix: CSS variables defined in `:root` and `.dark` selectors. JS toggles `.dark` class. System mode listens to `prefers-color-scheme` change event.

### Theme Persistence

- localStorage key: `theme`
- Values: `"light" | "dark" | "system"`
- Default: `"system"`

### Flash Prevention

Inline script in `<head>` of `layout.tsx`:
```js
(function() {
  var t = localStorage.getItem('theme') || 'system';
  var d = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme:dark)').matches);
  if (d) document.documentElement.classList.add('dark');
})();
```

## Animations

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Hero content | fade-in + slide-up | 300ms | ease-out |
| Category cards | staggered fade-in | 200ms each, 100ms stagger | ease-out |
| Article cards | staggered fade-in | 200ms each, 50ms stagger | ease-out |
| Favorite star | scale bounce (1.25→1.0) | 200ms | spring |
| Favorites card remove | fade-out + collapse | 200ms | ease-out |
| Card hover | shadow + border transition | 150ms | ease-out |
| Skeleton | shimmer gradient | 1.5s | linear infinite |
| Summary expand | height auto transition | 200ms | ease-out |

All animations wrapped in `motion-safe:` or check `prefers-reduced-motion`. When reduced, use simple opacity toggle.

## Icon System

**Library**: Lucide React (shadcn/ui default)

| Icon | Usage |
|------|-------|
| `House` | 首页导航 |
| `Star` / `StarFilled` | 收藏 |
| `Settings` | 设置 |
| `Menu` / `X` | 移动端菜单 |
| `ExternalLink` | 外部链接 |
| `ChevronDown` / `ChevronUp` | 摘要展开/收起 |
| `ChevronLeft` / `ChevronRight` | 日期导航 |
| `Sun` / `Moon` / `Monitor` | 主题切换 |
| `Eye` / `EyeOff` | 密码显示/隐藏 |
| `Brain` / `Cpu` | AI 分类 |
| `CircuitBoard` | Embedded 分类 |
| `Bookmark` | 收藏操作 |

Style: `size={18}` or `size={20}`, consistent stroke-width.

## shadcn/ui Components

| Component | Usage |
|-----------|-------|
| `Button` | CTA, action buttons |
| `Card` | Article cards, settings groups, category cards |
| `Tabs` | 今日/收藏 switch |
| `Input` | API Key field |
| `ToggleGroup` | Theme 3-way selector |
| `Skeleton` | Loading state |
| `Badge` | Category tags |
| `Tooltip` | Icon hints |
| `Sheet` | Mobile nav drawer |

## Responsive Breakpoints

| Breakpoint | Width | Changes |
|------------|-------|---------|
| default (mobile) | < 640px | Single column, bottom nav visible, hamburger menu |
| `sm` | ≥ 640px | Category grid 2 columns |
| `md` | ≥ 768px | Bottom nav hidden, full top nav |
| `lg` | ≥ 1024px | No changes (content width sufficient) |

## Anti-Patterns to Avoid

- Emoji as icons (use Lucide SVG)
- Hardcoded colors in components (use CSS variables)
- Placeholder-only form labels
- Hover-only interactions (ensure tap works)
- Animations > 500ms
- Pure `#000000` background in dark mode (use zinc-950)
- Ignoring `prefers-reduced-motion`
- Inconsistent container widths across pages

## Files to Modify

| File | Changes |
|------|---------|
| `tailwind.config.ts` | Add shadcn/ui theme config, font families |
| `src/app/globals.css` | Replace with shadcn/ui CSS variables |
| `src/app/layout.tsx` | Load Geist fonts, add flash-prevention script, add footer |
| `src/app/page.tsx` | Redesign hero + category cards |
| `src/app/news/[category]/page.tsx` | Remove tabs (favorites moved to standalone page), Skeleton loading, improved empty states |
| `src/app/settings/page.tsx` | shadcn Cards, ToggleGroup, 3-way theme |
| `src/components/Layout.tsx` | New navbar design, mobile menu |
| `src/components/ArticleCard.tsx` | Redesign with badge, improved summary, animations |
| `src/components/CategorySelector.tsx` | shadcn Card, icons, hover effects |
| `src/components/DateSelector.tsx` | Style with shadcn components |

## New Files

| File | Purpose |
|------|---------|
| `src/app/favorites/page.tsx` | 独立收藏页，汇总所有分类收藏 |
| `src/components/MobileNav.tsx` | Mobile bottom navigation |
| `src/components/ThemeProvider.tsx` | Theme context + localStorage sync |
| `src/lib/utils.ts` | shadcn/ui `cn()` utility |
| `components/ui/*` | shadcn/ui components (auto-generated by `npx shadcn@latest add`) |
