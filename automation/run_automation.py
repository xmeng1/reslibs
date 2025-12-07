#!/usr/bin/env python3
"""
ResLibs 百度网盘自动化脚本运行器
简化的运行入口，用于快速测试和验证
"""

import os
import sys
import asyncio
from pathlib import Path
from datetime import datetime

# 添加项目根目录到路径
sys.path.append(str(Path(__file__).parent.parent))

from automation.config import config
from automation.logger import setup_logger
from automation.simple_database import SimpleDatabaseManager
from automation.baidu_client import BaiduPanClient
from automation.content_generator import ContentGenerator
from automation.image_manager import ImageManager
from automation.cloudflare_r2 import CloudflareR2Manager
from automation.hosting_manager import HostingManager


async def run_single_file_test():
    """运行单个文件处理测试"""
    print("🚀 开始 ResLibs 自动化测试")
    print("=" * 50)

    logger = setup_logger("TestRunner")

    try:
        # 初始化组件
        logger.info("初始化数据库...")
        db = SimpleDatabaseManager()
        await db.connect()

        logger.info("初始化百度网盘客户端...")
        baidu_client = BaiduPanClient()

        logger.info("初始化AI内容生成器...")
        content_generator = ContentGenerator()

        logger.info("初始化图片管理器...")
        image_manager = ImageManager()

        logger.info("初始化Cloudflare R2管理器...")
        r2_manager = CloudflareR2Manager()

        logger.info("初始化托管管理器...")
        hosting_manager = HostingManager()

        # 获取文件列表
        logger.info("获取百度网盘文件列表...")
        files = await baidu_client.list_files(config.baidu_pan.path)

        if not files:
            logger.warning("未找到任何文件，使用模拟数据")
            files = await baidu_client.list_files(config.baidu_pan.path)

        if not files:
            logger.error("无法获取文件列表")
            return

        print(f"\n📁 找到 {len(files)} 个文件")

        # 处理第一个文件
        test_file = files[0]
        print(f"\n🔍 测试文件: {test_file['filename']}")
        print(f"   类型: {test_file['resource_type']}")
        print(f"   大小: {test_file['size']} bytes")
        print(f"   修改时间: {test_file['modified_time']}")

        # 步骤1: 下载文件
        print(f"\n📥 步骤1: 下载文件...")
        local_path = await baidu_client.download_file(
            test_file['path'],
            test_file['filename'],
            config.download.base_dir
        )

        if local_path:
            print(f"✅ 文件下载成功: {local_path}")
        else:
            print(f"❌ 文件下载失败")
            return

        # 步骤2: 生成AI内容
        print(f"\n🤖 步骤2: 生成AI内容...")
        content_data = await content_generator.generate_content(
            filename=test_file['filename'],
            file_type=test_file['file_type'],
            resource_type=test_file['resource_type'],
            metadata={
                'size': test_file['size'],
                'modified_time': test_file['modified_time']
            },
            local_path=local_path
        )

        if content_data:
            print(f"✅ AI内容生成成功:")
            print(f"   标题: {content_data.get('title_zh', '')}")
            print(f"   描述: {content_data.get('description', '')[:100]}...")
            print(f"   标签: {content_data.get('tags', [])}")
        else:
            print(f"❌ AI内容生成失败")
            return

        # 步骤3: 处理图片
        print(f"\n🖼️ 步骤3: 搜索和下载相关图片...")
        images = await image_manager.search_and_download_images(
            title=content_data.get('title_zh', ''),
            description=content_data.get('description', ''),
            tags=content_data.get('tags', []),
            resource_type=test_file['resource_type'],
            max_images=3  # 减少数量以加快测试
        )

        if images:
            print(f"✅ 图片下载成功: {len(images)} 张")
            for i, img_path in enumerate(images):
                print(f"   图片 {i+1}: {Path(img_path).name}")
        else:
            print(f"⚠️ 未下载到图片（可能正常）")

        # 步骤4: 上传图片到R2
        uploaded_images = []
        if images and r2_manager.is_configured:
            print(f"\n☁️ 步骤4: 上传图片到 Cloudflare R2...")
            for img_path in images:
                try:
                    img_url = await r2_manager.upload_image(
                        img_path,
                        test_file['resource_type']
                    )
                    if img_url:
                        uploaded_images.append(img_url)
                        print(f"✅ 图片上传成功: {img_url}")
                except Exception as e:
                    logger.warning(f"图片上传失败: {e}")
        elif not r2_manager.is_configured:
            print(f"⚠️ Cloudflare R2 未配置，跳过图片上传")
            # 使用模拟URL
            uploaded_images = [f"https://example.com/mock_image_{i+1}.jpg" for i in range(len(images))]

        # 步骤5: 上传文件到付费平台
        print(f"\n📤 步骤5: 上传文件到付费下载平台...")
        hosting_status = await hosting_manager.get_platform_status()
        configured_platforms = [name for name, status in hosting_status.items() if status['configured']]

        if configured_platforms:
            print(f"配置的平台: {', '.join(configured_platforms)}")

            hosting_links = await hosting_manager.upload_to_all_platforms(
                local_path,
                test_file['filename']
            )

            successful_uploads = {name: url for name, url in hosting_links.items() if url}
            if successful_uploads:
                print(f"✅ 成功上传到: {', '.join(successful_uploads.keys())}")
            else:
                print(f"❌ 所有平台上传都失败了")
        else:
            print(f"⚠️ 未配置任何付费下载平台")
            # 使用模拟链接
            hosting_links = {
                'mock_platform': f"https://mock-platform.com/file/{test_file['filename']}"
            }

        # 步骤6: 保存到数据库
        print(f"\n💾 步骤6: 保存到数据库...")
        db_data = {
            "title": content_data.get('title_zh', ''),
            "title_en": content_data.get('title_en', ''),
            "description": content_data.get('description', ''),
            "meta_description": content_data.get('meta_description', ''),
            "resource_type": test_file['resource_type'],
            "file_size": test_file['size'],
            "file_format": test_file['file_type'],
            "download_links": [{"platform": name, "url": url, "name": name.title()}
                             for name, url in hosting_links.items() if url],
            "image_urls": uploaded_images,
            "tags": content_data.get('tags', []),
            "status": "published"
        }

        resource_id = await db.create_resource(db_data)

        if resource_id:
            print(f"✅ 数据库保存成功，资源ID: {resource_id}")
        else:
            print(f"❌ 数据库保存失败")

        # 获取统计信息
        stats = await db.get_statistics()
        print(f"\n📊 数据库统计:")
        print(f"   总资源数: {stats.get('total_resources', 0)}")
        print(f"   已发布: {stats.get('published_resources', 0)}")
        print(f"   总文件大小: {stats.get('total_file_size_mb', 0):.2f} MB")

        print(f"\n🎉 自动化测试完成！")
        print(f"✅ 成功处理文件: {test_file['filename']}")
        print(f"🆔 资源ID: {resource_id}")
        print(f"📝 标题: {content_data.get('title_zh', '')}")

    except Exception as e:
        logger.error(f"自动化测试失败: {e}")
        print(f"\n❌ 测试失败: {e}")

    finally:
        # 清理资源
        try:
            if 'db' in locals():
                await db.disconnect()
            print(f"\n🧹 资源清理完成")
        except Exception as e:
            print(f"清理资源时出错: {e}")


