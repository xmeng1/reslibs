# ResLibs 管理后台使用指南

## 项目概述

ResLibs 是一个通用的资源分享平台，支持多种类型的资源管理，包括 Unity Assets、软件工具、设计素材、视频课程等。本项目基于 Next.js 14 构建，采用现代化的技术栈，提供完整的后台管理功能。

## 技术架构

### 前端技术栈
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI组件**: Shadcn/UI
- **图标**: Lucide React
- **状态管理**: React Context

### 后端技术栈
- **API**: Next.js API Routes
- **数据库**: PostgreSQL (生产) / SQLite (开发)
- **ORM**: Prisma
- **认证**: JWT + bcryptjs
- **验证**: Zod

## 环境配置

### 1. 安装依赖
```bash
npm install
```

### 2. 环境变量配置
复制 `.env.example` 到 `.env` 并配置以下变量：

```env
# 数据库配置
DATABASE_URL="postgresql://user:password@localhost:5432/reslibs?schema=public"

# NextAuth 配置
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# 管理员账户（初始化用）
ADMIN_EMAIL="admin@reslibs.com"
ADMIN_PASSWORD="admin123456"

# 文件上传配置
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE="100MB"

# 其他配置
NODE_ENV="development"
```

### 3. 数据库初始化
```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma db push

# 运行种子数据初始化
npx prisma db seed
```

### 4. 启动开发服务器
```bash
npm run dev
```

## 功能模块

### 1. 认证系统

#### 登录功能
- **访问路径**: `/admin/login`
- **默认账户**:
  - 用户名: `admin`
  - 密码: `admin123456`
- **功能特性**:
  - JWT 令牌认证
  - 密码哈希存储
  - 会话管理
  - 自动登出机制

#### 权限控制
- 所有管理页面都需要认证
- 前端路由守卫
- API 接口保护
- 活动日志记录

### 2. 管理后台仪表板

#### 功能概览
- **访问路径**: `/admin/dashboard`
- **主要功能**:
  - 系统统计数据展示
  - 快速操作入口
  - 最近活动记录
  - 待处理事项提醒

#### 统计数据
- 总资源数量
- 已发布资源数量
- 总下载量
- 总浏览量

#### 快速操作
- 资源管理
- 添加新资源
- 分类管理
- 活动日志查看

### 3. 资源管理

#### 资源列表
- **访问路径**: `/admin/resources`
- **功能特性**:
  - 分页显示
  - 搜索功能
  - 状态筛选（已发布/草稿/已归档）
  - 批量操作支持
  - 快速编辑和删除

#### 资源信息
- 基本信息：标题、描述、缩略图
- 分类和标签管理
- 下载链接配置
- 元数据设置
- SEO 信息优化

#### 支持的资源类型
- **Unity Assets**: 游戏开发资源
- **软件工具**: 各类软件和工具
- **设计素材**: UI 设计和创意素材
- **视频课程**: 教学视频和在线课程

### 4. API 接口

#### 认证接口
- `POST /api/auth/login` - 管理员登录
- `POST /api/auth/logout` - 退出登录
- `GET /api/auth/me` - 获取当前用户信息

#### 资源管理接口
- `GET /api/admin/resources` - 获取资源列表
- `POST /api/admin/resources` - 创建新资源
- `GET /api/admin/resources/[id]` - 获取资源详情
- `PUT /api/admin/resources/[id]` - 更新资源
- `DELETE /api/admin/resources/[id]` - 删除资源

#### 配置管理接口
- `GET /api/admin/types` - 获取资源类型
- `GET /api/admin/categories` - 获取分类列表
- `GET /api/admin/tags` - 获取标签列表

## 数据库设计

### 核心实体

#### 资源实体 (Resource)
- 基本信息：标题、描述、缩略图
- 状态管理：草稿、已发布、已归档
- 元数据：JSON 格式的扩展信息
- 关联关系：类型、分类、标签、下载链接

