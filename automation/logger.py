#!/usr/bin/env python3
"""
ResLibs 自动化脚本日志管理
提供统一的日志配置和格式化
"""

import logging
import logging.handlers
import sys
import os
from pathlib import Path
from typing import Optional
from datetime import datetime
from rich.console import Console
from rich.logging import RichHandler
from rich.theme import Theme


class ColoredFormatter(logging.Formatter):
    """彩色日志格式化器"""

    COLORS = {
        'DEBUG': '\033[36m',    # 青色
        'INFO': '\033[32m',     # 绿色
        'WARNING': '\033[33m',  # 黄色
        'ERROR': '\033[31m',    # 红色
        'CRITICAL': '\033[35m', # 紫色
        'RESET': '\033[0m'      # 重置
    }

    def format(self, record):
        # 保存原始颜色
        if hasattr(record, 'levelname'):
            level_color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
            record.levelname = f"{level_color}{record.levelname}{self.COLORS['RESET']}"

        # 格式化消息
        formatted = super().format(record)

        # 添加时间戳颜色
        timestamp = datetime.now().strftime('%H:%M:%S')
        formatted = formatted.replace(
            datetime.now().strftime('%Y-%m-%d'),
            f"\033[90m{datetime.now().strftime('%Y-%m-%d')}\033[0m"
        )

        return formatted


class RichCustomHandler(RichHandler):
    """自定义 Rich 处理器，添加更多控制"""

    def __init__(self, *args, **kwargs):
        # 自定义主题
        custom_theme = Theme({
            "logging.level.debug": "dim cyan",
            "logging.level.info": "green",
            "logging.level.warning": "yellow",
            "logging.level.error": "bold red",
            "logging.level.critical": "bold white on red",
            "log.time": "dim white",
            "log.message": "white",
        })

        console = Console(theme=custom_theme)
        super().__init__(console=console, *args, **kwargs)


def setup_logger(
    name: str,
    level: str = "INFO",
    log_file: Optional[str] = None,
    enable_rich: bool = True
) -> logging.Logger:
    """
    设置日志记录器

    Args:
        name: 日志记录器名称
        level: 日志级别
        log_file: 日志文件路径
        enable_rich: 是否启用 Rich 输出

    Returns:
        配置好的日志记录器
    """
    logger = logging.getLogger(name)

    # 避免重复添加handler
    if logger.handlers:
        return logger

    # 设置日志级别
    log_level = getattr(logging, level.upper())
    logger.setLevel(log_level)

    # 创建格式化器
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    simple_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%H:%M:%S'
    )

    # 添加控制台处理器
    if enable_rich and sys.stdout.isatty():
        # 使用 Rich 处理器（仅在终端中）
        console_handler = RichCustomHandler(
            show_time=True,
            show_path=True,
            markup=True,
            rich_tracebacks=True,
            tracebacks_show_locals=True
        )
        console_handler.setFormatter(simple_formatter)
        logger.addHandler(console_handler)
    else:
        # 使用普通处理器
        console_handler = logging.StreamHandler(sys.stdout)
        if sys.stdout.isatty():
            console_handler.setFormatter(ColoredFormatter(simple_formatter))
        else:
            console_handler.setFormatter(simple_formatter)
        logger.addHandler(console_handler)

    # 添加文件处理器（如果指定了日志文件）
    if log_file:
        try:
            # 确保日志目录存在
            log_path = Path(log_file)
            log_path.parent.mkdir(parents=True, exist_ok=True)

            # 使用轮转文件处理器
            file_handler = logging.handlers.RotatingFileHandler(
                log_file,
                maxBytes=10 * 1024 * 1024,  # 10MB
                backupCount=5,
                encoding='utf-8'
            )
            file_handler.setFormatter(detailed_formatter)
            logger.addHandler(file_handler)

        except Exception as e:
            # 如果文件处理器失败，记录警告但不中断程序
            logger.warning(f"无法创建日志文件处理器: {e}")

    return logger


def get_logger(name: str) -> logging.Logger:
    """获取日志记录器（便捷函数）"""
    return logging.getLogger(name)


class ProgressLogger:
    """进度日志记录器"""

    def __init__(self, logger: logging.Logger, total: int):
        self.logger = logger
        self.total = total
        self.current = 0
        self.start_time = datetime.now()

    def update(self, message: str = "", increment: int = 1):
        """更新进度"""
        self.current += increment
        percentage = (self.current / self.total) * 100
        elapsed = datetime.now() - self.start_time

        # 估算剩余时间
        if self.current > 0:
            avg_time_per_item = elapsed.total_seconds() / self.current
            remaining_items = self.total - self.current
            eta_seconds = avg_time_per_item * remaining_items
            eta = f"{int(eta_seconds // 60)}分{int(eta_seconds % 60)}秒"
        else:
            eta = "未知"

        progress_msg = (
            f"进度: {self.current}/{self.total} "
            f"({percentage:.1f}%) - "
            f"用时: {int(elapsed.total_seconds() // 60)}分{int(elapsed.total_seconds() % 60)}秒 "
            f"- 预计剩余: {eta}"
        )

        if message:
            progress_msg += f" - {message}"

        self.logger.info(progress_msg)

    def finish(self, message: str = ""):
        """完成进度"""
        elapsed = datetime.now() - self.start_time
        finish_msg = (
            f"✅ 完成! 总计: {self.total} 项 "
            f"- 用时: {int(elapsed.total_seconds() // 60)}分{int(elapsed.total_seconds() % 60)}秒"
        )

        if message:
            finish_msg += f" - {message}"

        self.logger.info(finish_msg)


