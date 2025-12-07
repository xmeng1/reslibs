#!/usr/bin/env python3
"""
ResLibs 图片管理器
搜索、下载和管理相关图片，集成多个图片源API
"""

import os
import json
import asyncio
import logging
from typing import List, Dict, Optional, Any
from pathlib import Path
from datetime import datetime
import requests
from urllib.parse import urlencode, quote

from automation.config import config
from automation.logger import setup_logger


class ImageManager:
    """图片管理器"""

    def __init__(self):
        self.logger = setup_logger("ImageManager")
        self.session = requests.Session()
        self.proxies = config.get_proxy_config()

        # 设置请求头
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    async def search_and_download_images(
        self,
        title: str,
        description: str,
        tags: List[str],
        resource_type: str,
        max_images: int = 5
    ) -> List[str]:
        """
        搜索并下载相关图片

        Args:
            title: 资源标题
            description: 资源描述
            tags: 标签列表
            resource_type: 资源类型
            max_images: 最大图片数量

        Returns:
            下载的图片路径列表
        """
        try:
            if config.system.dry_run:
                self.logger.info("试运行模式：模拟图片搜索和下载")
                return await self._simulate_image_download(max_images)

            # 构建搜索关键词
            search_query = self._build_search_query(title, description, tags, resource_type)

            self.logger.info(f"搜索图片关键词: {search_query}")

            # 从多个源搜索图片
            all_images = []

            # Unsplash
            if config.image.unsplash_access_key:
                unsplash_images = await self._search_unsplash(search_query, max_images // 2)
                all_images.extend(unsplash_images)

            # Pexels
            if config.image.pexels_api_key:
                pexels_images = await self._search_pexels(search_query, max_images // 2)
                all_images.extend(pexels_images)

            # Pixabay
            if config.image.pixabay_api_key:
                pixabay_images = await self._search_pixabay(search_query, max_images // 2)
                all_images.extend(pixabay_images)

            # 如果没有配置API，使用备用图片
            if not all_images:
                self.logger.warning("未配置图片搜索API，使用备用图片")
                all_images = await self._get_fallback_images(resource_type, max_images)

            # 下载图片
            downloaded_images = []
            for i, image_info in enumerate(all_images[:max_images]):
                try:
                    image_path = await self._download_image(
                        image_info['url'],
                        f"{resource_type}_{i+1}",
                        image_info.get('id', '')
                    )
                    if image_path:
                        downloaded_images.append(image_path)
                except Exception as e:
                    self.logger.warning(f"下载第 {i+1} 张图片失败: {e}")
                    continue

            self.logger.info(f"成功下载 {len(downloaded_images)} 张图片")
            return downloaded_images

        except Exception as e:
            self.logger.error(f"搜索和下载图片失败: {e}")
            # 返回模拟图片以避免流程中断
            return await self._simulate_image_download(max_images)

    def _build_search_query(
        self,
        title: str,
        description: str,
        tags: List[str],
        resource_type: str
    ) -> str:
        """构建搜索关键词"""
        # 资源类型相关的关键词
        type_keywords = {
            "unity-assets": ["Unity", "3D", "game", "assets", "development"],
            "software-tools": ["software", "tool", "app", "program", "technology"],
            "design-assets": ["design", "UI", "interface", "graphic", "creative"],
            "video-courses": ["course", "tutorial", "education", "learning", "training"],
            "audio-resources": ["audio", "sound", "music", "wave", "multimedia"],
            "3d-models": ["3D", "model", "render", "CGI", "animation"]
        }

        # 从标题提取关键词
        title_words = [word for word in title.split() if len(word) > 2]

        # 从标签提取关键词
        tag_words = [tag for tag in tags if len(tag) > 2 and tag not in type_keywords.get(resource_type, [])]

        # 组合关键词
        keywords = []
        keywords.extend(type_keywords.get(resource_type, [])[:3])
        keywords.extend(title_words[:2])
        keywords.extend(tag_words[:2])

        # 添加通用关键词
        if resource_type == "unity-assets":
            keywords.extend(["game development", "indie game"])
        elif resource_type == "design-assets":
            keywords.extend(["user interface", "UX"])
        elif resource_type == "software-tools":
            keywords.extend(["productivity", "application"])

        # 去重并返回前几个关键词
        unique_keywords = list(dict.fromkeys(keywords))[:5]
        search_query = " ".join(unique_keywords)

        self.logger.info(f"构建搜索关键词: {search_query}")
        return search_query

    async def _search_unsplash(self, query: str, per_page: int = 10) -> List[Dict[str, Any]]:
        """搜索 Unsplash 图片"""
        try:
            url = "https://api.unsplash.com/search/photos"
            params = {
                'query': query,
                'per_page': per_page,
                'orientation': 'all',
                'content_filter': 'high'
            }
            headers = {
                'Authorization': f'Client-ID {config.image.unsplash_access_key}'
            }

            response = self.session.get(
                url, params=params, headers=headers, proxies=self.proxies, timeout=30
            )
            response.raise_for_status()

            data = response.json()
            images = []

            for photo in data.get('results', []):
                image_info = {
                    'id': photo['id'],
                    'url': photo['urls']['regular'],
                    'thumb_url': photo['urls']['thumb'],
                    'description': photo.get('description', ''),
                    'photographer': photo['user']['name'],
                    'source': 'unsplash'
                }
                images.append(image_info)

            self.logger.info(f"Unsplash 搜索结果: {len(images)} 张图片")
            return images

        except Exception as e:
            self.logger.warning(f"Unsplash 搜索失败: {e}")
            return []

    async def _search_pexels(self, query: str, per_page: int = 10) -> List[Dict[str, Any]]:
        """搜索 Pexels 图片"""
        try:
            url = "https://api.pexels.com/v1/search"
            params = {
                'query': query,
                'per_page': per_page,
                'orientation': 'all'
            }
            headers = {
                'Authorization': config.image.pexels_api_key
            }

            response = self.session.get(
                url, params=params, headers=headers, proxies=self.proxies, timeout=30
            )
            response.raise_for_status()

            data = response.json()
            images = []

            for photo in data.get('photos', []):
                image_info = {
                    'id': photo['id'],
                    'url': photo['src']['large'],
                    'thumb_url': photo['src']['medium'],
                    'description': photo.get('alt', ''),
                    'photographer': photo['photographer'],
                    'source': 'pexels'
                }
                images.append(image_info)

            self.logger.info(f"Pexels 搜索结果: {len(images)} 张图片")
            return images

        except Exception as e:
            self.logger.warning(f"Pexels 搜索失败: {e}")
            return []

    async def _search_pixabay(self, query: str, per_page: int = 10) -> List[Dict[str, Any]]:
        """搜索 Pixabay 图片"""
        try:
            url = "https://pixabay.com/api/"
            params = {
                'key': config.image.pixabay_api_key,
                'q': query,
                'per_page': per_page,
                'image_type': 'all',
                'safesearch': 'true'
            }

            response = self.session.get(url, params=params, proxies=self.proxies, timeout=30)
            response.raise_for_status()

            data = response.json()
            images = []

            for photo in data.get('hits', []):
                image_info = {
                    'id': photo['id'],
                    'url': photo['webformatURL'],
                    'thumb_url': photo['previewURL'],
                    'description': photo.get('tags', ''),
                    'photographer': photo['user'],
                    'source': 'pixabay'
                }
                images.append(image_info)

            self.logger.info(f"Pixabay 搜索结果: {len(images)} 张图片")
            return images

        except Exception as e:
            self.logger.warning(f"Pixabay 搜索失败: {e}")
            return []

    async def _get_fallback_images(self, resource_type: str, max_images: int) -> List[Dict[str, Any]]:
        """获取备用图片"""
        # 使用一些免费的图片URL作为备用
        fallback_urls = [
            "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800"
        ]

        images = []
        for i, url in enumerate(fallback_urls[:max_images]):
            image_info = {
                'id': f'fallback_{i}',
                'url': url,
                'thumb_url': url,
                'description': f'{resource_type} 相关图片',
                'photographer': 'ResLibs',
                'source': 'fallback'
            }
            images.append(image_info)

        self.logger.info(f"获取备用图片: {len(images)} 张")
        return images

    async def _download_image(self, url: str, filename: str, image_id: str = "") -> str:
        """下载图片"""
        try:
            # 创建下载目录
            download_dir = Path(config.image.download_dir)
            download_dir.mkdir(parents=True, exist_ok=True)

            # 生成文件名
            file_extension = self._get_image_extension(url)
            if not file_extension:
                file_extension = '.jpg'  # 默认使用jpg

            safe_filename = f"{filename}_{image_id[:8] if image_id else 'img'}{file_extension}"
            # 确保文件名安全
            safe_filename = "".join(c for c in safe_filename if c.isalnum() or c in '._-')

            file_path = download_dir / safe_filename

            self.logger.info(f"下载图片: {safe_filename}")

            # 下载图片
            response = self.session.get(url, stream=True, proxies=self.proxies, timeout=30)
            response.raise_for_status()

            # 检查内容类型
            content_type = response.headers.get('content-type', '')
            if not content_type.startswith('image/'):
                raise Exception(f"不是图片格式: {content_type}")

            # 检查文件大小
            content_length = int(response.headers.get('content-length', 0))
            max_size = config.image.parse_max_size() if hasattr(config.image, 'parse_max_size') else 5 * 1024 * 1024
            if content_length > max_size:
                raise Exception(f"图片文件过大: {content_length} bytes")

            # 写入文件
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

            # 验证下载的文件
            if not self._is_valid_image(file_path):
                file_path.unlink()  # 删除无效文件
                raise Exception("下载的图片文件无效")

            self.logger.info(f"图片下载完成: {file_path}")
            return str(file_path)

        except Exception as e:
            self.logger.warning(f"下载图片失败 {url}: {e}")
            # 尝试生成占位符图片
            return await self._generate_placeholder_image(filename, resource_type="")

    def _get_image_extension(self, url: str) -> str:
        """从URL获取图片扩展名"""
        path = Path(url)
        extension = path.suffix.lower()

        if extension in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']:
            return extension

        # 尝试从URL参数中获取
        if 'format=' in url:
            format_param = url.split('format=')[1].split('&')[0]
            if format_param in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                return f'.{format_param}'

        return ''

    def _is_valid_image(self, file_path: Path) -> bool:
        """验证图片文件是否有效"""
        try:
            from PIL import Image

            with Image.open(file_path) as img:
                img.verify()
            return True
        except Exception:
            # 如果 PIL 不可用，简单检查文件头
            try:
                with open(file_path, 'rb') as f:
                    header = f.read(8)

                # 检查常见图片格式的文件头
                image_signatures = [
                    b'\xFF\xD8\xFF',  # JPEG
                    b'\x89PNG\r\n\x1a\n',  # PNG
                    b'GIF87a',  # GIF87a
                    b'GIF89a',  # GIF89a
                    b'RIFF',    # WEBP (need to check further)
                    b'BM',      # BMP
                ]

                return any(header.startswith(sig) for sig in image_signatures)
            except Exception:
                return False

    async def _generate_placeholder_image(self, filename: str, resource_type: str) -> str:
        """生成占位符图片"""
        try:
            from PIL import Image, ImageDraw, ImageFont

            # 创建图片
            width, height = 800, 600
            image = Image.new('RGB', (width, height), color='#f0f0f0')
            draw = ImageDraw.Draw(image)

            # 绘制占位符内容
            text = f"{resource_type.title()}\n{filename}"
            bbox = draw.textbbox((0, 0), text)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]

            x = (width - text_width) // 2
            y = (height - text_height) // 2

            draw.text((x, y), text, fill='#666666')

            # 保存图片
            download_dir = Path(config.image.download_dir)
            download_dir.mkdir(parents=True, exist_ok=True)

            safe_filename = f"{filename}_placeholder.jpg"
            safe_filename = "".join(c for c in safe_filename if c.isalnum() or c in '._-')

            file_path = download_dir / safe_filename
            image.save(file_path, 'JPEG', quality=85)

            self.logger.info(f"生成占位符图片: {file_path}")
            return str(file_path)

        except ImportError:
            self.logger.warning("PIL 未安装，无法生成占位符图片")
            # 创建一个简单的文本文件作为占位符
            download_dir = Path(config.image.download_dir)
            download_dir.mkdir(parents=True, exist_ok=True)

            safe_filename = f"{filename}_placeholder.txt"
            safe_filename = "".join(c for c in safe_filename if c.isalnum() or c in '._-')

            file_path = download_dir / safe_filename
            file_path.write_text(f"图片占位符\n资源类型: {resource_type}\n文件名: {filename}", encoding='utf-8')

            return str(file_path)
        except Exception as e:
            self.logger.error(f"生成占位符图片失败: {e}")
            return ""

    async def _simulate_image_download(self, max_images: int) -> List[str]:
        """模拟图片下载"""
        self.logger.info(f"模拟下载 {max_images} 张图片")

        download_dir = Path(config.image.download_dir)
        download_dir.mkdir(parents=True, exist_ok=True)

        downloaded_images = []

        for i in range(max_images):
            # 创建模拟图片文件
            placeholder_text = f"""
模拟图片文件 {i+1}

这是一个模拟图片文件，用于测试 ResLibs 自动化流程。

图片序号: {i+1}
生成时间: {datetime.now().isoformat()}
目的: 测试图片处理流程

在实际使用中，这里会是真实的图片文件。
            """.encode('utf-8')

            filename = f"mock_image_{i+1:02d}.txt"
            file_path = download_dir / filename

            with open(file_path, 'wb') as f:
                f.write(placeholder_text)

            downloaded_images.append(str(file_path))

        self.logger.info(f"模拟图片下载完成: {len(downloaded_images)} 个文件")
        return downloaded_images

    async def optimize_image(self, image_path: str) -> str:
        """优化图片（压缩、调整大小等）"""
        try:
            from PIL import Image

            file_path = Path(image_path)
            optimized_path = file_path.with_suffix(f'_optimized{file_path.suffix}')

            with Image.open(file_path) as img:
                # 转换为RGB模式（用于JPEG）
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')

                # 调整大小（如果太大）
                max_width, max_height = 1920, 1080
                if img.width > max_width or img.height > max_height:
                    img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)

                # 保存优化后的图片
                img.save(optimized_path, 'JPEG', quality=85, optimize=True)

            # 替换原文件
            optimized_path.replace(file_path)

            self.logger.info(f"图片优化完成: {image_path}")
            return image_path

        except ImportError:
            self.logger.warning("PIL 未安装，跳过图片优化")
            return image_path
        except Exception as e:
            self.logger.warning(f"图片优化失败: {e}")
            return image_path

    async def get_image_info(self, image_path: str) -> Dict[str, Any]:
        """获取图片信息"""
        try:
            from PIL import Image
            import os

            with Image.open(image_path) as img:
                return {
                    'width': img.width,
                    'height': img.height,
                    'mode': img.mode,
                    'format': img.format,
                    'size_bytes': os.path.getsize(image_path),
                    'size_mb': os.path.getsize(image_path) / (1024 * 1024)
                }
        except Exception as e:
            self.logger.warning(f"获取图片信息失败: {e}")
            return {}

    def __del__(self):
        """清理资源"""
        if hasattr(self, 'session'):
            self.session.close()