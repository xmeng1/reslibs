#!/usr/bin/env python3
"""
ResLibs 自动化脚本数据库管理
处理数据库连接和操作
"""

import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path

try:
    from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Float
    from sqlalchemy.ext.declarative import declarative_base
    from sqlalchemy.orm import sessionmaker, Session
    from sqlalchemy.dialects.postgresql import JSON
    SQLALCHEMY_AVAILABLE = True
except ImportError:
    SQLALCHEMY_AVAILABLE = False

try:
    from prisma import Prisma, Client
    PRISMA_AVAILABLE = True
except ImportError:
    PRISMA_AVAILABLE = False

from automation.config import config
from automation.logger import setup_logger


class DatabaseManager:
    """数据库管理器"""

    def __init__(self):
        self.logger = setup_logger("DatabaseManager")
        self.db_type = self._detect_db_type()
        self.client = None
        self.engine = None
        self.SessionLocal = None

    def _detect_db_type(self) -> str:
        """检测数据库类型"""
        if PRISMA_AVAILABLE and "postgresql" in config.database.url.lower():
            return "prisma"
        elif SQLALCHEMY_AVAILABLE:
            return "sqlalchemy"
        else:
            self.logger.warning("未安装数据库依赖，使用模拟数据库")
            return "mock"

    async def connect(self):
        """连接数据库"""
        try:
            if self.db_type == "prisma":
                await self._connect_prisma()
            elif self.db_type == "sqlalchemy":
                self._connect_sqlalchemy()
            elif self.db_type == "mock":
                self._setup_mock_database()

            self.logger.info(f"数据库连接成功 (类型: {self.db_type})")

        except Exception as e:
            self.logger.error(f"数据库连接失败: {e}")
            raise

    async def _connect_prisma(self):
        """连接 Prisma 数据库"""
        self.client = Prisma()
        await self.client.connect()
        self.logger.info("Prisma 数据库连接成功")

    def _connect_sqlalchemy(self):
        """连接 SQLAlchemy 数据库"""
        self.engine = create_engine(
            config.database.url,
            pool_size=config.database.pool_size,
            max_overflow=config.database.max_overflow
        )
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

        # 创建表（如果不存在）
        Base.metadata.create_all(bind=self.engine)
        self.logger.info("SQLAlchemy 数据库连接成功")

    def _setup_mock_database(self):
        """设置模拟数据库"""
        self.mock_data = {
            "resources": [],
            "categories": [],
            "tags": []
        }
        self.logger.info("模拟数据库设置完成")

    async def disconnect(self):
        """断开数据库连接"""
        try:
            if self.db_type == "prisma" and self.client:
                await self.client.disconnect()
                self.logger.info("Prisma 数据库连接已断开")

            elif self.db_type == "sqlalchemy" and self.engine:
                self.engine.dispose()
                self.logger.info("SQLAlchemy 数据库连接已断开")

        except Exception as e:
            self.logger.error(f"断开数据库连接失败: {e}")

    async def create_resource(self, resource_data: Dict[str, Any]) -> Optional[int]:
        """创建资源记录"""
        try:
            if self.db_type == "prisma":
                return await self._create_resource_prisma(resource_data)
            elif self.db_type == "sqlalchemy":
                return await self._create_resource_sqlalchemy(resource_data)
            elif self.db_type == "mock":
                return await self._create_resource_mock(resource_data)

        except Exception as e:
            self.logger.error(f"创建资源记录失败: {e}")
            return None

    async def _create_resource_prisma(self, resource_data: Dict[str, Any]) -> Optional[int]:
        """使用 Prisma 创建资源"""
        # 假设已经配置了 Prisma schema
        resource = await self.client.resource.create({
            "title": resource_data.get("title"),
            "titleEn": resource_data.get("title_en"),
            "description": resource_data.get("description"),
            "metaDescription": resource_data.get("meta_description"),
            "resourceType": resource_data.get("resource_type"),
            "fileSize": resource_data.get("file_size"),
            "fileFormat": resource_data.get("file_format"),
            "downloadLinks": resource_data.get("download_links"),
            "imageUrls": resource_data.get("image_urls"),
            "tags": resource_data.get("tags"),
            "status": resource_data.get("status", "published"),
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        })

        return resource.id

    async def _create_resource_sqlalchemy(self, resource_data: Dict[str, Any]) -> Optional[int]:
        """使用 SQLAlchemy 创建资源"""
        db: Session = self.SessionLocal()
        try:
            # 创建 SQLAlchemy 模型实例
            resource = Resource(
                title=resource_data.get("title"),
                title_en=resource_data.get("title_en"),
                description=resource_data.get("description"),
                meta_description=resource_data.get("meta_description"),
                resource_type=resource_data.get("resource_type"),
                file_size=resource_data.get("file_size"),
                file_format=resource_data.get("file_format"),
                download_links=resource_data.get("download_links"),
                image_urls=resource_data.get("image_urls"),
                tags=resource_data.get("tags"),
                status=resource_data.get("status", "published"),
                created_at=resource_data.get("created_at", datetime.now()),
                updated_at=resource_data.get("updated_at", datetime.now())
            )

            db.add(resource)
            db.commit()
            db.refresh(resource)

            return resource.id

        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

    async def _create_resource_mock(self, resource_data: Dict[str, Any]) -> Optional[int]:
        """使用模拟数据库创建资源"""
        resource_id = len(self.mock_data["resources"]) + 1
        resource_record = {
            "id": resource_id,
            **resource_data,
            "id": resource_id
        }
        self.mock_data["resources"].append(resource_record)
        self.logger.info(f"模拟数据库：创建资源 ID {resource_id}")
        return resource_id

    async def get_resource_by_title(self, title: str) -> Optional[Dict[str, Any]]:
        """根据标题获取资源"""
        try:
            if self.db_type == "prisma":
                resource = await self.client.resource.find_first(where={"title": title})
                return dict(resource) if resource else None

            elif self.db_type == "sqlalchemy":
                db: Session = self.SessionLocal()
                try:
                    resource = db.query(Resource).filter(Resource.title == title).first()
                    return {
                        "id": resource.id,
                        "title": resource.title,
                        "title_en": resource.title_en,
                        "description": resource.description,
                        "resource_type": resource.resource_type,
                        "status": resource.status
                    } if resource else None
                finally:
                    db.close()

            elif self.db_type == "mock":
                for resource in self.mock_data["resources"]:
                    if resource.get("title") == title:
                        return resource
                return None

        except Exception as e:
            self.logger.error(f"查询资源失败: {e}")
            return None

    async def update_resource_status(self, resource_id: int, status: str) -> bool:
        """更新资源状态"""
        try:
            if self.db_type == "prisma":
                await self.client.resource.update(
                    where={"id": resource_id},
                    data={"status": status, "updatedAt": datetime.now()}
                )
                return True

            elif self.db_type == "sqlalchemy":
                db: Session = self.SessionLocal()
                try:
                    resource = db.query(Resource).filter(Resource.id == resource_id).first()
                    if resource:
                        resource.status = status
                        resource.updated_at = datetime.now()
                        db.commit()
                        return True
                    return False
                finally:
                    db.close()

            elif self.db_type == "mock":
                for resource in self.mock_data["resources"]:
                    if resource.get("id") == resource_id:
                        resource["status"] = status
                        resource["updated_at"] = datetime.now()
                        return True
                return False

        except Exception as e:
            self.logger.error(f"更新资源状态失败: {e}")
            return False

    async def get_recent_resources(self, limit: int = 10) -> List[Dict[str, Any]]:
        """获取最近的资源"""
        try:
            if self.db_type == "prisma":
                resources = await self.client.resource.find_many(
                    take=limit,
                    order={"createdAt": "desc"}
                )
                return [dict(resource) for resource in resources]

            elif self.db_type == "sqlalchemy":
                db: Session = self.SessionLocal()
                try:
                    resources = db.query(Resource).order_by(
                        Resource.created_at.desc()
                    ).limit(limit).all()

                    return [
                        {
                            "id": resource.id,
                            "title": resource.title,
                            "resource_type": resource.resource_type,
                            "status": resource.status,
                            "created_at": resource.created_at
                        }
                        for resource in resources
                    ]
                finally:
                    db.close()

            elif self.db_type == "mock":
                return sorted(
                    self.mock_data["resources"],
                    key=lambda x: x.get("created_at", datetime.min),
                    reverse=True
                )[:limit]

        except Exception as e:
            self.logger.error(f"获取最近资源失败: {e}")
            return []

    async def search_resources(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """搜索资源"""
        try:
            if self.db_type == "prisma":
                resources = await self.client.resource.find_many(
                    where={
                        "OR": [
                            {"title": {"contains": query}},
                            {"description": {"contains": query}}
                        ]
                    },
                    take=limit
                )
                return [dict(resource) for resource in resources]

            elif self.db_type == "sqlalchemy":
                db: Session = self.SessionLocal()
                try:
                    resources = db.query(Resource).filter(
                        (Resource.title.contains(query)) |
                        (Resource.description.contains(query))
                    ).limit(limit).all()

                    return [
                        {
                            "id": resource.id,
                            "title": resource.title,
                            "description": resource.description[:100] + "...",
                            "resource_type": resource.resource_type
                        }
                        for resource in resources
                    ]
                finally:
                    db.close()

            elif self.db_type == "mock":
                results = []
                query_lower = query.lower()
                for resource in self.mock_data["resources"]:
                    if (query_lower in resource.get("title", "").lower() or
                        query_lower in resource.get("description", "").lower()):
                        results.append(resource)
                return results[:limit]

        except Exception as e:
            self.logger.error(f"搜索资源失败: {e}")
            return []

    async def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息"""
        try:
            if self.db_type == "prisma":
                total_count = await self.client.resource.count()
                published_count = await self.client.resource.count(
                    where={"status": "published"}
                )
                types = await self.client.resource.group_by(
                    by=["resourceType"],
                    _count={"resourceType": True}
                )

                return {
                    "total_resources": total_count,
                    "published_resources": published_count,
                    "resource_types": [
                        {"type": item["resourceType"], "count": item["_count"]["resourceType"]}
                        for item in types
                    ]
                }

            elif self.db_type == "sqlalchemy":
                db: Session = self.SessionLocal()
                try:
                    total_count = db.query(Resource).count()
                    published_count = db.query(Resource).filter(
                        Resource.status == "published"
                    ).count()

                    # 按类型统计
                    type_counts = db.query(
                        Resource.resource_type,
                        db.func.count(Resource.id)
                    ).group_by(Resource.resource_type).all()

                    return {
                        "total_resources": total_count,
                        "published_resources": published_count,
                        "resource_types": [
                            {"type": item[0], "count": item[1]}
                            for item in type_counts
                        ]
                    }
                finally:
                    db.close()

            elif self.db_type == "mock":
                resources = self.mock_data["resources"]
                total_count = len(resources)
                published_count = len([r for r in resources if r.get("status") == "published"])

                # 统计类型
                type_counts = {}
                for resource in resources:
                    resource_type = resource.get("resource_type", "unknown")
                    type_counts[resource_type] = type_counts.get(resource_type, 0) + 1

                return {
                    "total_resources": total_count,
                    "published_resources": published_count,
                    "resource_types": [
                        {"type": k, "count": v}
                        for k, v in type_counts.items()
                    ]
                }

        except Exception as e:
            self.logger.error(f"获取统计信息失败: {e}")
            return {}


# SQLAlchemy 模型定义（如果使用 SQLAlchemy）
if SQLALCHEMY_AVAILABLE:
    Base = declarative_base()

    class Resource(Base):
        """资源模型"""
        __tablename__ = "resources"

        id = Column(Integer, primary_key=True, index=True)
        title = Column(String(255), nullable=False, index=True)
        title_en = Column(String(255))
        description = Column(Text)
        meta_description = Column(Text)
        resource_type = Column(String(50), nullable=False, index=True)
        file_size = Column(BigInteger)
        file_format = Column(String(20))
        download_links = Column(Text)  # JSON 字符串
        image_urls = Column(Text)      # JSON 字符串
        tags = Column(Text)            # JSON 字符串
        status = Column(String(20), default="draft", index=True)
        created_at = Column(DateTime, default=datetime.now)
        updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


# 数据库管理器单例
db_manager = DatabaseManager()


# 数据库操作便捷函数
async def init_database():
    """初始化数据库"""
    await db_manager.connect()


async def close_database():
    """关闭数据库连接"""
    await db_manager.disconnect()


async def create_resource(resource_data: Dict[str, Any]) -> Optional[int]:
    """创建资源"""
    return await db_manager.create_resource(resource_data)


async def get_resource_by_title(title: str) -> Optional[Dict[str, Any]]:
    """根据标题获取资源"""
    return await db_manager.get_resource_by_title(title)


async def update_resource_status(resource_id: int, status: str) -> bool:
    """更新资源状态"""
    return await db_manager.update_resource_status(resource_id, status)


async def get_recent_resources(limit: int = 10) -> List[Dict[str, Any]]:
    """获取最近的资源"""
    return await db_manager.get_recent_resources(limit)


async def search_resources(query: str, limit: int = 10) -> List[Dict[str, Any]]:
    """搜索资源"""
    return await db_manager.search_resources(query, limit)


async def get_statistics() -> Dict[str, Any]:
    """获取统计信息"""
    return await db_manager.get_statistics()