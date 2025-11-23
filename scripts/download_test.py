#!/usr/bin/env python3
"""
ResLibs 多源下载原型测试脚本
参考规格：openspec/specs/automation-workflow/spec.md
"""

import os
import sys
import json
import requests
import tempfile
from typing import Dict, Any, Optional
from pathlib import Path

class MultiSourceDownloader:
    """多源下载器原型类"""

    def __init__(self):
        self.temp_dir = Path(tempfile.mkdtemp(prefix="reslibs_"))
        print(f"临时目录: {self.temp_dir}")

    def validate_url(self, url: str, source_type: str) -> bool:
        """验证下载链接"""
        try:
            if source_type == "baidu":
                # 这里应该集成 BaiduPCS-Go
                # 暂时使用简单的 HTTP 验证
                response = requests.head(url, timeout=10)
                return response.status_code < 400
            else:
                response = requests.head(url, timeout=10)
                return response.status_code < 400
        except Exception as e:
            print(f"验证链接失败: {e}")
            return False

    def download_file(self, url: str, filename: str, source_type: str = "direct") -> Optional[str]:
        """下载文件"""
        try:
            print(f"开始下载: {filename}")
            file_path = self.temp_dir / filename

            if source_type == "baidu":
                # 模拟百度网盘下载
                # 实际实现需要集成 BaiduPCS-Go
                print("使用百度网盘下载器...")
                return self._simulate_download(file_path, 1024 * 1024)  # 1MB 模拟文件
            else:
                # 直接 HTTP 下载
                response = requests.get(url, stream=True, timeout=30)
                response.raise_for_status()

                with open(file_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)

                print(f"下载完成: {file_path}")
                return str(file_path)

        except Exception as e:
            print(f"下载失败: {e}")
            return None

    def _simulate_download(self, file_path: Path, size: int) -> str:
        """模拟下载（用于测试）"""
        with open(file_path, 'wb') as f:
            f.write(os.urandom(size))
        print(f"模拟下载完成: {file_path}")
        return str(file_path)

    def extract_metadata(self, file_path: str) -> Dict[str, Any]:
        """提取文件元数据"""
        try:
            path = Path(file_path)
            stat = path.stat()

            metadata = {
                "filename": path.name,
                "size": stat.st_size,
                "extension": path.suffix,
                "created_at": stat.st_ctime,
                "modified_at": stat.st_mtime
            }

            # 根据文件扩展名推断资源类型
            resource_type = self._detect_resource_type(path.suffix)
            metadata["resource_type"] = resource_type

            print(f"提取的元数据: {metadata}")
            return metadata

        except Exception as e:
            print(f"提取元数据失败: {e}")
            return {}

    def _detect_resource_type(self, extension: str) -> str:
        """根据扩展名检测资源类型"""
        type_mapping = {
            ".unitypackage": "unity-assets",
            ".unity": "unity-assets",
            ".exe": "software-tools",
            ".msi": "software-tools",
            ".dmg": "software-tools",
            ".pkg": "software-tools",
            ".psd": "design-assets",
            ".ai": "design-assets",
            ".sketch": "design-assets",
            ".png": "design-assets",
            ".jpg": "design-assets",
            ".jpeg": "design-assets",
            ".mp4": "video-courses",
            ".avi": "video-courses",
            ".mov": "video-courses",
        }
        return type_mapping.get(extension.lower(), "unknown")

    def cleanup(self):
        """清理临时文件"""
        try:
            import shutil
            shutil.rmtree(self.temp_dir)
            print(f"清理临时目录: {self.temp_dir}")
        except Exception as e:
            print(f"清理失败: {e}")

def test_download_functionality():
    """测试下载功能"""
    print("=== ResLibs 多源下载功能测试 ===")

    downloader = MultiSourceDownloader()

    try:
        # 测试用例
        test_cases = [
            {
                "name": "测试直接下载",
                "url": "https://httpbin.org/json",  # 测试 API
                "filename": "test-api.json",
                "source_type": "direct"
            },
            {
                "name": "测试百度网盘模拟",
                "url": "https://httpbin.org/bytes/1024",  # 模拟文件
                "filename": "baidu-simulated.bin",
                "source_type": "baidu"
            }
        ]

        results = []

        for case in test_cases:
            print(f"\n--- {case['name']} ---")

            # 验证链接
            if not downloader.validate_url(case["url"], case["source_type"]):
                print("链接验证失败")
                continue

            # 下载文件
            file_path = downloader.download_file(
                case["url"],
                case["filename"],
                case["source_type"]
            )

            if file_path:
                # 提取元数据
                metadata = downloader.extract_metadata(file_path)
                results.append({
                    "case": case["name"],
                    "success": True,
                    "file_path": file_path,
                    "metadata": metadata
                })
            else:
                results.append({
                    "case": case["name"],
                    "success": False,
                    "error": "下载失败"
                })

        # 输出结果
        print(f"\n=== 测试结果 ===")
        for result in results:
            status = "✅ 成功" if result["success"] else "❌ 失败"
            print(f"{result['case']}: {status}")
            if result["success"]:
                print(f"  文件: {result['file_path']}")
                print(f"  类型: {result['metadata'].get('resource_type', 'unknown')}")
                print(f"  大小: {result['metadata'].get('size', 0)} bytes")

        return results

    finally:
        downloader.cleanup()

def test_ai_content_generation():
    """测试 AI 内容生成功能"""
    print("\n=== AI 内容生成功能测试 ===")

    # 检查环境变量
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        print("⚠️ 未找到 GEMINI_API_KEY 环境变量")
        print("请设置环境变量后重试 AI 内容生成测试")
        return

    try:
        import google.generativeai as genai

        # 配置 API
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # 测试不同资源类型的内容生成
        test_prompts = [
            {
                "type": "unity-assets",
                "filename": "LowPolyShooterPack.unitypackage",
                "description": "为这个 Unity 资源包生成 SEO 友好的标题和描述"
            },
            {
                "type": "software-tools",
                "filename": "Blender_4.2.1.exe",
                "description": "为这个软件工具生成使用说明和功能介绍"
            },
            {
                "type": "design-assets",
                "filename": "UI-Components-Pack.psd",
                "description": "为这个设计素材包生成描述和使用场景"
            }
        ]

        for prompt in test_prompts:
            print(f"\n--- {prompt['type']} 内容生成 ---")
            print(f"文件: {prompt['filename']}")

            # 构建提示词
            full_prompt = f"""
请为以下资源生成 SEO 友好的内容：

资源类型: {prompt['type']}
文件名: {prompt['filename']}
要求: {prompt['description']}

请返回 JSON 格式，包含：
{{
  "title_zh": "中文标题",
  "title_en": "英文标题",
  "description": "详细描述（200-300字）",
  "tags": ["标签1", "标签2", "标签3"],
  "meta_description": "SEO 描述"
}}
"""

            response = model.generate_content(full_prompt)
            print(f"生成的内容:\n{response.text}")

    except ImportError:
        print("⚠️ 未安装 google-generativeai 包")
        print("请运行: pip install google-generativeai")
    except Exception as e:
        print(f"AI 生成测试失败: {e}")

if __name__ == "__main__":
    print("ResLibs Cycle 1 原型验证")
    print("=" * 50)

    # 测试下载功能
    test_download_functionality()

    # 测试 AI 内容生成
    test_ai_content_generation()

    print("\n" + "=" * 50)
    print("测试完成！")