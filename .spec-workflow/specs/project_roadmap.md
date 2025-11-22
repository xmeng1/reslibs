# Project Roadmap (Spiral Model)

本项目采用螺旋模型开发，分为四个周期 (Cycles)。每个周期结束都必须产出一个可运行、可验证的版本。

## Cycle 1: 静态原型与数据跑通 (The Skeleton)
**目标**: 搭建 Next.js 框架，完成高保真前端页面，并手动验证“百度下载->处理”流程。

* **Phase 1.1: 脚手架与 UI 复刻**
    * [ ] 初始化 Next.js + Tailwind + Shadcn/UI 项目。
    * [ ] **核心任务**: 根据 `koudaizy.com` 的布局，编写首页 (Home) 和 详情页 (Post Detail) 的静态 HTML/CSS。
    * [ ] 实现响应式布局 (Mobile/Desktop)。
    * [ ] 建立 Prisma 数据库 Schema (User, Post, Category)。
* **Phase 1.2: 本地 Python 脚本原型**
    * [ ] 编写 Python 脚本，实现 `BaiduPCS` 的简单调用（列出文件、下载文件）。
    * [ ] 编写 Python 脚本，测试 Gemini API (Free Tier) 的连通性，确保能生成内容。
* **Deliverable**: 一个只有静态数据的网站，和一个能下载文件、能对话 AI 的 Python 脚本片段。

## Cycle 2: 核心自动化链路 (The Engine)
**目标**: 将 Python 脚本串联，实现“输入链接 -> 数据库有文章”的闭环。

* **Phase 2.1: 完善 Python 机器人 (Auto-Bot)**
    * [ ] 实现 `Monitor` 模块：读取待处理列表。
    * [ ] 实现 `Processor` 模块：下载 -> 解压 -> 提取元数据。
    * [ ] 实现 `Generator` 模块：集成 Gemini API 生成 Title/Description。
    * [ ] 实现 `Publisher` 模块：将生成的数据写入 PostgreSQL 数据库。
* **Phase 2.2: 前后端联调**
    * [ ] Next.js 连接数据库，将 Python 写入的数据真实展示在网页上。
    * [ ] 实现前端的“搜索”与“分类筛选”功能。
* **Deliverable**: 输入百度链接，脚本跑完后，刷新网页能看到带有 AI 介绍的文章（此时下载链接可先填假数据）。

## Cycle 3: 网赚盘分发与商业化 (The Business)
**目标**: 接入网赚盘上传接口，替换真实的下载链接。

* **Phase 3.1: 多网盘上传集成**
    * [ ] 集成 `Rclone` 或编写专门的上传模块（针对 Rapidgator/诚通）。
    * [ ] 实现上传重试机制（网盘上传容易失败）。
    * [ ] 自动获取上传后的 Public Link。
* **Phase 3.2: 链接注入与短链**
    * [ ] 修改 Python 脚本，将网赚盘链接更新到数据库。
    * [ ] 前端详情页增加“下载部分”的样式美化（引导用户点击）。
* **Deliverable**: 全自动流水线。从百度网盘到网站前台展示真实可赚钱的下载链接。

## Cycle 4: 运营优化与维护 (Polishing)
**目标**: SEO 优化，防爬虫，以及后台管理界面。

* **Phase 4.1: SEO 增强**
    * [ ] 生成 Sitemap.xml。
    * [ ] 优化 Meta Tags (OpenGraph, Twitter Card)。
* **Phase 4.2: 简单的 Admin Dashboard**
    * [ ] 增加一个简单的网页后台，用于管理员手动输入百度链接，查看任务状态。
* **Deliverable**: 生产环境就绪的完整系统。