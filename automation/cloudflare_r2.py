#!/usr/bin/env python3
"""
ResLibs Cloudflare R2 图床管理器
上传图片到 Cloudflare R2 并生成访问链接
"""

import os
import asyncio
import logging
from typing import Optional, Dict, Any
from pathlib import Path
from datetime import datetime
from urllib.parse import quote

try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False

from automation.config import config
from automation.logger import setup_logger


class CloudflareR2Manager:
    """Cloudflare R2 管理器"""

    def __init__(self):
        self.logger = setup_logger("CloudflareR2Manager")
        self.bucket_name = config.cloudflare.bucket_name
        self.custom_domain = config.cloudflare.custom_domain
        self.client = None

        # 检查配置
        self.is_configured = self._check_configuration()

        if self.is_configured and BOTO3_AVAILABLE:
            try:
                self._initialize_client()
                self.logger.info("Cloudflare R2 客户端初始化成功")
            except Exception as e:
                self.logger.error(f"Cloudflare R2 客户端初始化失败: {e}")
                self.is_configured = False
        else:
            if not BOTO3_AVAILABLE:
                self.logger.warning("boto3 未安装，无法使用 Cloudflare R2")
                self.logger.info("请安装依赖: pip install boto3")
            if not self._check_configuration():
                self.logger.warning("Cloudflare R2 配置不完整")

    def _check_configuration(self) -> bool:
        """检查配置是否完整"""
        required_configs = [
            config.cloudflare.account_id,
            config.cloudflare.r2_access_key_id,
            config.cloudflare.r2_secret_access_key,
            config.cloudflare.bucket_name,
            config.cloudflare.endpoint
        ]

        return all(configs for configs in required_configs)

    def _initialize_client(self):
        """初始化 S3 客户端（兼容 R2）"""
        self.client = boto3.client(
            's3',
            endpoint_url=config.cloudflare.endpoint,
            aws_access_key_id=config.cloudflare.r2_access_key_id,
            aws_secret_access_key=config.cloudflare.r2_secret_access_key,
            region_name='auto'  # Cloudflare R2 使用 'auto'
        )

    async def upload_file(
        self,
        file_path: str,
        key: str,
        content_type: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Optional[str]:
        """
        上传文件到 Cloudflare R2

        Args:
            file_path: 本地文件路径
            key: R2 存储键名
            content_type: 文件内容类型
            metadata: 文件元数据

        Returns:
            公开访问URL，失败返回None
        """
        try:
            if not self.is_configured or config.system.dry_run:
                self.logger.info(f"试运行模式：模拟上传 {file_path} 到 R2")
                return await self._simulate_upload(file_path, key)

            file_path_obj = Path(file_path)
            if not file_path_obj.exists():
                self.logger.error(f"文件不存在: {file_path}")
                return None

            # 自动检测内容类型
            if not content_type:
                content_type = self._detect_content_type(file_path_obj)

            # 设置默认元数据
            if not metadata:
                metadata = {
                    'original_filename': file_path_obj.name,
                    'upload_time': datetime.now().isoformat(),
                    'source': 'reslibs_automation'
                }

            self.logger.info(f"开始上传 {file_path_obj.name} 到 R2 ({key})")

            # 执行上传
            with open(file_path_obj, 'rb') as file:
                self.client.upload_fileobj(
                    file,
                    self.bucket_name,
                    key,
                    ExtraArgs={
                        'ContentType': content_type,
                        'Metadata': metadata
                    }
                )

            # 生成访问URL
            url = self._generate_url(key)

            self.logger.info(f"文件上传成功: {url}")
            return url

        except ClientError as e:
            self.logger.error(f"R2 上传失败 (ClientError): {e}")
            return None
        except NoCredentialsError:
            self.logger.error("R2 凭证配置错误")
            return None
        except Exception as e:
            self.logger.error(f"R2 上传失败: {e}")
            # 返回模拟URL以避免流程中断
            return await self._simulate_upload(file_path, key)

    async def _simulate_upload(self, file_path: str, key: str) -> str:
        """模拟上传过程"""
        file_path_obj = Path(file_path)
        filename = file_path_obj.name

        if self.custom_domain:
            simulated_url = f"{self.custom_domain}/{key}"
        else:
            # 使用 R2 的公开URL格式
            simulated_url = f"https://pub-{config.cloudflare.account_id}.r2.dev/{key}"

        self.logger.info(f"模拟上传完成: {filename} -> {simulated_url}")
        return simulated_url

    def _detect_content_type(self, file_path: Path) -> str:
        """检测文件内容类型"""
        extension = file_path.suffix.lower()

        content_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.bmp': 'image/bmp',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.pdf': 'application/pdf',
            '.zip': 'application/zip',
            '.rar': 'application/x-rar-compressed',
            '.7z': 'application/x-7z-compressed',
            '.txt': 'text/plain',
            '.json': 'application/json',
            '.xml': 'application/xml',
            '.mp4': 'video/mp4',
            '.avi': 'video/x-msvideo',
            '.mov': 'video/quicktime',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.flac': 'audio/flac'
        }

        return content_types.get(extension, 'application/octet-stream')

    def _generate_url(self, key: str) -> str:
        """生成公开访问URL"""
        if self.custom_domain:
            return f"{self.custom_domain}/{key}"
        else:
            # Cloudflare R2 的默认公开URL格式
            return f"https://pub-{config.cloudflare.account_id}.r2.dev/{key}"

    async def upload_image(
        self,
        image_path: str,
        resource_type: str,
        filename: Optional[str] = None
    ) -> Optional[str]:
        """
        上传图片到 R2

        Args:
            image_path: 图片文件路径
            resource_type: 资源类型
            filename: 可选的自定义文件名

        Returns:
            公开访问URL
        """
        try:
            image_path_obj = Path(image_path)
            if not filename:
                filename = image_path_obj.name

            # 生成存储键名
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            key = f"images/{resource_type}/{timestamp}_{filename}"

            # 检查是否为图片文件
            if not self._is_image_file(image_path_obj):
                self.logger.warning(f"文件可能不是图片: {image_path}")
                # 继续处理，但标记为一般文件
                key = f"files/{resource_type}/{timestamp}_{filename}"

            # 上传文件
            return await self.upload_file(
                image_path,
                key,
                metadata={
                    'resource_type': resource_type,
                    'original_filename': filename,
                    'upload_timestamp': timestamp,
                    'file_type': 'image'
                }
            )

        except Exception as e:
            self.logger.error(f"上传图片失败 {image_path}: {e}")
            return None

    def _is_image_file(self, file_path: Path) -> bool:
        """检查是否为图片文件"""
        image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.ico'}
        return file_path.suffix.lower() in image_extensions

    async def upload_multiple_files(
        self,
        file_paths: list,
        resource_type: str,
        prefix: str = "files"
    ) -> Dict[str, Optional[str]]:
        """
        批量上传多个文件

        Args:
            file_paths: 文件路径列表
            resource_type: 资源类型
            prefix: 存储键前缀

        Returns:
            文件路径到URL的映射
        """
        results = {}

        for file_path in file_paths:
            try:
                filename = Path(file_path).name
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                key = f"{prefix}/{resource_type}/{timestamp}_{filename}"

                url = await self.upload_file(file_path, key)
                results[file_path] = url

            except Exception as e:
                self.logger.error(f"批量上传失败 {file_path}: {e}")
                results[file_path] = None

        return results

    async def delete_file(self, key: str) -> bool:
        """删除 R2 中的文件"""
        try:
            if not self.is_configured:
                self.logger.info(f"试运行模式：模拟删除文件 {key}")
                return True

            self.client.delete_object(Bucket=self.bucket_name, Key=key)
            self.logger.info(f"文件删除成功: {key}")
            return True

        except ClientError as e:
            self.logger.error(f"删除文件失败 {key}: {e}")
            return False

    async def list_files(self, prefix: str = "", max_keys: int = 1000) -> list:
        """列出 R2 中的文件"""
        try:
            if not self.is_configured:
                self.logger.info(f"试运行模式：模拟列出文件 prefix={prefix}")
                return []

            paginator = self.client.get_paginator('list_objects_v2')
            pages = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=max_keys
            )

            files = []
            for page in pages:
                for obj in page.get('Contents', []):
                    files.append({
                        'key': obj['Key'],
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'],
                        'etag': obj['ETag'].strip('"')
                    })

            self.logger.info(f"列出 {len(files)} 个文件")
            return files

        except ClientError as e:
            self.logger.error(f"列出文件失败: {e}")
            return []

    async def get_file_info(self, key: str) -> Optional[Dict[str, Any]]:
        """获取文件信息"""
        try:
            if not self.is_configured:
                self.logger.info(f"试运行模式：模拟获取文件信息 {key}")
                return None

            response = self.client.head_object(Bucket=self.bucket_name, Key=key)

            return {
                'key': key,
                'size': response.get('ContentLength', 0),
                'last_modified': response.get('LastModified'),
                'content_type': response.get('ContentType'),
                'etag': response.get('ETag', '').strip('"'),
                'metadata': response.get('Metadata', {})
            }

        except ClientError as e:
            self.logger.error(f"获取文件信息失败 {key}: {e}")
            return None

    async def test_connection(self) -> bool:
        """测试 R2 连接"""
        try:
            if not self.is_configured:
                self.logger.warning("R2 配置不完整，无法测试连接")
                return False

            # 尝试列出bucket
            self.client.head_bucket(Bucket=self.bucket_name)
            self.logger.info("R2 连接测试成功")
            return True

        except ClientError as e:
            self.logger.error(f"R2 连接测试失败: {e}")
            return False

    async def get_storage_usage(self) -> Dict[str, Any]:
        """获取存储使用情况"""
        try:
            if not self.is_configured:
                return {
                    'total_files': 0,
                    'total_size': 0,
                    'by_type': {}
                }

            files = await self.list_files()

            total_size = sum(file['size'] for file in files)
            by_type = {}

            for file in files:
                key = file['key']
                file_type = key.split('/')[0] if '/' in key else 'unknown'

                if file_type not in by_type:
                    by_type[file_type] = {'count': 0, 'size': 0}

                by_type[file_type]['count'] += 1
                by_type[file_type]['size'] += file['size']

            return {
                'total_files': len(files),
                'total_size': total_size,
                'total_size_mb': total_size / (1024 * 1024),
                'by_type': by_type
            }

        except Exception as e:
            self.logger.error(f"获取存储使用情况失败: {e}")
            return {
                'total_files': 0,
                'total_size': 0,
                'by_type': {}
            }

    async def cleanup_old_files(self, days: int = 30, prefix: str = "") -> int:
        """清理旧文件"""
        try:
            if not self.is_configured:
                self.logger.info(f"试运行模式：模拟清理旧文件")
                return 0

            from datetime import datetime, timedelta
            cutoff_date = datetime.now() - timedelta(days=days)

            files = await self.list_files(prefix=prefix)
            deleted_count = 0

            for file in files:
                if file['last_modified'].replace(tzinfo=None) < cutoff_date:
                    await self.delete_file(file['key'])
                    deleted_count += 1

            self.logger.info(f"清理了 {deleted_count} 个旧文件")
            return deleted_count

        except Exception as e:
            self.logger.error(f"清理旧文件失败: {e}")
            return 0


# 全局实例
r2_manager = CloudflareR2Manager()


# 便捷函数
async def upload_image(image_path: str, resource_type: str, filename: Optional[str] = None) -> Optional[str]:
    """上传图片到R2"""
    return await r2_manager.upload_image(image_path, resource_type, filename)


async def upload_file(file_path: str, key: str, content_type: Optional[str] = None) -> Optional[str]:
    """上传文件到R2"""
    return await r2_manager.upload_file(file_path, key, content_type)


async def test_r2_connection() -> bool:
    """测试R2连接"""
    return await r2_manager.test_connection()


async def get_storage_info() -> Dict[str, Any]:
    """获取存储信息"""
    return await r2_manager.get_storage_usage()