#!/usr/bin/env python3
"""
ResLibs AI 内容生成验证脚本
参考规格：openspec/specs/automation-workflow/spec.md
"""

import os
import json
import sys
from typing import Dict, List, Any

class AIContentGenerator:
    """AI 内容生成器类"""

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("请设置 GEMINI_API_KEY 环境变量")

        # 尝试导入 Google Generative AI
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self.available = True
        except ImportError:
            print("⚠️ 未安装 google-generativeai 包")
            self.available = False

    def generate_content_for_resource(
        self,
        resource_type: str,
        filename: str,
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """为指定资源生成内容"""

        if not self.available:
            return self._generate_mock_content(resource_type, filename)

        # 根据资源类型生成特定的提示词
        prompt_templates = {
            "unity-assets": self._get_unity_template(),
            "software-tools": self._get_software_template(),
            "design-assets": self._get_design_template(),
            "video-courses": self._get_video_template()
        }

        template = prompt_templates.get(resource_type, self._get_generic_template())

        # 构建完整的提示词
        full_prompt = template.format(
            filename=filename,
            metadata=json.dumps(metadata or {}, indent=2, ensure_ascii=False)
        )

        try:
            response = self.model.generate_content(full_prompt)
            # 尝试解析 JSON 响应
            try:
                content = response.text.strip()
                if content.startswith("```json"):
                    content = content.replace("```json", "").replace("```", "").strip()
                return json.loads(content)
            except json.JSONDecodeError:
                return self._parse_text_response(response.text, resource_type, filename)
        except Exception as e:
            print(f"AI 生成失败: {e}")
            return self._generate_mock_content(resource_type, filename)

    def _get_unity_template(self) -> str:
        return """请为 Unity 资源包生成 SEO 友好的内容：

文件名: {filename}
元数据: {metadata}

请返回 JSON 格式，包含：
{{
  "title_zh": "中文标题 - Unity Assets",
  "title_en": "English Title - Unity Assets",
  "description": "详细描述该 Unity 资源包的功能、用途和特点，包含使用场景和技术要求（200-300字）",
  "tags": ["Unity", "3D模型", "游戏开发", "素材包"],
  "meta_description": "SEO 描述（150字符以内）",
  "unity_version": "支持的 Unity 版本",
  "file_size": "文件大小"
}}

请确保内容专业且具有吸引力。"""

    def _get_software_template(self) -> str:
        return """请为软件工具生成 SEO 友好的内容：

文件名: {filename}
元数据: {metadata}

请返回 JSON 格式，包含：
{{
  "title_zh": "中文标题 - 软件工具",
  "title_en": "English Title - Software Tool",
  "description": "详细描述该软件的功能、特点、适用人群和系统要求（200-300字）",
  "tags": ["软件", "工具", "应用程序"],
  "meta_description": "SEO 描述（150字符以内）",
  "version": "软件版本",
  "platform": "支持的平台 (Windows/macOS/Linux)",
  "system_requirements": "系统要求"
}}

请确保内容准确且实用。"""

    def _get_design_template(self) -> str:
        return """请为设计素材包生成 SEO 友好的内容：

文件名: {filename}
元数据: {metadata}

请返回 JSON 格式，包含：
{{
  "title_zh": "中文标题 - 设计素材",
  "title_en": "English Title - Design Assets",
  "description": "详细描述该设计素材包的内容、风格、适用场景和使用方法（200-300字）",
  "tags": ["设计", "素材", "UI", "图标"],
  "meta_description": "SEO 描述（150字符以内）",
  "format": "文件格式",
  "resolution": "分辨率信息",
  "license": "使用许可"
}}

请确保内容具有设计专业性。"""

    def _get_video_template(self) -> str:
        return """请为视频课程生成 SEO 友好的内容：

文件名: {filename}
元数据: {metadata}

请返回 JSON 格式，包含：
{{
  "title_zh": "中文标题 - 视频课程",
  "title_en": "English Title - Video Course",
  "description": "详细描述该视频课程的内容、学习目标、适合人群和课程大纲（200-300字）",
  "tags": ["视频", "课程", "教学", "培训"],
  "meta_description": "SEO 描述（150字符以内）",
  "duration": "视频时长",
  "quality": "视频质量",
  "language": "语言",
  "instructor": "讲师信息"
}}

请确保内容教育性且吸引人。"""

    def _get_generic_template(self) -> str:
        return """请为资源生成 SEO 友好的内容：

文件名: {filename}
元数据: {metadata}

请返回 JSON 格式，包含：
{{
  "title_zh": "中文标题",
  "title_en": "English Title",
  "description": "详细描述该资源的用途、特点和优势（200-300字）",
  "tags": ["资源", "工具"],
  "meta_description": "SEO 描述（150字符以内）"
}}

请生成专业且实用的内容。"""

    def _parse_text_response(self, text: str, resource_type: str, filename: str) -> Dict[str, Any]:
        """解析文本响应为结构化数据"""
        lines = text.strip().split('\n')

        # 简单的文本解析逻辑
        title = f"{filename} - {resource_type.replace('-', ' ').title()}"
        description = text[:300] if len(text) > 300 else text

        return {
            "title_zh": title,
            "title_en": title,
            "description": description,
            "tags": [resource_type.replace('-', ' ')],
            "meta_description": description[:150],
            "raw_response": text
        }

    def _generate_mock_content(self, resource_type: str, filename: str) -> Dict[str, Any]:
        """生成模拟内容（用于测试）"""
        mock_content = {
            "unity-assets": {
                "title_zh": f"{filename} - Unity 资源包",
                "title_en": f"{filename} - Unity Asset Pack",
                "description": "这是一个高质量的 Unity 资源包，包含了完整的 3D 模型、纹理和材质，适用于各种游戏开发项目。支持 Unity 2021.3+ 版本。",
                "tags": ["Unity", "3D模型", "游戏开发", "素材包"],
                "meta_description": "专业 Unity 资源包，包含高质量 3D 模型和纹理",
                "unity_version": "2021.3+",
                "file_size": "未知"
            },
            "software-tools": {
                "title_zh": f"{filename} - 专业软件工具",
                "title_en": f"{filename} - Professional Software Tool",
                "description": "这是一款功能强大的专业软件工具，提供了丰富的功能和优秀的用户体验。支持多平台使用，是专业人士的理想选择。",
                "tags": ["软件", "工具", "应用程序"],
                "meta_description": "功能强大的专业软件工具，提供丰富的功能特性",
                "version": "最新版本",
                "platform": "跨平台",
                "system_requirements": "请查看官方文档"
            },
            "design-assets": {
                "title_zh": f"{filename} - 设计素材包",
                "title_en": f"{filename} - Design Assets Pack",
                "description": "这是一个精美的设计素材包，包含高质量的图标、UI 组件和设计元素。适用于各种设计项目，提供多种格式和分辨率。",
                "tags": ["设计", "素材", "UI", "图标"],
                "meta_description": "高质量设计素材包，包含丰富的 UI 组件和图标",
                "format": "多种格式",
                "resolution": "高清",
                "license": "请查看许可协议"
            }
        }

        return mock_content.get(
            resource_type,
            mock_content["software-tools"]
        )

def test_ai_content_generation():
    """测试 AI 内容生成功能"""
    print("=== AI 内容生成功能验证 ===")

    try:
        generator = AIContentGenerator()

        # 测试用例
        test_cases = [
            {
                "type": "unity-assets",
                "filename": "LowPolyShooterPack.unitypackage",
                "metadata": {
                    "version": "3.0",
                    "size": "125MB",
                    "includes": ["3D模型", "纹理", "材质", "动画"]
                }
            },
            {
                "type": "software-tools",
                "filename": "Blender_4.2.1_Windows.exe",
                "metadata": {
                    "version": "4.2.1",
                    "size": "280MB",
                    "platform": "Windows",
                    "requirements": "Windows 10+"
                }
            },
            {
                "type": "design-assets",
                "filename": "Modern_UI_Kit.sketch",
                "metadata": {
                    "version": "2.5",
                    "size": "45MB",
                    "components": 150,
                    "style": "Modern"
                }
            }
        ]

        print(f"测试 {len(test_cases)} 个资源类型的内容生成...")

        for i, test_case in enumerate(test_cases, 1):
            print(f"\n--- 测试用例 {i}: {test_case['type']} ---")

            result = generator.generate_content_for_resource(
                test_case["type"],
                test_case["filename"],
                test_case["metadata"]
            )

            print(f"中文标题: {result.get('title_zh', '未生成')}")
            print(f"英文标题: {result.get('title_en', '未生成')}")
            print(f"标签: {result.get('tags', [])}")
            print(f"描述长度: {len(result.get('description', ''))} 字符")

        return True

    except Exception as e:
        print(f"AI 内容生成测试失败: {e}")
        return False

if __name__ == "__main__":
    print("ResLibs AI 内容生成验证")
    print("=" * 40)

    success = test_ai_content_generation()

    print("\n" + "=" * 40)
    print(f"测试结果: {'✅ 成功' if success else '❌ 失败'}")

    if not success:
        print("\n提示：")
        print("1. 确保设置了 GEMINI_API_KEY 环境变量")
        print("2. 运行: pip install google-generativeai")
        print("3. 检查网络连接和 API 配额")