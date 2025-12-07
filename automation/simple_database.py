#!/usr/bin/env python3
"""
ResLibs 简化版数据库管理
使用 SQLite 实现本地数据存储
"""

import sqlite3
import json
import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path

from automation.config import config
from automation.logger import setup_logger


class SimpleDatabaseManager:
    """简化版数据库管理器"""

    def __init__(self, db_path: str = "./data/automation.db"):
        self.logger = setup_logger("SimpleDatabaseManager")
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.connection = None

    async def connect(self):
        """连接数据库"""
        try:
            self.connection = sqlite3.connect(
                str(self.db_path),
                check_same_thread=False,
                timeout=30.0
            )
            self.connection.row_factory = sqlite3.Row
            await self._create_tables()
            self.logger.info(f"SQLite 数据库连接成功: {self.db_path}")
        except Exception as e:
            self.logger.error(f"数据库连接失败: {e}")
            raise

    async def disconnect(self):
        """断开数据库连接"""
        if self.connection:
            self.connection.close()
            self.logger.info("数据库连接已断开")

    async def _create_tables(self):
        """创建数据表"""
        cursor = self.connection.cursor()

        # 资源表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                title_en TEXT,
                description TEXT,
                meta_description TEXT,
                resource_type TEXT NOT NULL,
                file_size INTEGER,
                file_format TEXT,
                download_links TEXT,  -- JSON 字符串
                image_urls TEXT,      -- JSON 字符串
                tags TEXT,            -- JSON 字符串
                status TEXT DEFAULT 'draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # 分类表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                name_en TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # 创建索引
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_resources_title ON resources(title)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status)')

        self.connection.commit()
        self.logger.info("数据表创建/检查完成")

    async def create_resource(self, resource_data: Dict[str, Any]) -> Optional[int]:
        """创建资源记录"""
        try:
            cursor = self.connection.cursor()

            # 序列化 JSON 字段
            download_links_json = json.dumps(resource_data.get('download_links', []))
            image_urls_json = json.dumps(resource_data.get('image_urls', []))
            tags_json = json.dumps(resource_data.get('tags', []))

            cursor.execute('''
                INSERT INTO resources (
                    title, title_en, description, meta_description,
                    resource_type, file_size, file_format,
                    download_links, image_urls, tags, status,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                resource_data.get('title'),
                resource_data.get('title_en'),
                resource_data.get('description'),
                resource_data.get('meta_description'),
                resource_data.get('resource_type'),
                resource_data.get('file_size'),
                resource_data.get('file_format'),
                download_links_json,
                image_urls_json,
                tags_json,
                resource_data.get('status', 'published'),
                datetime.now(),
                datetime.now()
            ))

            self.connection.commit()
            resource_id = cursor.lastrowid

            self.logger.info(f"资源创建成功，ID: {resource_id}")
            return resource_id

        except Exception as e:
            self.logger.error(f"创建资源失败: {e}")
            if self.connection:
                self.connection.rollback()
            return None

    async def get_resource_by_id(self, resource_id: int) -> Optional[Dict[str, Any]]:
        """根据ID获取资源"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('SELECT * FROM resources WHERE id = ?', (resource_id,))
            row = cursor.fetchone()

            if row:
                return self._row_to_dict(row)
            return None

        except Exception as e:
            self.logger.error(f"获取资源失败: {e}")
            return None

    async def get_resource_by_title(self, title: str) -> Optional[Dict[str, Any]]:
        """根据标题获取资源"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('SELECT * FROM resources WHERE title = ?', (title,))
            row = cursor.fetchone()

            if row:
                return self._row_to_dict(row)
            return None

        except Exception as e:
            self.logger.error(f"获取资源失败: {e}")
            return None

    async def update_resource(self, resource_id: int, updates: Dict[str, Any]) -> bool:
        """更新资源"""
        try:
            cursor = self.connection.cursor()

            # 构建 SET 子句
            set_clauses = []
            values = []

            for key, value in updates.items():
                if key in ['download_links', 'image_urls', 'tags']:
                    # JSON 字段需要序列化
                    set_clauses.append(f"{key} = ?")
                    values.append(json.dumps(value))
                elif key in ['created_at', 'updated_at']:
                    # 时间字段
                    set_clauses.append(f"{key} = ?")
                    values.append(value)
                elif key not in ['id']:  # 排除主键
                    set_clauses.append(f"{key} = ?")
                    values.append(value)

            if not set_clauses:
                return False  # 没有需要更新的字段

            # 添加更新时间
            set_clauses.append("updated_at = ?")
            values.append(datetime.now())

            # 添加 WHERE 条件
            values.append(resource_id)

            sql = f"UPDATE resources SET {', '.join(set_clauses)} WHERE id = ?"
            cursor.execute(sql, values)

            self.connection.commit()
            success = cursor.rowcount > 0

            if success:
                self.logger.info(f"资源更新成功，ID: {resource_id}")
            else:
                self.logger.warning(f"未找到要更新的资源，ID: {resource_id}")

            return success

        except Exception as e:
            self.logger.error(f"更新资源失败: {e}")
            if self.connection:
                self.connection.rollback()
            return False

    async def update_resource_status(self, resource_id: int, status: str) -> bool:
        """更新资源状态"""
        return await self.update_resource(resource_id, {'status': status})

    async def delete_resource(self, resource_id: int) -> bool:
        """删除资源"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('DELETE FROM resources WHERE id = ?', (resource_id,))

            self.connection.commit()
            success = cursor.rowcount > 0

            if success:
                self.logger.info(f"资源删除成功，ID: {resource_id}")
            else:
                self.logger.warning(f"未找到要删除的资源，ID: {resource_id}")

            return success

        except Exception as e:
            self.logger.error(f"删除资源失败: {e}")
            if self.connection:
                self.connection.rollback()
            return False

    async def get_recent_resources(self, limit: int = 10) -> List[Dict[str, Any]]:
        """获取最近的资源"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                SELECT * FROM resources
                ORDER BY created_at DESC
                LIMIT ?
            ''', (limit,))

            rows = cursor.fetchall()
            return [self._row_to_dict(row) for row in rows]

        except Exception as e:
            self.logger.error(f"获取最近资源失败: {e}")
            return []

    async def search_resources(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """搜索资源"""
        try:
            cursor = self.connection.cursor()
            search_pattern = f"%{query}%"

            cursor.execute('''
                SELECT * FROM resources
                WHERE title LIKE ? OR description LIKE ?
                ORDER BY created_at DESC
                LIMIT ?
            ''', (search_pattern, search_pattern, limit))

            rows = cursor.fetchall()
            return [self._row_to_dict(row) for row in rows]

        except Exception as e:
            self.logger.error(f"搜索资源失败: {e}")
            return []

    async def get_resources_by_type(self, resource_type: str, limit: int = 20) -> List[Dict[str, Any]]:
        """根据类型获取资源"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                SELECT * FROM resources
                WHERE resource_type = ?
                ORDER BY created_at DESC
                LIMIT ?
            ''', (resource_type, limit))

            rows = cursor.fetchall()
            return [self._row_to_dict(row) for row in rows]

        except Exception as e:
            self.logger.error(f"获取类型资源失败: {e}")
            return []

    async def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息"""
        try:
            cursor = self.connection.cursor()

            # 总资源数
            cursor.execute('SELECT COUNT(*) FROM resources')
            total_count = cursor.fetchone()[0]

            # 已发布资源数
            cursor.execute('SELECT COUNT(*) FROM resources WHERE status = ?', ('published',))
            published_count = cursor.fetchone()[0]

            # 按类型统计
            cursor.execute('''
                SELECT resource_type, COUNT(*) as count
                FROM resources
                GROUP BY resource_type
            ''')
            type_stats = cursor.fetchall()
            resource_types = [{'type': row[0], 'count': row[1]} for row in type_stats]

            # 按状态统计
            cursor.execute('''
                SELECT status, COUNT(*) as count
                FROM resources
                GROUP BY status
            ''')
            status_stats = cursor.fetchall()
            status_counts = dict(status_stats)

            # 总文件大小
            cursor.execute('SELECT SUM(file_size) FROM resources WHERE file_size IS NOT NULL')
            total_size = cursor.fetchone()[0] or 0

            return {
                'total_resources': total_count,
                'published_resources': published_count,
                'draft_resources': status_counts.get('draft', 0),
                'archived_resources': status_counts.get('archived', 0),
                'total_file_size': total_size,
                'total_file_size_mb': total_size / (1024 * 1024),
                'resource_types': resource_types,
                'status_counts': status_counts
            }

        except Exception as e:
            self.logger.error(f"获取统计信息失败: {e}")
            return {
                'total_resources': 0,
                'published_resources': 0,
                'draft_resources': 0,
                'archived_resources': 0,
                'total_file_size': 0,
                'total_file_size_mb': 0,
                'resource_types': [],
                'status_counts': {}
            }

    def _row_to_dict(self, row: sqlite3.Row) -> Dict[str, Any]:
        """将数据库行转换为字典"""
        result = dict(row)

        # 反序列化 JSON 字段
        for field in ['download_links', 'image_urls', 'tags']:
            if result[field]:
                try:
                    result[field] = json.loads(result[field])
                except json.JSONDecodeError:
                    result[field] = []
            else:
                result[field] = []

        return result

    async def backup_database(self, backup_path: str) -> bool:
        """备份数据库"""
        try:
            import shutil
            backup_file = Path(backup_path)
            backup_file.parent.mkdir(parents=True, exist_ok=True)

            # 关闭当前连接
            if self.connection:
                self.connection.close()

            # 复制数据库文件
            shutil.copy2(self.db_path, backup_file)

            # 重新连接
            await self.connect()

            self.logger.info(f"数据库备份成功: {backup_file}")
            return True

        except Exception as e:
            self.logger.error(f"数据库备份失败: {e}")
            # 尝试重新连接
            try:
                await self.connect()
            except:
                pass
            return False

    async def get_database_info(self) -> Dict[str, Any]:
        """获取数据库信息"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
            tables = [row[0] for row in cursor.fetchall()]

            cursor.execute('PRAGMA table_info(resources)')
            columns = [row[1] for row in cursor.fetchall()]

            cursor.execute('SELECT COUNT(*) FROM resources')
            record_count = cursor.fetchone()[0]

            return {
                'database_path': str(self.db_path),
                'database_size': self.db_path.stat().st_size,
                'database_size_mb': self.db_path.stat().st_size / (1024 * 1024),
                'tables': tables,
                'resource_table_columns': columns,
                'total_records': record_count
            }

        except Exception as e:
            self.logger.error(f"获取数据库信息失败: {e}")
            return {}


# 全局实例
simple_db = SimpleDatabaseManager()


# 便捷函数
async def init_database():
    """初始化数据库"""
    await simple_db.connect()


async def close_database():
    """关闭数据库"""
    await simple_db.disconnect()


async def create_resource(resource_data: Dict[str, Any]) -> Optional[int]:
    """创建资源"""
    return await simple_db.create_resource(resource_data)


async def get_resource_by_title(title: str) -> Optional[Dict[str, Any]]:
    """根据标题获取资源"""
    return await simple_db.get_resource_by_title(title)


async def get_recent_resources(limit: int = 10) -> List[Dict[str, Any]]:
    """获取最近的资源"""
    return await simple_db.get_recent_resources(limit)


async def search_resources(query: str, limit: int = 10) -> List[Dict[str, Any]]:
    """搜索资源"""
    return await simple_db.search_resources(query, limit)


async def get_statistics() -> Dict[str, Any]:
    """获取统计信息"""
    return await simple_db.get_statistics()