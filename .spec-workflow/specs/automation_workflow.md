# Automation Workflow Specification

## 任务名称: `process_unity_asset`

该任务由 Python CLI 触发，旨在自动化处理单个或批量 Unity 资源。

### 步骤 1: 资源获取 (Ingestion)
1.  **输入**: 管理员输入百度网盘分享链接 (Share Link) 和提取码 (Pwd)。
2.  **解析**: 脚本调用 `BaiduPCS` 工具获取文件列表。
3.  **下载**: 将文件下载到本地临时目录 `./temp/download/`。
4.  **预处理**:
    * 如果是压缩包 (`.zip`, `.rar`, `.7z`, `.unitypackage`)，尝试读取文件列表或解压预览图。
    * 提取文件名中的关键词（如 "Low Poly Shooter Pack v3.0"）。

### 步骤 2: 内容生成 (AI Content Gen)
调用 LLM (Gemini/Claude) API，Prompt 如下：
* **Input**: 文件名、解压出的 Readme 内容(如有)、文件目录结构。
* **Task**:
    1.  生成一个 SEO 友好的**标题** (英文 + 中文)。
    2.  生成一段 300 字左右的**详细描述** (Markdown 格式)，介绍该 Unity 资源的功能、适用场景。
    3.  提取或生成 3-5 个**标签 (Tags)**。
* **Output**: JSON 格式数据。

### 步骤 3: 分发转存 (Distribution)
1.  **重打包**: (可选) 将资源添加网站宣传文本 (`READ_ME_RESLIBS.txt`) 后重新压缩。
2.  **上传**:
    * **国内渠道**: 上传至 诚通网盘/飞猫云 (使用 API 或 模拟登录)。
    * **国外渠道**: 上传至 Rapidgator/Turbobit (建议通过 FTP 或 Rclone)。
3.  **链接聚合**: 获取上传后的下载链接 (Public URLs)。
4.  **短链接处理**: (可选) 调用 bit.ly 或自建短链服务。

### 步骤 4: 网站发布 (Publishing)
1.  **图片处理**: 将提取的预览图上传至对象存储 (如 R2, AWS S3) 并获取 URL。
2.  **写入数据库**: 通过 Prisma 或 API，在 CMS 中创建新的 `Post`。
    * Title: AI 生成的标题
    * Content: AI 生成的描述 + 预览图 URL
    * Download Links: 步骤 3 获取的网赚盘链接
    * Status: Draft (草稿) 或 Published (直接发布)
3.  **清理**: 删除本地临时文件。

### 异常处理
* 如果百度网盘下载失败（验证码/限速），需重试或报警。
* 如果解压失败，标记为“损坏资源”。