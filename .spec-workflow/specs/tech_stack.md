# Technology Stack

## 1. 前端 (Web Frontend)
* **Framework**: Next.js 14+ (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS (模仿资源站的简洁风格)
* **UI Components**: Shadcn/UI
* **Icons**: Lucide React

## 2. 后端 (Web Backend / API)
* **Framework**: Next.js Server Actions (轻量级) 或 NestJS (如果逻辑复杂)
* **Database**: PostgreSQL (Supabase 或 Neon), 测试环境用 SQLite
* **ORM**: Prisma
* **Auth**: Clerk 或 NextAuth

## 3. 自动化机器人 (Auto-Bot CLI)
* **Language**: Python 3.11+
* **AI Service (Critical Update)**:
    * **Service**: **Google Gemini API** (Model: `gemini-1.5-flash` or `gemini-1.5-pro`).
    * **Tier**: Free Tier (Pay-as-you-go disabled).
    * **Justification**: 它是免费的 (每日 1500 次请求)，支持长文本 (Context Window)，且作为标准 API 极其稳定，适合无人值守的自动化脚本。
    * **Library**: `google-generativeai` (Python SDK).

## 4. 部署 (Deployment)
* **Frontend/Backend**: Vercel
* **Worker Server**: 本地高性能 PC 或大带宽 VPS (用于运行 Python 自动化脚本进行大文件吞吐)