# 项目上下文

## 项目目标
ResLibs Unity 平台是一个自动化的 Unity 资源分享平台，实现从百度网盘到变现文件托管服务的内容聚合和分发。该平台为用户提供清洁的资源发现界面，为管理员提供简化的发布工作流程，通过高级文件托管佣金和网站广告产生收入。

## 技术栈
- **前端**: Next.js 14+ (App Router)、TypeScript、Tailwind CSS、Shadcn/UI
- **后端**: Next.js Server Actions、PostgreSQL、Prisma ORM、Clerk/NextAuth
- **自动化**: Python 3.11+、Google Gemini API、BaiduPCS-Go
- **部署**: Docker、Docker Compose、1Panel、Vercel
- **基础设施**: Linux VPS、Cloudflare R2

## 项目约定

### 代码风格
- 使用 TypeScript 严格模式和适当的类型定义
- 遵循 Prettier 配置以保持一致的格式
- 文件名使用 kebab-case，组件使用 PascalCase
- 实施 ESLint 规则以保证代码质量
- 使用约定式提交进行版本控制

### 架构模式
- **微服务**: 分离的 Web 前端和自动化机器人服务
- **API 优先**: 具有适当 HTTP 状态代码的 RESTful API
- **数据库**: 具有适当索引的关系设计
- **文件存储**: 图像使用对象存储，处理使用本地临时存储
- **错误处理**: 全面的错误日志记录和重试机制

### 测试策略
- 业务逻辑单元测试（Jest）
- API 端点集成测试
- 关键用户工作流端到端测试
- 文件处理操作性能测试
- 高流量场景负载测试

### Git 工作流
- **主分支**: 生产就绪代码
- **功能分支**: `feature/description` 命名约定
- **约定式提交**: `type(scope): description` 格式
- **拉取请求**: 所有更改都需要同行评审
- **自动化 CI**: 合并时的代码检查、测试和部署

## 领域上下文
- **Unity 资源**: Unity 游戏引擎的 3D 模型、纹理、脚本、工具
- **文件托管**: 如 Rapidgator、诚通、飞猫云等变现平台
- **SEO 优化**: 搜索引擎可见性的内容生成
- **资源处理**: 下载、解压、增强和分发工作流
- **用户体验**: 类似 koudaizy.com 的清洁、以资源为中心的界面

## 重要约束
- **成本效率**: 尽可能使用 API 的免费层（Gemini 免费层）
- **性能**: 高效处理大文件下载和上传
- **可靠性**: 外部服务故障的自动重试机制
- **安全性**: 适当的 API 密钥管理和文件验证
- **可扩展性**: 基于容器的部署以便于扩展
- **法律合规**: 尊重集成平台的服务条款

## 外部依赖
- **百度网盘**: 使用 BaiduPCS-Go 的源文件存储
- **Google Gemini API**: AI 驱动的内容生成（gemini-1.5-flash/pro）
- **文件托管 API**: Rapidgator (FTP)、诚通 (API/WebDAV)、飞猫云 (API)
- **Cloudflare R2**: 具有兼容 S3 API 的图像存储
- **1Panel**: 服务器管理和反向代理配置
- **Vercel**: Web 应用程序托管和 CI/CD
