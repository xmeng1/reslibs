#!/usr/bin/env python3
"""
ResLibs 百度网盘自动化脚本主框架
实现完整的资源自动化处理流程
"""

import os
import sys
import asyncio
import logging
from pathlib import Path
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import json

# 添加项目根目录到路径
sys.path.append(str(Path(__file__).parent.parent))

from automation.config import config
from automation.logger import setup_logger
from automation.simple_database import SimpleDatabaseManager as DatabaseManager
from automation.baidu_client import BaiduPanClient
from automation.content_generator import ContentGenerator
from automation.image_manager import ImageManager
from automation.cloudflare_r2 import CloudflareR2Manager
from automation.hosting_manager import HostingManager


@dataclass
class ResourceInfo:
    """资源信息"""
    path: str
    filename: str
    size: int
    modified_time: datetime
    file_type: str
    resource_type: str
    download_url: Optional[str] = None
    local_path: Optional[str] = None
    content_data: Optional[Dict[str, Any]] = None
    images: List[str] = None
    hosting_links: List[Dict[str, str]] = None

    def __post_init__(self):
        if self.images is None:
            self.images = []
        if self.hosting_links is None:
            self.hosting_links = []


class ResourceProcessor:
    """资源处理器"""

    def __init__(self):
        self.logger = setup_logger("ResourceProcessor")
        self.db = DatabaseManager()
        self.baidu_client = BaiduPanClient()
        self.content_generator = ContentGenerator()
        self.image_manager = ImageManager()
        self.r2_manager = CloudflareR2Manager()
        self.hosting_manager = HostingManager()

    async def process_single_resource(self, resource_info: ResourceInfo) -> bool:
        """处理单个资源的完整流程"""
        self.logger.info(f"开始处理资源: {resource_info.filename}")

        try:
            # 步骤1: 下载文件
            if not await self._download_resource(resource_info):
                return False

            # 步骤2: 生成AI内容
            if not await self._generate_content(resource_info):
                return False

            # 步骤3: 搜索和下载相关图片
            if not await self._process_images(resource_info):
                return False

            # 步骤4: 上传到付费下载平台
            if not await self._upload_to_hosting(resource_info):
                return False

            # 步骤5: 保存到数据库
            if not await self._save_to_database(resource_info):
                return False

            self.logger.info(f"资源处理完成: {resource_info.filename}")
            return True

        except Exception as e:
            self.logger.error(f"处理资源失败 {resource_info.filename}: {e}")
            return False

        finally:
            # 清理临时文件
            await self._cleanup(resource_info)

    async def _download_resource(self, resource_info: ResourceInfo) -> bool:
        """下载资源文件"""
        self.logger.info(f"步骤1: 下载文件 {resource_info.filename}")

        try:
            # 下载文件到本地
            local_path = await self.baidu_client.download_file(
                resource_info.path,
                resource_info.filename,
                config.download.base_dir
            )

            if not local_path:
                self.logger.error(f"下载文件失败: {resource_info.filename}")
                return False

            resource_info.local_path = local_path
            self.logger.info(f"文件下载完成: {local_path}")
            return True

        except Exception as e:
            self.logger.error(f"下载文件出错 {resource_info.filename}: {e}")
            return False

    async def _generate_content(self, resource_info: ResourceInfo) -> bool:
        """生成AI内容"""
        self.logger.info(f"步骤2: 生成AI内容 {resource_info.filename}")

        try:
            # 提取文件元数据
            metadata = await self._extract_metadata(resource_info)

            # 生成内容
            content_data = await self.content_generator.generate_content(
                filename=resource_info.filename,
                file_type=resource_info.file_type,
                resource_type=resource_info.resource_type,
                metadata=metadata,
                local_path=resource_info.local_path
            )

            if not content_data:
                self.logger.error(f"生成AI内容失败: {resource_info.filename}")
                return False

            resource_info.content_data = content_data
            self.logger.info(f"AI内容生成完成: {content_data.get('title_zh', '')}")
            return True

        except Exception as e:
            self.logger.error(f"生成AI内容出错 {resource_info.filename}: {e}")
            return False

    async def _extract_metadata(self, resource_info: ResourceInfo) -> Dict[str, Any]:
        """提取文件元数据"""
        metadata = {
            "filename": resource_info.filename,
            "size": resource_info.size,
            "file_type": resource_info.file_type,
            "resource_type": resource_info.resource_type,
            "modified_time": resource_info.modified_time.isoformat()
        }

        # 如果是本地文件，提取更多元数据
        if resource_info.local_path and os.path.exists(resource_info.local_path):
            try:
                import magic
                file_path = Path(resource_info.local_path)

                # 检测文件MIME类型
                mime_type = magic.from_file(str(file_path), mime=True)
                metadata["mime_type"] = mime_type

                # 如果是压缩文件，列出内容
                if resource_info.file_type in ['.zip', '.rar', '.7z', '.tar', '.gz']:
                    metadata["archive_contents"] = await self._list_archive_contents(file_path)

                # 如果是Unity包，提取Unity信息
                if resource_info.file_type in ['.unitypackage', '.unity']:
                    metadata["unity_info"] = await self._extract_unity_info(file_path)

            except Exception as e:
                self.logger.warning(f"提取元数据失败: {e}")

        return metadata

    async def _list_archive_contents(self, file_path: Path) -> List[str]:
        """列出压缩文件内容"""
        try:
            import patoolib
            temp_dir = Path(config.download.base_dir) / "temp_extract"
            temp_dir.mkdir(exist_ok=True)

            # 解压文件
            patoolib.extract_archive(str(file_path), outdir=str(temp_dir))

            # 获取文件列表
            contents = []
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    rel_path = os.path.relpath(os.path.join(root, file), temp_dir)
                    contents.append(rel_path)

            # 清理临时目录
            import shutil
            shutil.rmtree(temp_dir, ignore_errors=True)

            return contents[:50]  # 返回前50个文件

        except Exception as e:
            self.logger.warning(f"解压文件失败: {e}")
            return []

    async def _extract_unity_info(self, file_path: Path) -> Dict[str, Any]:
        """提取Unity包信息"""
        # 这里可以实现Unity包的详细解析
        # 暂时返回基本信息
        return {
            "package_type": "unitypackage",
            "unity_version": "unknown",
            "assets_count": 0
        }

    async def _process_images(self, resource_info: ResourceInfo) -> bool:
        """处理相关图片"""
        self.logger.info(f"步骤3: 搜索和下载相关图片 {resource_info.filename}")

        try:
            if not resource_info.content_data:
                self.logger.error("没有内容数据，无法搜索图片")
                return False

            # 搜索图片
            images = await self.image_manager.search_and_download_images(
                title=resource_info.content_data.get('title_zh', ''),
                description=resource_info.content_data.get('description', ''),
                tags=resource_info.content_data.get('tags', []),
                resource_type=resource_info.resource_type,
                max_images=config.image.images_per_resource
            )

            if not images:
                self.logger.warning("未找到相关图片")
                return True  # 图片不是必需的

            # 上传图片到Cloudflare R2
            uploaded_images = []
            for image_path in images:
                image_url = await self.r2_manager.upload_file(
                    file_path=image_path,
                    key=f"images/{resource_info.resource_type}/{Path(image_path).name}"
                )
                if image_url:
                    uploaded_images.append(image_url)

            resource_info.images = uploaded_images
            self.logger.info(f"图片处理完成，上传了 {len(uploaded_images)} 张图片")
            return True

        except Exception as e:
            self.logger.error(f"处理图片出错 {resource_info.filename}: {e}")
            return False

    async def _upload_to_hosting(self, resource_info: ResourceInfo) -> bool:
        """上传到付费下载平台"""
        self.logger.info(f"步骤4: 上传到付费下载平台 {resource_info.filename}")

        try:
            if not resource_info.local_path or not os.path.exists(resource_info.local_path):
                self.logger.error("本地文件不存在，无法上传")
                return False

            # 上传到各个平台
            hosting_links = []

            # Rapidgator
            if config.hosting.rapidgator_api_key:
                rapidgator_link = await self.hosting_manager.upload_to_rapidgator(
                    resource_info.local_path,
                    resource_info.filename
                )
                if rapidgator_link:
                    hosting_links.append({
                        "platform": "rapidgator",
                        "url": rapidgator_link,
                        "name": "Rapidgator"
                    })

            # Turbobit
            if config.hosting.turbobit_api_key:
                turbobit_link = await self.hosting_manager.upload_to_turbobit(
                    resource_info.local_path,
                    resource_info.filename
                )
                if turbobit_link:
                    hosting_links.append({
                        "platform": "turbobit",
                        "url": turbobit_link,
                        "name": "Turbobit"
                    })

            # FileCat
            if config.hosting.filecat_api_key:
                filecat_link = await self.hosting_manager.upload_to_filecat(
                    resource_info.local_path,
                    resource_info.filename
                )
                if filecat_link:
                    hosting_links.append({
                        "platform": "filecat",
                        "url": filecat_link,
                        "name": "FileCat"
                    })

            resource_info.hosting_links = hosting_links
            self.logger.info(f"文件上传完成，成功上传到 {len(hosting_links)} 个平台")
            return len(hosting_links) > 0

        except Exception as e:
            self.logger.error(f"上传到付费平台出错 {resource_info.filename}: {e}")
            return False

    async def _save_to_database(self, resource_info: ResourceInfo) -> bool:
        """保存到数据库"""
        self.logger.info(f"步骤5: 保存到数据库 {resource_info.filename}")

        try:
            # 准备数据库数据
            db_data = {
                "title": resource_info.content_data.get('title_zh', ''),
                "title_en": resource_info.content_data.get('title_en', ''),
                "description": resource_info.content_data.get('description', ''),
                "meta_description": resource_info.content_data.get('meta_description', ''),
                "resource_type": resource_info.resource_type,
                "file_size": resource_info.size,
                "file_format": resource_info.file_type,
                "download_links": json.dumps(resource_info.hosting_links),
                "image_urls": json.dumps(resource_info.images),
                "tags": json.dumps(resource_info.content_data.get('tags', [])),
                "status": "published",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }

            # 保存到数据库
            resource_id = await self.db.create_resource(db_data)

            if resource_id:
                self.logger.info(f"资源已保存到数据库，ID: {resource_id}")
                return True
            else:
                self.logger.error("保存到数据库失败")
                return False

        except Exception as e:
            self.logger.error(f"保存到数据库出错 {resource_info.filename}: {e}")
            return False

    async def _cleanup(self, resource_info: ResourceInfo):
        """清理临时文件"""
        try:
            # 清理下载的文件
            if resource_info.local_path and os.path.exists(resource_info.local_path):
                os.remove(resource_info.local_path)
                self.logger.debug(f"已清理下载文件: {resource_info.local_path}")

            # 清理图片文件
            for image_path in resource_info.images:
                if image_path.startswith(config.image.download_dir):
                    if os.path.exists(image_path):
                        os.remove(image_path)
                        self.logger.debug(f"已清理图片文件: {image_path}")

        except Exception as e:
            self.logger.warning(f"清理临时文件失败: {e}")


