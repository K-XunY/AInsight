# AInsight

AI & Embedded 行业资讯聚合平台，每日自动抓取 RSS、生成中文摘要。

## 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **数据库**: Supabase (PostgreSQL)
- **AI 摘要**: DeepSeek API
- **数据管道**: GitHub Actions (每日 22:50 UTC 触发)
- **部署**: Vercel

## 本地开发

1. 克隆仓库
2. 复制 `.env.local.example` 为 `.env.local`，填入真实密钥
3. 安装依赖: `npm install`
4. 启动开发服务器: `npm run dev`
5. 打开 http://localhost:3000

## 环境变量

| 变量 | 用途 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务密钥 (仅 GitHub Actions) |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 (仅 GitHub Actions) |

## 数据库设置

1. 在 [Supabase](https://supabase.com) 创建项目
2. 在 SQL Editor 中运行 `supabase/schema.sql`
3. 在 SQL Editor 中运行 `supabase/rls.sql`

## 部署

### Vercel

1. 将仓库推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 添加环境变量: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 部署

### GitHub Actions

1. 在 GitHub 仓库 Settings -> Secrets 中添加:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DEEPSEEK_API_KEY`
2. 工作流会每天 22:50 UTC (北京时间 6:50) 自动运行
