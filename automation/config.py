#!/usr/bin/env python3
"""
ResLibs 自动化脚本配置管理
加载和验证所有环境变量配置
"""

import os
import logging
from typing import Dict, List, Optional
from pathlib import Path
from dataclasses import dataclass, field
from dotenv import load_dotenv

# 加载自动化专用环境变量
load_dotenv('.env.automation')


@dataclass
class DatabaseConfig:
    """数据库配置"""
    url: str
    pool_size: int = 10
    max_overflow: int = 20

    def __post_init__(self):
        if not self.url:
            raise ValueError("DATABASE_URL 环境变量未设置")


@dataclass
class AIConfig:
    """AI 内容生成配置"""
    gemini_api_key: str
    gemini_model: str = "gemini-1.5-flash"
    content_language: str = "zh-CN"

    def __post_init__(self):
        if not self.gemini_api_key:
            raise ValueError("GEMINI_API_KEY 环境变量未设置")


@dataclass
class BaiduPanConfig:
    """百度网盘配置"""
    path: str
    access_token: str = ""
    refresh_token: str = ""
    app_id: str = ""
    app_secret: str = ""
    open_api_key: str = ""
    open_secret_key: str = ""

    def __post_init__(self):
        if not self.path:
            raise ValueError("BAIDU_PAN_PATH 环境变量未设置")


@dataclass
class DownloadConfig:
    """下载配置"""
    base_dir: str = "./temp/downloads"
    max_file_size: str = "5GB"
    concurrent_downloads: int = 3
    retry_attempts: int = 3
    retry_delay: int = 5
    supported_extensions: List[str] = field(default_factory=lambda: [
        ".zip", ".rar", ".7z", ".tar", ".gz", ".unitypackage",
        ".exe", ".msi", ".dmg", ".pkg", ".psd", ".ai", ".sketch",
        ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff",
        ".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv",
        ".mp3", ".wav", ".flac", ".aac",
        ".pdf", ".epub", ".mobi", ".azw", ".azw3"
    ])

    def __post_init__(self):
        # 创建下载目录
        Path(self.base_dir).mkdir(parents=True, exist_ok=True)

    def parse_size(self) -> int:
        """解析文件大小字符串为字节数"""
        size_str = self.max_file_size.upper()
        if size_str.endswith('GB'):
            return int(size_str[:-2]) * 1024 * 1024 * 1024
        elif size_str.endswith('MB'):
            return int(size_str[:-2]) * 1024 * 1024
        elif size_str.endswith('KB'):
            return int(size_str[:-2]) * 1024
        else:
            return int(size_str)


@dataclass
class ImageConfig:
    """图片搜索和下载配置"""
    unsplash_access_key: str = ""
    pexels_api_key: str = ""
    pixabay_api_key: str = ""
    download_dir: str = "./temp/images"
    max_image_size: str = "5MB"
    images_per_resource: int = 5

    def __post_init__(self):
        # 创建图片下载目录
        Path(self.download_dir).mkdir(parents=True, exist_ok=True)


@dataclass
class CloudflareConfig:
    """Cloudflare R2 图床配置"""
    account_id: str
    r2_access_key_id: str
    r2_secret_access_key: str
    bucket_name: str
    endpoint: str
    custom_domain: str = ""

    def __post_init__(self):
        required_fields = [
            'account_id', 'r2_access_key_id',
            'r2_secret_access_key', 'bucket_name', 'endpoint'
        ]
        for field in required_fields:
            if not getattr(self, field):
                raise ValueError(f"CLOUDFLARE_{field.upper()} 环境变量未设置")


@dataclass
class HostingConfig:
    """付费下载平台配置"""
    rapidgator_api_key: str = ""
    rapidgator_username: str = ""
    rapidgator_password: str = ""

    turbobit_api_key: str = ""
    turbobit_username: str = ""
    turbobit_password: str = ""

    filecat_api_key: str = ""
    filecat_username: str = ""
    filecat_password: str = ""

    upload_chunk_size: int = 10 * 1024 * 1024  # 10MB
    upload_timeout: int = 3600  # 1小时
    upload_concurrent: int = 2


@dataclass
class LoggingConfig:
    """日志配置"""
    level: str = "INFO"
    file_path: str = "./logs/automation.log"
    max_size: str = "10MB"
    backup_count: int = 5

    def __post_init__(self):
        # 创建日志目录
        Path(self.file_path).parent.mkdir(parents=True, exist_ok=True)

    def parse_max_size(self) -> int:
        """解析日志最大文件大小"""
        size_str = self.max_size.upper()
        if size_str.endswith('MB'):
            return int(size_str[:-2]) * 1024 * 1024
        elif size_str.endswith('KB'):
            return int(size_str[:-2]) * 1024
        else:
            return int(size_str)