class AutomationOrchestrator:
    """自动化编排器"""

    def __init__(self):
        self.logger = setup_logger("AutomationOrchestrator")
        self.processor = ResourceProcessor()
        self.baidu_client = BaiduPanClient()

    async def run_automation(self, target_path: str = None, limit: int = 1):
        """运行自动化流程"""
        self.logger.info("=== 开始 ResLibs 百度网盘自动化流程 ===")

        try:
            # 获取目标路径
            path = target_path or config.baidu_pan.path

            # 获取文件列表
            self.logger.info(f"获取文件列表: {path}")
            files = await self.baidu_client.list_files(path)

            if not files:
                self.logger.warning("未找到任何文件")
                return

            self.logger.info(f"找到 {len(files)} 个文件，开始处理前 {limit} 个")

            # 处理文件
            processed_count = 0
            for i, file_info in enumerate(files[:limit]):
                self.logger.info(f"\n--- 处理第 {i+1}/{min(limit, len(files))} 个文件 ---")

                # 创建资源信息对象
                resource_info = ResourceInfo(
                    path=file_info['path'],
                    filename=file_info['filename'],
                    size=file_info['size'],
                    modified_time=file_info['modified_time'],
                    file_type=file_info['file_type'],
                    resource_type=file_info['resource_type']
                )

                # 处理资源
                success = await self.processor.process_single_resource(resource_info)

                if success:
                    processed_count += 1
                    self.logger.info(f"✅ 文件处理成功: {resource_info.filename}")
                else:
                    self.logger.error(f"❌ 文件处理失败: {resource_info.filename}")

                # 步骤间暂停
                if i < min(limit, len(files)) - 1:
                    self.logger.info(f"暂停 {config.system.pause_between_steps} 秒...")
                    await asyncio.sleep(config.system.pause_between_steps)

            self.logger.info(f"\n=== 自动化流程完成 ===")
            self.logger.info(f"总共处理: {min(limit, len(files))} 个文件")
            self.logger.info(f"成功处理: {processed_count} 个文件")
            self.logger.info(f"失败处理: {min(limit, len(files)) - processed_count} 个文件")

        except Exception as e:
            self.logger.error(f"自动化流程出错: {e}")
            raise


async def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="ResLibs 百度网盘自动化脚本")
    parser.add_argument("--path", help="百度网盘目标路径")
    parser.add_argument("--limit", type=int, default=1, help="处理文件数量限制")
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
        print("🔍 试运行模式：不会实际下载和上传文件")

    try:
        # 初始化编排器
        orchestrator = AutomationOrchestrator()

        # 运行自动化流程
        await orchestrator.run_automation(
            target_path=args.path,
            limit=args.limit
        )

    except KeyboardInterrupt:
        print("\n⚠️ 用户中断操作")
    except Exception as e:
        print(f"❌ 程序执行出错: {e}")
        sys.exit(1)


if __name__ == "__main__":
    # 检查配置文件
    if not os.path.exists(".env.automation"):
        print("❌ 未找到 .env.automation 配置文件")
        print("请复制 .env.automation.example 为 .env.automation 并填入配置")
        sys.exit(1)

    # 运行主程序
    asyncio.run(main())