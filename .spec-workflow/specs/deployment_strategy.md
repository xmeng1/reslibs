# Deployment Strategy

## 1. 基础设施概览 (Infrastructure)
* **OS**: Linux VPS
* **Panel**: 1Panel (用于管理反向代理、SSL、数据库和系统监控)
* **Database**: PostgreSQL (已通过 1Panel 安装)
* **Containerization**: Docker & Docker Compose
* **Domain**: `unity.reslibs.com`

## 2. 服务架构 (Service Architecture)
我们将通过 `docker-compose.yml` 定义两个核心服务：

1.  **`web` (Next.js Frontend & Backend)**:
    * 提供网站 UI 和 API 接口。
    * 生产环境通过 1Panel 反向代理接入。
    * 测试环境直接暴露端口访问。
2.  **`bot` (Python Automation Worker)**:
    * 后台运行的 Python 脚本。
    * 执行长耗时任务：百度下载 -> AI 处理 -> 网盘上传 -> 数据库写入。
    * 与 `web` 共享数据库和存储卷 (Volume)。

## 3. 环境区分方案

### A. 生产环境 (Production)
* **URL**: `https://unity.reslibs.com`
* **部署方式**: `docker compose up -d`
* **网络流**: User -> 1Panel (Nginx/OpenResty) -> localhost:3000 (Docker)
* **配置**:
    * 1Panel 网站设置中，“反向代理”指向 `127.0.0.1:3000`。
    * `NODE_ENV=production`

### B. 测试/预览环境 (Staging/Test)
* **URL**: `http://unity.reslibs.com:3001` (或 IP:3001)
* **部署方式**: 修改端口映射或启动单独的测试容器。
* **配置**:
    * 直接暴露端口 `3001` 到公网。
    * 用于验证新功能或调试。
    * 测试数据库使用 SQLite

## 4. Docker Compose 配置规范
Claude Code 需根据以下结构生成 `docker-compose.yml`：

```yaml
services:
  # 网站服务
  web:
    build: .
    container_name: reslibs-web
    restart: always
    ports:
      - "3000:3000" # 生产端口 (配合 1Panel 反代)
      # - "3001:3000" # 测试时开启此行
    env_file: .env
    volumes:
      - ./public/uploads:/app/public/uploads # 持久化图片

  # 自动化机器人 (单独运行)
  bot:
    build: 
      context: .
      dockerfile: Dockerfile.bot
    container_name: reslibs-bot
    restart: unless-stopped
    env_file: .env
    volumes:
      - ./temp_downloads:/app/temp # 临时下载目录
      - ./public/uploads:/app/uploads # 图片保存目录
      # 挂载 Rclone 配置或相关凭证
      - ~/.config/rclone:/root/.config/rclone 
    # Bot 不需要暴露端口，只需连接外网和数据库