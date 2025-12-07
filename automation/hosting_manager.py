#!/usr/bin/env python3
"""
ResLibs 付费下载平台管理器
支持上传文件到多个付费下载平台
"""

import os
import asyncio
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path
from datetime import datetime
import requests
from urllib.parse import urlencode
import time

from automation.config import config
from automation.logger import setup_logger


class HostingManager:
    """付费下载平台管理器"""

    def __init__(self):
        self.logger = setup_logger("HostingManager")
        self.session = requests.Session()
        self.proxies = config.get_proxy_config()

        # 设置请求头
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    async def upload_to_rapidgator(self, file_path: str, filename: str) -> Optional[str]:
        """
        上传文件到 RapidGator

        Args:
            file_path: 本地文件路径
            filename: 文件名

        Returns:
            下载链接，失败返回None
        """
        try:
            if not config.hosting.rapidgator_api_key:
                self.logger.warning("RapidGator API Key 未配置")
                return None

            if config.system.dry_run:
                self.logger.info(f"试运行模式：模拟上传到 RapidGator: {filename}")
                return f"https://rapidgator.net/file/mock_{int(time.time())}_{filename}"

            # RapidGator API 调用
            await self._login_rapidgator()

            # 获取上传URL
            upload_url = await self._get_rapidgator_upload_url()

            if not upload_url:
                raise Exception("获取上传URL失败")

            # 上传文件
            file_id = await self._upload_to_rapidgator_server(file_path, upload_url, filename)

            if not file_id:
                raise Exception("文件上传失败")

            # 获取下载链接
            download_url = await self._get_rapidgator_download_url(file_id)

            self.logger.info(f"RapidGator 上传成功: {download_url}")
            return download_url

        except Exception as e:
            self.logger.error(f"RapidGator 上传失败: {e}")
            return None

    async def _login_rapidgator(self):
        """登录 RapidGator"""
        url = "https://rapidgator.net/api/v2/user/login"
        data = {
            'login': config.hosting.rapidgator_username,
            'password': config.hosting.rapidgator_password
        }

        response = self.session.post(url, data=data, proxies=self.proxies, timeout=30)
        response.raise_for_status()

        result = response.json()
        if result.get('response_status') != 200:
            raise Exception(f"登录失败: {result.get('response_details', '未知错误')}")

    async def _get_rapidgator_upload_url(self) -> Optional[str]:
        """获取 RapidGator 上传URL"""
        url = "https://rapidgator.net/api/v2/upload/getuploadserver"
        response = self.session.get(url, proxies=self.proxies, timeout=30)
        response.raise_for_status()

        result = response.json()
        if result.get('response_status') == 200:
            return result.get('response', {}).get('upload_url')
        return None

    async def _upload_to_rapidgator_server(self, file_path: str, upload_url: str, filename: str) -> Optional[str]:
        """上传文件到 RapidGator 服务器"""
        file_path_obj = Path(file_path)
        if not file_path_obj.exists():
            raise Exception(f"文件不存在: {file_path}")

        with open(file_path_obj, 'rb') as f:
            files = {'file': (filename, f)}
            data = {}

            response = self.session.post(upload_url, files=files, data=data, proxies=self.proxies, timeout=3600)
            response.raise_for_status()

            # 解析响应获取文件ID
            result = response.json()
            if result.get('response_status') == 200:
                return result.get('response', {}).get('file_id')
            return None

    async def _get_rapidgator_download_url(self, file_id: str) -> Optional[str]:
        """获取 RapidGator 下载链接"""
        url = f"https://rapidgator.net/api/v2/file/info"
        params = {'file_id': file_id}

        response = self.session.get(url, params=params, proxies=self.proxies, timeout=30)
        response.raise_for_status()

        result = response.json()
        if result.get('response_status') == 200:
            file_info = result.get('response', {})
            return file_info.get('download_url')
        return None

    async def upload_to_turbobit(self, file_path: str, filename: str) -> Optional[str]:
        """
        上传文件到 Turbobit

        Args:
            file_path: 本地文件路径
            filename: 文件名

        Returns:
            下载链接，失败返回None
        """
        try:
            if not config.hosting.turbobit_api_key:
                self.logger.warning("Turbobit API Key 未配置")
                return None

            if config.system.dry_run:
                self.logger.info(f"试运行模式：模拟上传到 Turbobit: {filename}")
                return f"https://turbobit.net/mock_{int(time.time())}_{filename}.html"

            # Turbobit API 调用
            await self._login_turbobit()

            # 获取上传URL
            upload_data = await self._get_turbobit_upload_url()

            if not upload_data:
                raise Exception("获取上传URL失败")

            # 上传文件
            file_id = await self._upload_to_turbobit_server(
                file_path, upload_data['url'], upload_data['user_hash'], filename
            )

            if not file_id:
                raise Exception("文件上传失败")

            # 获取下载链接
            download_url = await self._get_turbobit_download_url(file_id)

            self.logger.info(f"Turbobit 上传成功: {download_url}")
            return download_url

        except Exception as e:
            self.logger.error(f"Turbobit 上传失败: {e}")
            return None

    async def _login_turbobit(self):
        """登录 Turbobit"""
        url = "https://turbobit.net/api/user/login"
        data = {
            'login': config.hosting.turbobit_username,
            'password': config.hosting.turbobit_password
        }

        response = self.session.post(url, data=data, proxies=self.proxies, timeout=30)
        response.raise_for_status()

    async def _get_turbobit_upload_url(self) -> Optional[Dict[str, str]]:
        """获取 Turbobit 上传URL"""
        url = "https://turbobit.net/api/upload/gethost"
        response = self.session.get(url, proxies=self.proxies, timeout=30)
        response.raise_for_status()

        result = response.json()
        if result.get('status') == 'success':
            return {
                'url': result.get('host'),
                'user_hash': result.get('user_hash')
            }
        return None

    async def _upload_to_turbobit_server(self, file_path: str, upload_url: str, user_hash: str, filename: str) -> Optional[str]:
        """上传文件到 Turbobit 服务器"""
        file_path_obj = Path(file_path)
        if not file_path_obj.exists():
            raise Exception(f"文件不存在: {file_path}")

        with open(file_path_obj, 'rb') as f:
            files = {'user_file': (filename, f)}
            data = {'user_hash': user_hash}

            response = self.session.post(upload_url, files=files, data=data, proxies=self.proxies, timeout=3600)
            response.raise_for_status()

            # 解析响应获取文件ID
            result = response.json()
            if result.get('status') == 'success':
                return result.get('id')
            return None

    async def _get_turbobit_download_url(self, file_id: str) -> Optional[str]:
        """获取 Turbobit 下载链接"""
        # Turbobit 通常使用固定的URL格式
        return f"https://turbobit.net/{file_id}.html"

    async def upload_to_filecat(self, file_path: str, filename: str) -> Optional[str]:
        """
        上传文件到 FileCat

        Args:
            file_path: 本地文件路径
            filename: 文件名

        Returns:
            下载链接，失败返回None
        """
        try:
            if not config.hosting.filecat_api_key:
                self.logger.warning("FileCat API Key 未配置")
                return None

            if config.system.dry_run:
                self.logger.info(f"试运行模式：模拟上传到 FileCat: {filename}")
                return f"https://filecat.net/file/mock_{int(time.time())}_{filename}"

            # FileCat API 调用
            await self._login_filecat()

            # 上传文件
            file_id = await self._upload_to_filecat_server(file_path, filename)

            if not file_id:
                raise Exception("文件上传失败")

            # 获取下载链接
            download_url = f"https://filecat.net/d/{file_id}"

            self.logger.info(f"FileCat 上传成功: {download_url}")
            return download_url

        except Exception as e:
            self.logger.error(f"FileCat 上传失败: {e}")
            return None

    async def _login_filecat(self):
        """登录 FileCat"""
        url = "https://filecat.net/api/login"
        data = {
            'username': config.hosting.filecat_username,
            'password': config.hosting.filecat_password,
            'api_key': config.hosting.filecat_api_key
        }

        response = self.session.post(url, data=data, proxies=self.proxies, timeout=30)
        response.raise_for_status()

    async def _upload_to_filecat_server(self, file_path: str, filename: str) -> Optional[str]:
        """上传文件到 FileCat 服务器"""
        file_path_obj = Path(file_path)
        if not file_path_obj.exists():
            raise Exception(f"文件不存在: {file_path}")

        url = "https://filecat.net/api/upload"

        with open(file_path_obj, 'rb') as f:
            files = {'file': (filename, f)}
            data = {
                'api_key': config.hosting.filecat_api_key
            }

            response = self.session.post(url, files=files, data=data, proxies=self.proxies, timeout=3600)
            response.raise_for_status()

            # 解析响应获取文件ID
            result = response.json()
            if result.get('success'):
                return result.get('file_id')
            return None

    async def upload_to_all_platforms(
        self,
        file_path: str,
        filename: str,
        platforms: Optional[List[str]] = None
    ) -> Dict[str, Optional[str]]:
        """
        上传文件到所有配置的平台

        Args:
            file_path: 本地文件路径
            filename: 文件名
            platforms: 指定平台列表，None表示全部

        Returns:
            平台名称到下载链接的映射
        """
        if platforms is None:
            platforms = ['rapidgator', 'turbobit', 'filecat']

        results = {}

        # 并发上传到不同平台
        upload_tasks = []

        if 'rapidgator' in platforms and config.hosting.rapidgator_api_key:
            upload_tasks.append(('rapidgator', self.upload_to_rapidgator(file_path, filename)))

        if 'turbobit' in platforms and config.hosting.turbobit_api_key:
            upload_tasks.append(('turbobit', self.upload_to_turbobit(file_path, filename)))

        if 'filecat' in platforms and config.hosting.filecat_api_key:
            upload_tasks.append(('filecat', self.upload_to_filecat(file_path, filename)))

        # 等待所有上传完成
        for platform_name, upload_task in upload_tasks:
            try:
                self.logger.info(f"开始上传到 {platform_name.title()}")
                url = await upload_task
                results[platform_name] = url

                if url:
                    self.logger.info(f"{platform_name.title()} 上传成功")
                else:
                    self.logger.warning(f"{platform_name.title()} 上传失败")

            except Exception as e:
                self.logger.error(f"{platform_name.title()} 上传出错: {e}")
                results[platform_name] = None

        successful_uploads = [url for url in results.values() if url]
        self.logger.info(f"批量上传完成: {len(successful_uploads)}/{len(upload_tasks)} 个平台成功")

        return results

    async def get_upload_progress(self, file_path: str) -> Dict[str, Any]:
        """获取上传进度信息"""
        try:
            file_path_obj = Path(file_path)
            if not file_path_obj.exists():
                return {'error': '文件不存在'}

            file_size = file_path_obj.stat().st_size
            file_size_mb = file_size / (1024 * 1024)

            return {
                'filename': file_path_obj.name,
                'file_size_bytes': file_size,
                'file_size_mb': file_size_mb,
                'estimated_time_minutes': self._estimate_upload_time(file_size_mb),
                'recommended_platforms': self._get_recommended_platforms(file_size_mb)
            }

        except Exception as e:
            return {'error': str(e)}

    def _estimate_upload_time(self, file_size_mb: float) -> float:
        """估算上传时间（分钟）"""
        # 假设平均上传速度为 5MB/s
        upload_speed_mbps = 5.0
        time_seconds = file_size_mb / upload_speed_mbps
        return time_seconds / 60  # 转换为分钟

    def _get_recommended_platforms(self, file_size_mb: float) -> List[str]:
        """根据文件大小推荐上传平台"""
        platforms = ['rapidgator', 'turbobit', 'filecat']

        # 根据文件大小调整推荐
        if file_size_mb > 1000:  # 大于1GB
            # 大文件优先推荐支持大文件的平台
            platforms = ['rapidgator', 'turbobit', 'filecat']
        elif file_size_mb > 100:  # 100MB-1GB
            # 中等文件
            platforms = ['turbobit', 'rapidgator', 'filecat']
        else:  # 小于100MB
            # 小文件
            platforms = ['filecat', 'turbobit', 'rapidgator']

        return platforms

    async def test_platform_connection(self, platform: str) -> bool:
        """测试平台连接"""
        try:
            if platform == 'rapidgator':
                if not config.hosting.rapidgator_api_key:
                    return False
                await self._login_rapidgator()
                return True

            elif platform == 'turbobit':
                if not config.hosting.turbobit_api_key:
                    return False
                await self._login_turbobit()
                return True

            elif platform == 'filecat':
                if not config.hosting.filecat_api_key:
                    return False
                await self._login_filecat()
                return True

            else:
                self.logger.warning(f"未知平台: {platform}")
                return False

        except Exception as e:
            self.logger.error(f"{platform.title()} 连接测试失败: {e}")
            return False

    async def get_platform_status(self) -> Dict[str, Dict[str, Any]]:
        """获取所有平台状态"""
        platforms = ['rapidgator', 'turbobit', 'filecat']
        status = {}

        for platform in platforms:
            platform_config = getattr(config.hosting, f'{platform}_api_key', None)
            is_configured = bool(platform_config and not platform_config.startswith('your-'))

            status[platform] = {
                'configured': is_configured,
                'connected': False,
                'api_key_configured': is_configured,
                'username_configured': bool(getattr(config.hosting, f'{platform}_username', None))
            }

            if is_configured:
                try:
                    status[platform]['connected'] = await self.test_platform_connection(platform)
                except Exception as e:
                    status[platform]['error'] = str(e)

        return status

    def __del__(self):
        """清理资源"""
        if hasattr(self, 'session'):
            self.session.close()


# 全局实例
hosting_manager = HostingManager()


# 便捷函数
async def upload_to_all_platforms(file_path: str, filename: str) -> Dict[str, Optional[str]]:
    """上传到所有平台"""
    return await hosting_manager.upload_to_all_platforms(file_path, filename)


async def get_hosting_status() -> Dict[str, Dict[str, Any]]:
    """获取托管平台状态"""
    return await hosting_manager.get_platform_status()