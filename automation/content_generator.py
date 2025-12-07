#!/usr/bin/env python3
"""
ResLibs AI 内容生成器
使用 Google Gemini API 生成 SEO 友好的资源内容
"""

import os
import json
import asyncio
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path
from datetime import datetime

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

from automation.config import config
from automation.logger import setup_logger


class ContentGenerator:
    """AI 内容生成器"""

    def __init__(self):
        self.logger = setup_logger("ContentGenerator")
        self.model = None
        self.is_configured = False

        if GEMINI_AVAILABLE and config.ai.gemini_api_key:
            try:
                genai.configure(api_key=config.ai.gemini_api_key)
                self.model = genai.GenerativeModel(config.ai.gemini_model)
                self.is_configured = True
                self.logger.info(f"Gemini AI 配置成功，使用模型: {config.ai.gemini_model}")
            except Exception as e:
                self.logger.error(f"Gemini AI 配置失败: {e}")
        else:
            self.logger.warning("Gemini AI 未配置或未安装，将使用模拟内容")

    async def generate_content(
        self,
        filename: str,
        file_type: str,
        resource_type: str,
        metadata: Dict[str, Any],
        local_path: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        生成资源内容

        Args:
            filename: 文件名
            file_type: 文件类型
            resource_type: 资源类型
            metadata: 文件元数据
            local_path: 本地文件路径

        Returns:
            生成的内容数据
        """
        try:
            if not self.is_configured or config.system.dry_run:
                self.logger.info("使用模拟内容生成")
                return await self._generate_mock_content(
                    filename, file_type, resource_type, metadata
                )

            # 提取文件内容分析
            file_analysis = await self._analyze_file(local_path, resource_type)

            # 构建 AI 提示
            prompt = self._build_prompt(
                filename, file_type, resource_type, metadata, file_analysis
            )

            # 调用 AI 生成内容
            content = await self._call_ai(prompt)

            if content:
                # 解析和验证内容
                parsed_content = self._parse_content(content, resource_type)
                return parsed_content
            else:
                self.logger.warning("AI 生成内容失败，使用模拟内容")
                return await self._generate_mock_content(
                    filename, file_type, resource_type, metadata
                )

        except Exception as e:
            self.logger.error(f"生成内容失败: {e}")
            # 返回模拟内容以避免流程中断
            return await self._generate_mock_content(
                filename, file_type, resource_type, metadata
            )

    async def _analyze_file(self, local_path: Optional[str], resource_type: str) -> Dict[str, Any]:
        """分析文件内容"""
        analysis = {
            "file_size_info": "",
            "content_structure": "",
            "technical_specs": "",
            "usage_scenarios": ""
        }

        if not local_path or not Path(local_path).exists():
            return analysis

        try:
            file_path = Path(local_path)
            size = file_path.stat().st_size
            size_mb = size / (1024 * 1024)
            analysis["file_size_info"] = f"文件大小: {size_mb:.1f} MB"

            # 根据资源类型分析内容
            if resource_type == "unity-assets" and file_path.suffix == ".unitypackage":
                analysis["content_structure"] = "Unity 资源包，包含游戏开发所需的3D模型、材质、脚本等"
                analysis["technical_specs"] = "支持 Unity 2021.3+ 版本"
                analysis["usage_scenarios"] = "适用于独立游戏开发、VR/AR 应用、移动游戏"

            elif resource_type == "software-tools":
                if file_path.suffix in [".exe", ".msi"]:
                    analysis["content_structure"] = "Windows 平台软件安装包"
                elif file_path.suffix == ".dmg":
                    analysis["content_structure"] = "macOS 平台软件安装包"
                analysis["technical_specs"] = f"平台: {self._detect_platform(file_path.suffix)}"
                analysis["usage_scenarios"] = "专业工具软件，适用于相关领域开发和工作"

            elif resource_type == "design-assets":
                if file_path.suffix == ".psd":
                    analysis["content_structure"] = "Photoshop 设计源文件，包含图层和样式"
                elif file_path.suffix == ".ai":
                    analysis["content_structure"] = "Illustrator 矢量设计文件"
                analysis["technical_specs"] = f"格式: {file_path.suffix.upper()}"
                analysis["usage_scenarios"] = "UI设计、平面设计、品牌设计"

            elif resource_type == "video-courses":
                analysis["content_structure"] = "视频教程文件，包含完整的学习内容"
                analysis["technical_specs"] = f"格式: {file_path.suffix.upper()}"
                analysis["usage_scenarios"] = "在线学习、技能培训、知识提升"

        except Exception as e:
            self.logger.warning(f"文件分析失败: {e}")

        return analysis

    def _detect_platform(self, extension: str) -> str:
        """检测文件平台"""
        platform_map = {
            ".exe": "Windows",
            ".msi": "Windows",
            ".dmg": "macOS",
            ".pkg": "macOS",
            ".deb": "Linux",
            ".rpm": "Linux",
            ".app": "macOS"
        }
        return platform_map.get(extension, "通用")

    def _build_prompt(
        self,
        filename: str,
        file_type: str,
        resource_type: str,
        metadata: Dict[str, Any],
        file_analysis: Dict[str, Any]
    ) -> str:
        """构建 AI 提示"""
        # 根据资源类型选择模板
        templates = {
            "unity-assets": self._get_unity_template(),
            "software-tools": self._get_software_template(),
            "design-assets": self._get_design_template(),
            "video-courses": self._get_video_template(),
            "audio-resources": self._get_audio_template(),
            "documents": self._get_document_template(),
            "3d-models": self._get_3d_model_template(),
            "archives": self._get_archive_template()
        }

        base_template = templates.get(resource_type, self._get_general_template())

        prompt = f"""
请为以下{self._get_type_name(resource_type)}生成 SEO 优化的内容描述：

**文件信息：**
- 文件名：{filename}
- 文件类型：{file_type}
- 资源类型：{resource_type}
- 文件大小：{metadata.get('size', 0)} bytes
- 修改时间：{metadata.get('modified_time', 'Unknown')}

**文件分析：**
{file_analysis.get('file_size_info', '')}
{file_analysis.get('content_structure', '')}
{file_analysis.get('technical_specs', '')}
{file_analysis.get('usage_scenarios', '')}

{base_template}

**要求：**
1. 内容必须真实准确，基于提供的文件信息
2. 生成的内容应该对用户有价值
3. SEO 友好，包含相关关键词
4. 标题要吸引人且准确
5. 描述要详细且有用
6. 标签要相关且准确
7. 请确保所有生成的内容都是合法合规的

**输出格式：**
请严格按照以下 JSON 格式输出：
```json
{{
  "title_zh": "中文标题",
  "title_en": "English Title",
  "description": "详细描述（300-500字）",
  "meta_description": "SEO元描述（150-160字符）",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"],
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "category": "分类",
  "difficulty": "难度级别",
  "requirements": ["使用要求1", "使用要求2"],
  "features": ["特性1", "特性2", "特性3"]
}}
```
"""

        return prompt

    def _get_unity_template(self) -> str:
        """Unity 资源模板"""
        return """
**Unity 资源说明：**
这是一个 Unity 游戏开发资源包，可能包含以下内容：
- 3D 模型和材质
- 贴图纹理
- 脚本组件
- 动画和特效
- 音效资源

请重点关注：
- 适用的 Unity 版本
- 资源的功能和用途
- 适用于什么类型的游戏
- 包含哪些具体内容
- 安装和使用方法
"""

    def _get_software_template(self) -> str:
        """软件工具模板"""
        return """
**软件工具说明：**
这是一个专业软件工具，提供特定功能。

请重点关注：
- 软件的主要功能和用途
- 适用平台和系统要求
- 软件的特色和优势
- 适用的用户群体
- 安装和基本使用说明
"""

    def _get_design_template(self) -> str:
        """设计素材模板"""
        return """
**设计素材说明：**
这是一个专业设计素材包，包含高质量的设计元素。

请重点关注：
- 素材的风格和主题
- 包含的设计元素类型
- 适用项目和场景
- 文件格式和兼容性
- 设计理念和使用建议
"""

    def _get_video_template(self) -> str:
        """视频课程模板"""
        return """
**视频课程说明：**
这是一个教育视频课程，提供系统的学习内容。

请重点关注：
- 课程的主题和目标
- 适合的学习者群体
- 课程内容和结构
- 学习收获和技能
- 难度级别和学习时长
"""

    def _get_audio_template(self) -> str:
        """音频资源模板"""
        return """
**音频资源说明：**
这是一个音频素材包，包含高质量的声音资源。

请重点关注：
- 音频的类型和风格
- 音质和格式信息
- 适用场景和项目
- 时长和文件数量
- 使用授权说明
"""

    def _get_document_template(self) -> str:
        """文档资料模板"""
        return """
**文档资料说明：**
这是一个文档资料包，包含有价值的信息内容。

请重点关注：
- 文档的主题和内容
- 资料的深度和广度
- 适用读者群体
- 内容结构特点
- 实用价值和应用
"""

    def _get_3d_model_template(self) -> str:
        """3D 模型模板"""
        return """
**3D 模型说明：**
这是一个3D模型资源，用于3D项目和渲染。

请重点关注：
- 模型的类型和主题
- 建模质量和细节
- 支持的文件格式
- 适用软件和平台
- 多边形数量和材质信息
"""

    def _get_archive_template(self) -> str:
        """压缩包模板"""
        return """
**压缩包说明：**
这是一个压缩文件包，包含多个相关资源。

请重点关注：
- 包含的内容类型
- 压缩格式和大小
- 解压后的内容结构
- 整体用途和价值
- 使用方式和要求
"""

    def _get_general_template(self) -> str:
        """通用模板"""
        return """
**资源说明：**
这是一个数字资源文件。

请重点关注：
- 资源的主要用途
- 文件的特点和价值
- 适用场景和应用
- 使用要求和条件
- 对用户的帮助和价值
"""

    def _get_type_name(self, resource_type: str) -> str:
        """获取资源类型的中文名称"""
        type_names = {
            "unity-assets": "Unity 游戏开发资源",
            "software-tools": "专业软件工具",
            "design-assets": "设计素材资源",
            "video-courses": "视频教程课程",
            "audio-resources": "音频素材资源",
            "documents": "文档资料",
            "3d-models": "3D 模型资源",
            "archives": "压缩包资源"
        }
        return type_names.get(resource_type, "数字资源")

    async def _call_ai(self, prompt: str) -> Optional[str]:
        """调用 AI 生成内容"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            self.logger.error(f"AI 调用失败: {e}")
            return None

    def _parse_content(self, content: str, resource_type: str) -> Dict[str, Any]:
        """解析 AI 生成的内容"""
        try:
            # 尝试解析 JSON
            if content.startswith("```json"):
                # 移除 markdown 代码块标记
                content = content.replace("```json", "").replace("```", "").strip()

            parsed = json.loads(content)

            # 验证必需字段
            required_fields = ["title_zh", "description", "tags"]
            for field in required_fields:
                if field not in parsed or not parsed[field]:
                    self.logger.warning(f"缺少必需字段: {field}")
                    parsed[field] = self._get_default_field(field, resource_type)

            # 设置默认值
            parsed.setdefault("title_en", parsed.get("title_zh", ""))
            parsed.setdefault("meta_description", parsed.get("description", "")[:150])
            parsed.setdefault("keywords", parsed.get("tags", []))
            parsed.setdefault("category", self._get_type_name(resource_type))
            parsed.setdefault("difficulty", "中级")
            parsed.setdefault("requirements", [])
            parsed.setdefault("features", [])

            return parsed

        except json.JSONDecodeError as e:
            self.logger.error(f"JSON 解析失败: {e}")
            # 尝试从文本中提取信息
            return self._extract_from_text(content, resource_type)
        except Exception as e:
            self.logger.error(f"内容解析失败: {e}")
            return self._get_default_content(resource_type)

    def _extract_from_text(self, text: str, resource_type: str) -> Dict[str, Any]:
        """从纯文本中提取内容"""
        # 简单的文本解析逻辑
        lines = text.split('\n')
        title = lines[0] if lines else f"{self._get_type_name(resource_type)} 资源"

        # 查找可能的描述
        description = ""
        for line in lines[1:]:
            if len(line.strip()) > 50:  # 假设描述行较长
                description = line.strip()
                break

        if not description:
            description = f"这是一个高质量的 {self._get_type_name(resource_type)}，提供专业的功能和优秀的性能。"

        return {
            "title_zh": title,
            "title_en": f"Professional {resource_type.replace('-', ' ').title()} Resource",
            "description": description,
            "meta_description": description[:150],
            "tags": [resource_type.replace('-', '-'), "专业", "高质量", "实用"],
            "keywords": [resource_type, "资源", "工具"],
            "category": self._get_type_name(resource_type),
            "difficulty": "中级",
            "requirements": [],
            "features": ["功能完善", "易于使用", "专业品质"]
        }

    def _get_default_field(self, field: str, resource_type: str) -> Any:
        """获取字段的默认值"""
        defaults = {
            "title_zh": f"{self._get_type_name(resource_type)} 专业资源",
            "title_en": f"Professional {resource_type.replace('-', ' ').title()} Resource",
            "description": f"这是一个高质量的 {self._get_type_name(resource_type)}，提供专业的功能和优秀的性能。适用于相关领域的专业人士和爱好者使用。",
            "tags": [resource_type.replace('-', '-'), "专业", "高质量"],
            "keywords": [resource_type, "资源", "工具"],
            "category": self._get_type_name(resource_type),
            "difficulty": "中级",
            "requirements": [],
            "features": ["功能完善", "易于使用", "专业品质"]
        }
        return defaults.get(field, "")

    def _get_default_content(self, resource_type: str) -> Dict[str, Any]:
        """获取默认内容"""
        return {
            "title_zh": f"{self._get_type_name(resource_type)} 专业资源",
            "title_en": f"Professional {resource_type.replace('-', ' ').title()} Resource",
            "description": f"这是一个高质量的 {self._get_type_name(resource_type)}，提供专业的功能和优秀的性能。经过精心设计和测试，适合相关领域的专业人士和爱好者使用。该资源具有良好的兼容性和稳定性，能够满足各种使用需求。",
            "meta_description": f"专业 {self._get_type_name(resource_type)}，高质量，功能完善，易于使用",
            "tags": [resource_type.replace('-', '-'), "专业", "高质量", "实用", "推荐"],
            "keywords": [resource_type, "专业资源", "优质", "实用工具"],
            "category": self._get_type_name(resource_type),
            "difficulty": "中级",
            "requirements": ["基本操作经验", "相关软件环境"],
            "features": ["功能完善", "性能优秀", "易于使用", "兼容性好", "专业品质"]
        }

    async def _generate_mock_content(
        self,
        filename: str,
        file_type: str,
        resource_type: str,
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """生成模拟内容"""
        self.logger.info(f"生成模拟内容: {filename}")

        # 根据文件名和类型生成更具体的内容
        title_base = Path(filename).stem.replace('-', ' ').replace('_', ' ').title()

        content = {
            "title_zh": f"{title_base} - {self._get_type_name(resource_type)}",
            "title_en": f"{title_base} - Professional {resource_type.replace('-', ' ').title()}",
            "description": self._generate_mock_description(filename, resource_type),
            "meta_description": f"下载 {title_base} {self._get_type_name(resource_type)}，专业高质量资源",
            "tags": self._generate_mock_tags(filename, resource_type),
            "keywords": self._generate_mock_keywords(filename, resource_type),
            "category": self._get_type_name(resource_type),
            "difficulty": "中级",
            "requirements": self._generate_mock_requirements(resource_type),
            "features": self._generate_mock_features(resource_type)
        }

        return content

    def _generate_mock_description(self, filename: str, resource_type: str) -> str:
        """生成模拟描述"""
        type_descriptions = {
            "unity-assets": "这是一个高质量的 Unity 游戏开发资源包，包含完整的 3D 模型、材质、贴图和脚本组件。所有资源都经过优化，适合各种类型的游戏开发项目，支持移动端和 PC 平台。",
            "software-tools": "这是一款专业的软件工具，提供强大的功能和优秀的用户体验。经过精心开发，具有良好的稳定性和兼容性，适合专业人士和爱好者使用。",
            "design-assets": "这是一个专业的设计素材包，包含高质量的 UI 元素、图标和设计资源。所有素材都采用专业的设计标准，支持多种设计软件和项目需求。",
            "video-courses": "这是一个完整的视频教程课程，由专业讲师录制，内容系统全面，从基础到高级，适合各个水平的学习者。课程包含实例演示和练习材料。",
            "audio-resources": "这是一个高质量的音频素材包，包含各种类型的声音效果和背景音乐。所有音频都经过专业处理，适合游戏、视频和多媒体系项目使用。"
        }

        base_desc = type_descriptions.get(resource_type, "这是一个高质量的数字资源，提供专业功能和优秀性能。")

        filename_lower = filename.lower()
        if any(keyword in filename_lower for keyword in ['shooter', 'fps', 'gun']):
            base_desc += " 特别适合第一人称射击游戏开发。"
        elif any(keyword in filename_lower for keyword in ['ui', 'interface', 'menu']):
            base_desc += " 专注于用户界面设计和交互体验。"
        elif any(keyword in filename_lower for keyword in ['blender', '3d', 'model']):
            base_desc += " 专门为 3D 建模和渲染设计。"
        elif any(keyword in filename_lower for keyword in ['course', 'tutorial', 'learn']):
            base_desc += " 提供系统性的学习指导和实践项目。"

        return base_desc

    def _generate_mock_tags(self, filename: str, resource_type: str) -> List[str]:
        """生成模拟标签"""
        base_tags = [resource_type.replace('-', '-'), "专业", "高质量"]

        filename_lower = filename.lower()
        additional_tags = []

        if "unity" in filename_lower:
            additional_tags.extend(["Unity", "游戏开发", "3D"])
        if "ui" in filename_lower:
            additional_tags.extend(["UI", "界面设计", "用户体验"])
        if "shooter" in filename_lower:
            additional_tags.extend(["射击游戏", "FPS", "动作"])
        if "course" in filename_lower:
            additional_tags.extend(["教程", "学习", "培训"])
        if "blender" in filename_lower:
            additional_tags.extend(["Blender", "3D建模", "渲染"])

        return base_tags + additional_tags[:7]  # 最多10个标签

    def _generate_mock_keywords(self, filename: str, resource_type: str) -> List[str]:
        """生成模拟关键词"""
        return [resource_type, "下载", "免费", "资源", "工具", "专业", "高质量"]

    def _generate_mock_requirements(self, resource_type: str) -> List[str]:
        """生成模拟使用要求"""
        requirements_map = {
            "unity-assets": ["Unity 2021.3 或更高版本", "基础的 C# 编程知识"],
            "software-tools": ["Windows/macOS/Linux 操作系统", "足够的磁盘空间"],
            "design-assets": ["Photoshop/Illustrator 或兼容软件", "基本设计知识"],
            "video-courses": ["视频播放器", "网络连接"],
            "audio-resources": ["音频播放软件", "足够存储空间"]
        }
        return requirements_map.get(resource_type, ["基础操作经验"])

    def _generate_mock_features(self, resource_type: str) -> List[str]:
        """生成模拟特性"""
        features_map = {
            "unity-assets": ["高质量 3D 模型", "优化性能", "完整文档", "易于集成"],
            "software-tools": ["专业功能", "稳定可靠", "用户友好", "持续更新"],
            "design-assets": ["高分辨率", "多种格式", "专业设计", "易于使用"],
            "video-courses": ["系统讲解", "实例演示", "练习材料", "答疑支持"],
            "audio-resources": ["高质量音频", "多种格式", "专业制作", "版权清晰"]
        }
        return features_map.get(resource_type, ["功能完善", "性能优秀", "易于使用"])