#### 资源类型 (ResourceType)
- 类型定义和配置
- 文件扩展名支持
- 默认元数据字段
- 处理规则配置

#### 分类 (Category)
- 层级分类结构
- 支持多类型资源
- SEO 友好的 URL

#### 标签 (Tag)
- 多维度标签系统
- 类型适用性
- 权重排序

#### 管理员用户 (AdminUser)
- 用户认证信息
- 角色权限管理
- 登录统计

#### 活动日志 (ActivityLog)
- 操作记录追踪
- 详细操作信息
- 审计支持

## 开发指南

### 项目结构
```
src/
├── app/                    # Next.js App Router 页面
│   ├── admin/             # 管理后台页面
│   ├── api/               # API 路由
│   └── (pages)/           # 前台页面
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   └── AdminProtected.tsx # 认证保护组件
├── contexts/             # React Context
│   └── AuthContext.tsx   # 认证上下文
├── lib/                  # 工具库
│   └── prisma.ts         # 数据库客户端
└── types/                # TypeScript 类型定义
```

### 添加新功能

#### 1. 创建新的 API 路由
```typescript
// src/app/api/admin/new-feature/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = await authenticate(request)
  // 业务逻辑实现
}
```

#### 2. 创建新的管理页面
```tsx
// src/app/admin/new-feature/page.tsx
'use client'
import AdminProtected from '@/components/AdminProtected'

export default function NewFeaturePage() {
  return (
    <AdminProtected>
      {/* 页面内容 */}
    </AdminProtected>
  )
}
```

### 数据库迁移
```bash
# 修改 schema.prisma 后
npx prisma db push

# 或者生成迁移文件
npx prisma migrate dev --name migration-name
```

## 部署指南

### 1. 构建项目
```bash
npm run build
```

### 2. 生产环境配置
- 配置生产数据库连接
- 设置环境变量
- 配置域名和 HTTPS
- 设置备份策略

### 3. 数据库迁移
```bash
# 生产环境数据库迁移
npx prisma migrate deploy
```

## 安全考虑

### 1. 认证安全
- JWT 令牌定期刷新
- 密码强度要求
- 登录失败限制
- 会话超时管理

### 2. API 安全
- 请求频率限制
- 输入验证和清理
- CORS 配置
- HTTPS 强制使用

### 3. 数据安全
- 敏感信息加密
- 数据库访问控制
- 定期备份
- 操作日志审计

## 故障排除

### 常见问题

#### 1. 数据库连接失败
- 检查 DATABASE_URL 配置
- 确认数据库服务状态
- 验证网络连接

#### 2. 认证失败
- 检查 JWT_SECRET 配置
- 确认令牌有效期
- 验证时间同步

#### 3. 构建错误
- 清理 node_modules 重新安装
- 检查 TypeScript 类型错误
- 验证依赖版本兼容性

### 调试技巧

#### 1. 开发环境调试
```bash
# 启用详细日志
DEBUG=* npm run dev

# Prisma 查询调试
npx prisma studio
```

#### 2. 数据库调试
```bash
# 查看数据库状态
npx prisma db status

# 重置数据库
npx prisma migrate reset
```

## 维护指南

### 定期任务
- 数据库备份
- 日志清理
- 性能监控
- 安全更新

### 监控指标
- API 响应时间
- 数据库查询性能
- 用户访问统计
- 错误率监控

## 技术支持

如有问题，请：
1. 查看日志文件
2. 检查配置文件
3. 参考故障排除指南
4. 提交 Issue 或联系技术支持

## 更新日志

### v1.0.0 (2025-01-XX)
- ✅ 完成基础架构搭建
- ✅ 实现管理员认证系统
- ✅ 开发资源管理功能
- ✅ 创建管理后台界面
- ✅ 添加数据库设计和初始化
- ⏳ 待完成：前台用户界面
- ⏳ 待完成：E2E 测试覆盖
- ⏳ 待完成：部署文档优化

---

**注意**: 本文档随项目更新持续完善，请定期查看最新版本。