@dataclass
class SystemConfig:
    """系统配置"""
    debug_mode: bool = False
    dry_run: bool = False
    pause_between_steps: int = 3
    max_concurrent_resources: int = 2
    processing_timeout: int = 7200  # 2小时
    memory_limit: str = "4GB"
    disk_space_threshold: str = "10GB"

    # 代理配置
    http_proxy: str = ""
    https_proxy: str = ""
    socks_proxy: str = ""

    # 通知配置
    webhook_url: str = ""
    email_notifications: bool = False
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    admin_email: str = ""


class AutomationConfig:
    """自动化总配置类"""

    def __init__(self):
        self.load_config()
        self.validate_config()
        self.setup_logging()

    def load_config(self):
        """加载所有配置"""
        self.database = DatabaseConfig(
            url=os.getenv("DATABASE_URL", "")
        )

        self.ai = AIConfig(
            gemini_api_key=os.getenv("GEMINI_API_KEY", ""),
            gemini_model=os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
            content_language=os.getenv("CONTENT_LANGUAGE", "zh-CN")
        )

        self.baidu_pan = BaiduPanConfig(
            path=os.getenv("BAIDU_PAN_PATH", ""),
            access_token=os.getenv("BAIDU_ACCESS_TOKEN", ""),
            refresh_token=os.getenv("BAIDU_REFRESH_TOKEN", ""),
            app_id=os.getenv("BAIDU_APP_ID", ""),
            app_secret=os.getenv("BAIDU_APP_SECRET", ""),
            open_api_key=os.getenv("BAIDU_OPEN_API_KEY", ""),
            open_secret_key=os.getenv("BAIDU_OPEN_SECRET_KEY", "")
        )

        self.download = DownloadConfig(
            base_dir=os.getenv("DOWNLOAD_DIR", "./temp/downloads"),
            max_file_size=os.getenv("MAX_FILE_SIZE", "5GB"),
            concurrent_downloads=int(os.getenv("CONCURRENT_DOWNLOADS", "3")),
            retry_attempts=int(os.getenv("RETRY_ATTEMPTS", "3")),
            retry_delay=int(os.getenv("RETRY_DELAY", "5"))
        )

        self.image = ImageConfig(
            unsplash_access_key=os.getenv("UNSPLASH_ACCESS_KEY", ""),
            pexels_api_key=os.getenv("PEXELS_API_KEY", ""),
            pixabay_api_key=os.getenv("PIXABAY_API_KEY", ""),
            download_dir=os.getenv("IMAGE_DOWNLOAD_DIR", "./temp/images"),
            max_image_size=os.getenv("MAX_IMAGE_SIZE", "5MB"),
            images_per_resource=int(os.getenv("IMAGES_PER_RESOURCE", "5"))
        )

        self.cloudflare = CloudflareConfig(
            account_id=os.getenv("CLOUDFLARE_ACCOUNT_ID", ""),
            r2_access_key_id=os.getenv("CLOUDFLARE_R2_ACCESS_KEY_ID", ""),
            r2_secret_access_key=os.getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY", ""),
            bucket_name=os.getenv("CLOUDFLARE_R2_BUCKET_NAME", ""),
            endpoint=os.getenv("CLOUDFLARE_R2_ENDPOINT", ""),
            custom_domain=os.getenv("CLOUDFLARE_R2_CUSTOM_DOMAIN", "")
        )

        self.hosting = HostingConfig()
        # 手动加载hosting配置以避免过于复杂
        self.hosting.rapidgator_api_key = os.getenv("RAPIDGATOR_API_KEY", "")
        self.hosting.rapidgator_username = os.getenv("RAPIDGATOR_USERNAME", "")
        self.hosting.rapidgator_password = os.getenv("RAPIDGATOR_PASSWORD", "")
        self.hosting.turbobit_api_key = os.getenv("TURBOBIT_API_KEY", "")
        self.hosting.turbobit_username = os.getenv("TURBOBIT_USERNAME", "")
        self.hosting.turbobit_password = os.getenv("TURBOBIT_PASSWORD", "")
        self.hosting.filecat_api_key = os.getenv("FILECAT_API_KEY", "")
        self.hosting.filecat_username = os.getenv("FILECAT_USERNAME", "")
        self.hosting.filecat_password = os.getenv("FILECAT_PASSWORD", "")

        self.logging = LoggingConfig(
            level=os.getenv("LOG_LEVEL", "INFO"),
            file_path=os.getenv("LOG_FILE", "./logs/automation.log"),
            max_size=os.getenv("LOG_MAX_SIZE", "10MB"),
            backup_count=int(os.getenv("LOG_BACKUP_COUNT", "5"))
        )

        self.system = SystemConfig(
            debug_mode=os.getenv("DEBUG_MODE", "false").lower() == "true",
            dry_run=os.getenv("DRY_RUN", "false").lower() == "true",
            pause_between_steps=int(os.getenv("PAUSE_BETWEEN_STEPS", "3")),
            max_concurrent_resources=int(os.getenv("MAX_CONCURRENT_RESOURCES", "2")),
            processing_timeout=int(os.getenv("PROCESSING_TIMEOUT", "7200")),
            memory_limit=os.getenv("MEMORY_LIMIT", "4GB"),
            disk_space_threshold=os.getenv("DISK_SPACE_THRESHOLD", "10GB"),
            http_proxy=os.getenv("HTTP_PROXY", ""),
            https_proxy=os.getenv("HTTPS_PROXY", ""),
            socks_proxy=os.getenv("SOCKS_PROXY", ""),
            webhook_url=os.getenv("WEBHOOK_URL", ""),
            email_notifications=os.getenv("EMAIL_NOTIFICATIONS", "false").lower() == "true",
            smtp_host=os.getenv("SMTP_HOST", ""),
            smtp_port=int(os.getenv("SMTP_PORT", "587")),
            smtp_username=os.getenv("SMTP_USERNAME", ""),
            smtp_password=os.getenv("SMTP_PASSWORD", ""),
            admin_email=os.getenv("ADMIN_EMAIL", "")
        )

    def validate_config(self):
        """验证配置完整性"""
        errors = []

        # 验证必需配置
        if not self.database.url:
            errors.append("数据库配置不完整")

        if not self.ai.gemini_api_key:
            errors.append("Gemini API Key 未设置")

        if not self.baidu_pan.path:
            errors.append("百度网盘路径未设置")

        # 验证Cloudflare配置
        if not self.cloudflare.account_id:
            errors.append("Cloudflare Account ID 未设置")

        if errors:
            raise ValueError("配置验证失败:\n" + "\n".join(errors))

        # 警告可选配置
        warnings = []

        if not any([self.image.unsplash_access_key, self.image.pexels_api_key, self.image.pixabay_api_key]):
            warnings.append("未配置图片搜索API，将无法下载相关图片")

        if not any([
            self.hosting.rapidgator_api_key,
            self.hosting.turbobit_api_key,
            self.hosting.filecat_api_key
        ]):
            warnings.append("未配置付费下载平台，将无法上传文件")

        if warnings:
            print("⚠️ 配置警告:")
            for warning in warnings:
                print(f"  - {warning}")

    def setup_logging(self):
        """设置日志"""
        log_level = getattr(logging, self.logging.level.upper())

        # 创建logger
        self.logger = logging.getLogger("automation")
        self.logger.setLevel(log_level)

        # 创建handler
        from logging.handlers import RotatingFileHandler
        handler = RotatingFileHandler(
            self.logging.file_path,
            maxBytes=self.logging.parse_max_size(),
            backupCount=self.logging.backup_count,
            encoding='utf-8'
        )

        # 创建formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)

        # 添加handler
        if not self.logger.handlers:
            self.logger.addHandler(handler)
            # 添加控制台输出
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)

    def get_proxy_config(self) -> Optional[Dict[str, str]]:
        """获取代理配置"""
        proxies = {}
        if self.system.http_proxy:
            proxies['http'] = self.system.http_proxy
        if self.system.https_proxy:
            proxies['https'] = self.system.https_proxy
        if self.system.socks_proxy:
            proxies['socks5'] = self.system.socks_proxy

        return proxies if proxies else None

    def print_config_summary(self):
        """打印配置摘要"""
        print("=== ResLibs 自动化配置摘要 ===")
        print(f"数据库: {self.database.url[:20]}...")
        print(f"AI模型: {self.ai.gemini_model}")
        print(f"百度网盘路径: {self.baidu_pan.path}")
        print(f"下载目录: {self.download.base_dir}")
        print(f"Cloudflare R2: {self.cloudflare.bucket_name}")
        print(f"调试模式: {self.system.debug_mode}")
        print(f"试运行模式: {self.system.dry_run}")
        print("=" * 40)


# 全局配置实例
config = AutomationConfig()