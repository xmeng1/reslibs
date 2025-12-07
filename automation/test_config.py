#!/usr/bin/env python3
"""
ResLibs 自动化脚本配置测试
验证环境变量配置和基本功能
"""

import os
import sys
import asyncio
from pathlib import Path

# 添加项目根目录到路径
sys.path.append(str(Path(__file__).parent.parent))

def test_environment_file():
    """测试环境变量文件"""
    print("=== 测试环境变量文件 ===")

    env_file = Path(".env.automation")
    if not env_file.exists():
        print("❌ 未找到 .env.automation 文件")
        print("请复制 .env.automation.example 为 .env.automation 并填入配置")
        return False

    print("✅ 找到环境变量文件")

    # 检查关键配置
    required_keys = [
        "DATABASE_URL",
        "GEMINI_API_KEY",
        "BAIDU_PAN_PATH",
        "CLOUDFLARE_ACCOUNT_ID",
        "CLOUDFLARE_R2_ACCESS_KEY_ID",
        "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
        "CLOUDFLARE_R2_BUCKET_NAME",
        "CLOUDFLARE_R2_ENDPOINT"
    ]

    missing_keys = []
    placeholder_keys = []

    # 读取环境变量文件
    with open(env_file, 'r', encoding='utf-8') as f:
        content = f.read()

    for key in required_keys:
        if key not in content:
            missing_keys.append(key)
        elif f"{key}=\"your-" in content or f"{key}=\"\"=" in content:
            placeholder_keys.append(key)

    if missing_keys:
        print(f"❌ 缺少必需的环境变量: {', '.join(missing_keys)}")
        return False

    if placeholder_keys:
        print(f"⚠️ 以下环境变量仍为占位符: {', '.join(placeholder_keys)}")
        print("请填入实际的配置值")

    print("✅ 环境变量文件检查通过")
    return True

def test_imports():
    """测试模块导入"""
    print("\n=== 测试模块导入 ===")

    try:
        # 测试配置模块
        from automation.config import config
        print("✅ 配置模块导入成功")

        # 测试日志模块
        from automation.logger import setup_logger
        logger = setup_logger("test")
        print("✅ 日志模块导入成功")

        # 测试数据库模块
        from automation.database import DatabaseManager
        print("✅ 数据库模块导入成功")

        # 打印配置摘要
        print("\n=== 配置摘要 ===")
        config.print_config_summary()

        return True

    except ImportError as e:
        print(f"❌ 模块导入失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 配置错误: {e}")
        return False

def test_directories():
    """测试目录创建"""
    print("\n=== 测试目录创建 ===")

    try:
        from automation.config import config

        # 检查并创建必要目录
        directories = [
            config.download.base_dir,
            config.image.download_dir,
            Path(config.logging.file_path).parent,
            "./temp",
            "./logs"
        ]

        for directory in directories:
            dir_path = Path(directory)
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"✅ 目录: {dir_path}")

        return True

    except Exception as e:
        print(f"❌ 目录创建失败: {e}")
        return False

def test_database_connection():
    """测试数据库连接"""
    print("\n=== 测试数据库连接 ===")

    async def _test_db():
        try:
            from automation.database import DatabaseManager
            db = DatabaseManager()
            await db.connect()
            print("✅ 数据库连接成功")

            # 测试基本操作
            stats = await db.get_statistics()
            print(f"📊 数据库统计: {stats}")

            await db.disconnect()
            print("✅ 数据库断开连接")
            return True

        except Exception as e:
            print(f"❌ 数据库测试失败: {e}")
            return False

    return asyncio.run(_test_db())

def test_ai_connection():
    """测试AI连接"""
    print("\n=== 测试AI连接 ===")

    try:
        from automation.config import config

        if not config.ai.gemini_api_key or config.ai.gemini_api_key.startswith("your-"):
            print("⚠️ Gemini API Key 未配置，跳过AI测试")
            return True

        import google.generativeai as genai
        genai.configure(api_key=config.ai.gemini_api_key)
        model = genai.GenerativeModel(config.ai.gemini_model)

        # 简单测试
        response = model.generate_content("Hello, please respond with 'AI connection successful'")
        print("✅ AI连接成功")
        print(f"📝 AI响应: {response.text[:100]}...")

        return True

    except ImportError:
        print("⚠️ google-generativeai 包未安装，跳过AI测试")
        print("请运行: pip install google-generativeai")
        return True
    except Exception as e:
        print(f"❌ AI连接失败: {e}")
        return False

def test_file_operations():
    """测试文件操作"""
    print("\n=== 测试文件操作 ===")

    try:
        from automation.config import config
        import tempfile
        import shutil

        # 测试写入权限
        test_file = Path(config.download.base_dir) / "test_write.txt"
        test_file.write_text("测试文件写入权限", encoding='utf-8')
        print(f"✅ 文件写入测试: {test_file}")

        # 清理测试文件
        if test_file.exists():
            test_file.unlink()

        # 测试空间检查
        statvfs = os.statvfs('.')
        free_space = statvfs.f_frsize * statvfs.f_bavail
        free_space_gb = free_space / (1024**3)
        print(f"💾 可用磁盘空间: {free_space_gb:.1f} GB")

        if free_space_gb < 1:
            print("⚠️ 磁盘空间不足1GB，建议清理空间")

        return True

    except Exception as e:
        print(f"❌ 文件操作测试失败: {e}")
        return False

def main():
    """主测试函数"""
    print("🚀 ResLibs 自动化脚本配置测试")
    print("=" * 50)

    tests = [
        ("环境变量文件", test_environment_file),
        ("模块导入", test_imports),
        ("目录创建", test_directories),
        ("数据库连接", test_database_connection),
        ("AI连接", test_ai_connection),
        ("文件操作", test_file_operations)
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name}测试出错: {e}")
            results.append((test_name, False))

    # 输出测试结果摘要
    print("\n" + "=" * 50)
    print("📋 测试结果摘要:")
    print("=" * 50)

    passed = 0
    failed = 0

    for test_name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{test_name:<20} {status}")
        if result:
            passed += 1
        else:
            failed += 1

    print("-" * 50)
    print(f"总计: {len(results)} 项测试")
    print(f"通过: {passed} 项")
    print(f"失败: {failed} 项")

    if failed == 0:
        print("\n🎉 所有测试通过！可以开始运行自动化脚本")
        print("\n📖 使用说明:")
        print("1. 填写 .env.automation 文件中的所有必需配置")
        print("2. 安装依赖: pip install -r automation/requirements.txt")
        print("3. 运行脚本: python automation/main.py --limit 1")
        print("4. 试运行: python automation/main.py --dry-run --limit 1")
    else:
        print(f"\n⚠️ 有 {failed} 项测试失败，请修复后重试")
        print("\n💡 常见问题解决方案:")
        print("1. 确保所有API密钥和凭据已正确配置")
        print("2. 检查网络连接和防火墙设置")
        print("3. 确保有足够的磁盘空间")
        print("4. 安装所有必需的Python包")

if __name__ == "__main__":
    main()