class TaskLogger:
    """任务日志记录器"""

    def __init__(self, logger: logging.Logger, task_name: str):
        self.logger = logger
        self.task_name = task_name
        self.start_time = datetime.now()
        self.steps = []

    def start(self):
        """开始任务"""
        self.logger.info(f"🚀 开始任务: {self.task_name}")
        self.start_time = datetime.now()

    def step(self, step_name: str):
        """记录步骤"""
        elapsed = datetime.now() - self.start_time
        step_msg = f"📋 步骤: {step_name} (用时: {elapsed.total_seconds():.1f}秒)"
        self.logger.info(step_msg)
        self.steps.append((step_name, datetime.now()))

    def success(self, message: str = ""):
        """任务成功完成"""
        elapsed = datetime.now() - self.start_time
        success_msg = f"✅ 任务完成: {self.task_name} (总用时: {elapsed.total_seconds():.1f}秒)"

        if message:
            success_msg += f" - {message}"

        self.logger.info(success_msg)

    def error(self, error_msg: str, exception: Optional[Exception] = None):
        """任务执行出错"""
        elapsed = datetime.now() - self.start_time
        error_log = f"❌ 任务失败: {self.task_name} (用时: {elapsed.total_seconds():.1f}秒) - {error_msg}"

        if exception:
            error_log += f"\n异常详情: {str(exception)}"
            if config.system.debug_mode:
                import traceback
                error_log += f"\n堆栈跟踪:\n{traceback.format_exc()}"

        self.logger.error(error_log)

    def warning(self, warning_msg: str):
        """任务警告"""
        self.logger.warning(f"⚠️ 任务警告: {self.task_name} - {warning_msg}")


# 性能监控日志
class PerformanceLogger:
    """性能监控日志记录器"""

    def __init__(self, logger: logging.Logger):
        self.logger = logger
        self.metrics = {}

    def start_timer(self, operation: str):
        """开始计时"""
        self.metrics[operation] = {
            'start_time': datetime.now(),
            'end_time': None,
            'duration': None
        }

    def end_timer(self, operation: str):
        """结束计时"""
        if operation in self.metrics:
            end_time = datetime.now()
            start_time = self.metrics[operation]['start_time']
            duration = (end_time - start_time).total_seconds()

            self.metrics[operation]['end_time'] = end_time
            self.metrics[operation]['duration'] = duration

            self.logger.info(f"⏱️ 性能统计: {operation} 耗时 {duration:.2f} 秒")

    def log_memory_usage(self, operation: str = ""):
        """记录内存使用情况"""
        try:
            import psutil
            process = psutil.Process(os.getpid())
            memory_info = process.memory_info()
            memory_mb = memory_info.rss / 1024 / 1024

            msg = f"💾 内存使用: {memory_mb:.1f} MB"
            if operation:
                msg += f" (操作: {operation})"

            self.logger.info(msg)

        except ImportError:
            self.logger.warning("psutil 未安装，无法监控内存使用")

    def log_disk_usage(self, path: str = "."):
        """记录磁盘使用情况"""
        try:
            import shutil
            total, used, free = shutil.disk_usage(path)
            total_gb = total / (1024**3)
            used_gb = used / (1024**3)
            free_gb = free / (1024**3)

            self.logger.info(
                f"💿 磁盘使用 {path}: "
                f"总计 {total_gb:.1f} GB, "
                f"已用 {used_gb:.1f} GB, "
                f"剩余 {free_gb:.1f} GB"
            )

        except Exception as e:
            self.logger.warning(f"无法获取磁盘使用情况: {e}")

    def get_summary(self) -> str:
        """获取性能摘要"""
        summary_lines = ["📊 性能摘要:"]

        for operation, data in self.metrics.items():
            if data['duration']:
                summary_lines.append(
                    f"  {operation}: {data['duration']:.2f} 秒"
                )

        return "\n".join(summary_lines)


# 全局配置
def configure_logging(config):
    """从配置对象配置全局日志"""
    # 设置根日志级别
    logging.getLogger().setLevel(getattr(logging, config.logging.level))

    # 创建主日志记录器
    main_logger = setup_logger(
        "automation",
        level=config.logging.level,
        log_file=config.logging.file_path,
        enable_rich=True
    )

    return main_logger


# 从配置导入（避免循环导入）
try:
    from automation.config import config
    main_logger = configure_logging(config)
except ImportError:
    # 如果配置未加载，使用默认配置
    main_logger = setup_logger("automation")