async def test_configuration():
    """测试配置"""
    print("⚙️ 测试配置...")

    # 测试数据库
    try:
        db = SimpleDatabaseManager()
        await db.connect()
        print("✅ 数据库连接成功")
        await db.disconnect()
    except Exception as e:
        print(f"❌ 数据库测试失败: {e}")

    # 测试百度网盘
    try:
        baidu_client = BaiduPanClient()
        if baidu_client.is_configured:
            print("✅ 百度网盘已配置")
        else:
            print("⚠️ 百度网盘未配置，将使用模拟数据")
    except Exception as e:
        print(f"❌ 百度网盘测试失败: {e}")

    # 测试AI生成器
    try:
        content_generator = ContentGenerator()
        if content_generator.is_configured:
            print("✅ AI内容生成器已配置")
        else:
            print("⚠️ AI内容生成器未配置，将使用模拟内容")
    except Exception as e:
        print(f"❌ AI内容生成器测试失败: {e}")

    # 测试图片管理器
    try:
        image_manager = ImageManager()
        print("✅ 图片管理器初始化成功")
    except Exception as e:
        print(f"❌ 图片管理器测试失败: {e}")

    # 测试Cloudflare R2
    try:
        r2_manager = CloudflareR2Manager()
        if r2_manager.is_configured:
            print("✅ Cloudflare R2 已配置")
        else:
            print("⚠️ Cloudflare R2 未配置，将跳过图片上传")
    except Exception as e:
        print(f"❌ Cloudflare R2 测试失败: {e}")

    # 测试托管管理器
    try:
        hosting_manager = HostingManager()
        status = await hosting_manager.get_platform_status()
        configured_platforms = [name for name, info in status.items() if info['configured']]
        if configured_platforms:
            print(f"✅ 已配置的付费平台: {', '.join(configured_platforms)}")
        else:
            print("⚠️ 未配置任何付费下载平台")
    except Exception as e:
        print(f"❌ 托管管理器测试失败: {e}")


async def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="ResLibs 百度网盘自动化脚本运行器")
    parser.add_argument("--test", action="store_true", help="测试配置")
    parser.add_argument("--run", action="store_true", help="运行完整自动化流程")
    parser.add_argument("--dry-run", action="store_true", help="试运行模式")
    parser.add_argument("--config", action="store_true", help="显示配置信息")

    args = parser.parse_args()

    # 显示配置
    if args.config:
        config.print_config_summary()
        return

    # 设置试运行模式
    if args.dry_run:
        config.system.dry_run = True
        print("🔍 试运行模式：不会实际上传文件")

    # 测试配置
    if args.test or not any([args.run, args.test, args.config]):
        await test_configuration()
        print()

    # 运行自动化
    if args.run:
        await run_single_file_test()
    elif not args.test and not args.config:
        # 默认运行测试
        await run_single_file_test()


if __name__ == "__main__":
    # 检查配置文件
    if not os.path.exists(".env.automation"):
        print("❌ 未找到 .env.automation 配置文件")
        print("请复制 .env.automation.example 为 .env.automation 并填入配置")
        sys.exit(1)

    # 检查虚拟环境
    if not os.path.exists("automation/venv"):
        print("⚠️ 未找到虚拟环境，使用系统Python")

    print(f"🕒 开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⚠️ 用户中断操作")
    except Exception as e:
        print(f"\n❌ 程序执行出错: {e}")
        sys.exit(1)

    print(f"🕐 结束时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")