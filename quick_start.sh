#!/bin/bash

# ResLibs 百度网盘自动化脚本快速启动脚本

echo "🚀 ResLibs 百度网盘自动化脚本快速启动"
echo "=========================================="

# 检查Python版本
python3 --version >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ 错误: 未找到 Python3"
    echo "请安装 Python 3.8 或更高版本"
    exit 1
fi

PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "✅ Python 版本: $PYTHON_VERSION"

# 检查是否存在虚拟环境
if [ ! -d "automation/venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv automation/venv
    if [ $? -eq 0 ]; then
        echo "✅ 虚拟环境创建成功"
    else
        echo "❌ 虚拟环境创建失败"
        exit 1
    fi
else
    echo "✅ 虚拟环境已存在"
fi

# 激活虚拟环境
echo "🔄 激活虚拟环境..."
source automation/venv/bin/activate

# 安装基础依赖
echo "📚 检查并安装基础依赖..."
python3 -c "import dotenv, requests, rich" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📦 安装基础依赖..."
    pip install python-dotenv requests rich
    if [ $? -eq 0 ]; then
        echo "✅ 基础依赖安装成功"
    else
        echo "❌ 基础依赖安装失败"
        exit 1
    fi
else
    echo "✅ 基础依赖已安装"
fi

# 检查环境变量文件
if [ ! -f ".env.automation" ]; then
    echo "⚠️  未找到 .env.automation 配置文件"
    echo "📝 复制配置模板..."
    cp .env.automation.example .env.automation
    echo "✅ 配置文件已创建: .env.automation"
    echo "📝 请编辑此文件并填入真实的 API 密钥和配置"
    echo ""
    echo "必需配置项:"
    echo "- DATABASE_URL: 数据库连接地址"
    echo "- GEMINI_API_KEY: Google Gemini API 密钥"
    echo "- BAIDU_PAN_PATH: 百度网盘路径"
    echo "- CLOUDFLARE_ACCOUNT_ID: Cloudflare 账户ID"
    echo "- CLOUDFLARE_R2_ACCESS_KEY_ID: R2 访问密钥"
    echo "- CLOUDFLARE_R2_SECRET_ACCESS_KEY: R2 密钥"
    echo ""
    echo "编辑完成后再次运行此脚本"
    exit 0
else
    echo "✅ 配置文件已存在"
fi

# 运行配置测试
echo ""
echo "🔧 运行配置测试..."
python automation/run_automation.py --test
echo ""

# 询问是否运行完整测试
echo "🎯 是否运行完整的自动化测试？"
echo "选择:"
echo "1) 试运行模式（推荐，不会实际上传文件）"
echo "2) 正式运行（会真实下载和上传文件）"
echo "3) 仅显示配置信息"
echo "4) 退出"
echo ""

read -p "请选择 (1-4): " choice

case $choice in
    1)
        echo "🔍 启动试运行模式..."
        python automation/run_automation.py --run --dry-run
        ;;
    2)
        echo "⚠️  正式运行模式 - 将真实下载和上传文件"
        read -p "确认继续？(y/N): " confirm
        if [[ $confirm == [yY] ]]; then
            python automation/run_automation.py --run
        else
            echo "已取消"
        fi
        ;;
    3)
        echo "📋 显示配置信息..."
        python automation/run_automation.py --config
        ;;
    4)
        echo "👋 再见！"
        exit 0
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🎉 脚本执行完成！"
echo ""
echo "📁 生成的文件:"
echo "- data/automation.db: 数据库文件"
echo "- temp/downloads/: 下载的文件"
echo "- temp/images/: 下载的图片"
echo "- logs/automation.log: 日志文件"
echo ""
echo "📖 更多使用方法请参考: README_AUTOMATION.md"