# ResLibs 百度网盘自动化脚本

一个完整的百度网盘资源自动化处理系统，实现从文件下载到内容生成、图片处理、平台上传的全流程自动化。

## 🚀 功能特性

### 核心功能
- **文件获取**: 自动从百度网盘按时间顺序遍历文件
- **智能下载**: 支持大文件、断点续传、多线程下载
- **AI内容生成**: 使用 Gemini API 自动生成SEO友好的标题、描述和标签
- **图片处理**: 自动搜索相关图片并上传到图床
- **多平台上传**: 支持RapidGator、Turbobit、FileCat等付费下载平台
- **数据存储**: 自动存储到SQLite数据库，方便前端展示
- **试运行模式**: 支持模拟运行，无需真实API调用

### 支持的资源类型
- Unity Assets (`.unitypackage`, `.unity`)
- 软件工具 (`.exe`, `.msi`, `.dmg`, `.pkg`)
- 设计素材 (`.psd`, `.ai`, `.sketch`)
- 视频教程 (`.mp4`, `.avi`, `.mov`)
- 音频资源 (`.mp3`, `.wav`, `.flac`)
- 3D模型 (`.fbx`, `.obj`, `.blend`)
- 文档资料 (`.pdf`, `.epub`)
- 压缩包 (`.zip`, `.rar`, `.7z`)

## 📋 安装和配置

### 1. 环境要求
- Python 3.8+
- 虚拟环境支持
- 足够的磁盘空间用于临时文件

### 2. 创建虚拟环境
```bash
cd /path/to/reslibs
python3 -m venv automation/venv
source automation/venv/bin/activate  # Linux/macOS
# 或 automation\venv\Scripts\activate  # Windows
```

### 3. 安装依赖
```bash
# 基础依赖
pip install python-dotenv requests rich

# 完整依赖（可选，根据需要安装）
pip install google-generativeai  # AI内容生成
pip install boto3                 # Cloudflare R2
pip install pillow                # 图片处理
pip install sqlalchemy            # 数据库支持
```

### 4. 配置环境变量
```bash
# 复制配置模板
cp .env.automation.example .env.automation

# 编辑配置文件，填入真实的API密钥和配置
nano .env.automation
```

## ⚙️ 配置说明

### 必需配置
```env
# 数据库配置
DATABASE_URL="sqlite:///./data/automation.db"  # 或 PostgreSQL

# AI 内容生成
GEMINI_API_KEY="your-gemini-api-key-here"

# 百度网盘路径
BAIDU_PAN_PATH="/your/baidu/pan/path"

# Cloudflare R2 图床
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key-id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-key"
CLOUDFLARE_R2_BUCKET_NAME="reslibs-images"
CLOUDFLARE_R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
CLOUDFLARE_R2_CUSTOM_DOMAIN="https://images.reslibs.com"
```

### 可选配置
```env
# 图片搜索API（至少配置一个）
UNSPLASH_ACCESS_KEY="your-unsplash-key"
PEXELS_API_KEY="your-pexels-key"
PIXABAY_API_KEY="your-pixabay-key"

# 付费下载平台（可选）
RAPIDGATOR_API_KEY="your-rapidgator-key"
RAPIDGATOR_USERNAME="your-username"
RAPIDGATOR_PASSWORD="your-password"
```

## 🏃 使用方法

### 1. 测试配置
```bash
python automation/run_automation.py --test
```

### 2. 试运行（推荐首次使用）
```bash
python automation/run_automation.py --run --dry-run
```

### 3. 正式运行
```bash
python automation/run_automation.py --run
```

### 4. 显示配置信息
```bash
python automation/run_automation.py --config
```

## 📁 项目结构

```
automation/
├── __init__.py              # 包初始化
├── main.py                  # 主框架
├── run_automation.py        # 运行脚本
├── config.py                # 配置管理
├── logger.py                # 日志管理
├── database.py              # 数据库管理（复杂版）
├── simple_database.py       # 简化数据库管理
├── baidu_client.py          # 百度网盘客户端
├── content_generator.py     # AI内容生成
├── image_manager.py         # 图片管理器
├── cloudflare_r2.py         # Cloudflare R2管理器
├── hosting_manager.py       # 付费平台管理器
├── test_config.py           # 配置测试脚本
├── requirements.txt         # Python依赖
└── venv/                    # 虚拟环境

data/                        # 数据库文件
└── automation.db            # SQLite数据库

temp/                        # 临时文件
├── downloads/               # 下载的文件
└── images/                  # 下载的图片

logs/                        # 日志文件
└── automation.log           # 自动化日志
```

## 🔄 工作流程

1. **获取文件列表**: 从百度网盘按时间顺序获取文件列表
2. **文件下载**: 下载第一个文件到本地临时目录
3. **内容分析**: 分析文件类型、大小等信息
4. **AI内容生成**: 基于文件信息生成SEO优化的内容
5. **图片搜索**: 根据内容搜索相关图片
6. **图片上传**: 上传图片到Cloudflare R2图床
7. **文件上传**: 上传文件到付费下载平台
8. **数据库存储**: 保存所有信息到数据库
9. **清理工作**: 清理临时文件

## 📊 数据库表结构

### resources 表
- `id`: 主键
- `title`: 中文标题
- `title_en`: 英文标题
- `description`: 详细描述
- `meta_description`: SEO描述
- `resource_type`: 资源类型
- `file_size`: 文件大小
- `file_format`: 文件格式
- `download_links`: 下载链接（JSON）
- `image_urls`: 图片链接（JSON）
- `tags`: 标签（JSON）
- `status`: 状态（draft/published/archived）
- `created_at`: 创建时间
- `updated_at`: 更新时间

## ⚠️ 注意事项

### 安全性
- 所有API密钥都存储在 `.env.automation` 文件中，请勿提交到版本控制
- 建议使用只读权限的API密钥
- 定期轮换API密钥

### 性能优化
- 大文件下载可能需要较长时间，建议设置合理的超时时间
- 图片搜索和上传可能消耗较多带宽
- 数据库会随时间增长，建议定期备份

### 法律合规
- 确保上传的内容符合平台的服务条款
- 尊重版权，不要上传侵权内容
- 遵守相关法律法规

## 🔧 故障排除

### 常见问题

1. **导入错误**: 确保已安装所有必需的Python包
2. **API密钥错误**: 检查 `.env.automation` 文件中的配置
3. **网络连接问题**: 检查代理设置和防火墙配置
4. **磁盘空间不足**: 清理临时文件或增加存储空间
5. **数据库连接失败**: 检查数据库路径和权限

### 调试模式
```bash
# 启用详细日志
export LOG_LEVEL=DEBUG

# 试运行模式
python automation/run_automation.py --run --dry-run
```

### 查看日志
```bash
tail -f logs/automation.log
```

## 📈 扩展功能

### 添加新的资源类型
1. 在 `baidu_client.py` 中更新 `_detect_resource_type` 方法
2. 在 `content_generator.py` 中添加对应的内容模板
3. 根据需要添加特定的处理逻辑

### 添加新的付费平台
1. 在 `hosting_manager.py` 中添加新的上传方法
2. 在配置文件中添加相应的API密钥配置
3. 更新状态检查和测试方法

### 自定义AI提示
在 `content_generator.py` 中修改或添加新的提示模板，以获得更好的内容生成效果。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个自动化系统。

## 📄 许可证

本项目采用 MIT 许可证。