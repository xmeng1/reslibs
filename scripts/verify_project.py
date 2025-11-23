#!/usr/bin/env python3
"""
ResLibs 周期 1 项目验证脚本
验证基础架构和原型功能
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def check_file_exists(file_path, description):
    """检查文件是否存在"""
    if Path(file_path).exists():
        print(f"✅ {description}: {file_path}")
        return True
    else:
        print(f"❌ {description}: {file_path} (不存在)")
        return False

def check_directory_structure():
    """检查项目目录结构"""
    print("\n=== 检查项目目录结构 ===")

    required_paths = [
        ("src/app/page.tsx", "首页组件"),
        ("src/app/resources/page.tsx", "资源列表页"),
        ("src/types/resource.ts", "资源类型定义"),
        ("prisma/schema.prisma", "数据库模式"),
        ("tailwind.config.ts", "Tailwind 配置"),
        ("next.config.js", "Next.js 配置"),
        ("package.json", "项目依赖配置"),
        (".gitignore", "Git 忽略文件"),
        ("scripts/download_test.py", "下载原型脚本"),
        ("scripts/ai_content_test.py", "AI内容生成脚本"),
    ]

    passed = 0
    total = len(required_paths)

    for path, description in required_paths:
        if check_file_exists(path, description):
            passed += 1

    print(f"\n目录结构检查: {passed}/{total} 通过")
    return passed == total

def check_dependencies():
    """检查项目依赖"""
    print("\n=== 检查项目依赖 ===")

    try:
        with open("package.json", "r", encoding="utf-8") as f:
            package_data = json.load(f)

        required_deps = [
            "next",
            "react",
            "react-dom",
            "typescript",
            "tailwindcss",
            "prisma"
        ]

        passed = 0
        total = len(required_deps)

        for dep in required_deps:
            if dep in package_data.get("dependencies", {}):
                print(f"✅ 依赖 {dep} 已安装")
                passed += 1
            else:
                print(f"❌ 依赖 {dep} 未找到")

        print(f"\n依赖检查: {passed}/{total} 通过")
        return passed == total

    except Exception as e:
        print(f"❌ 读取 package.json 失败: {e}")
        return False

def check_typescript_config():
    """检查 TypeScript 配置"""
    print("\n=== 检查 TypeScript 配置 ===")

    try:
        with open("tsconfig.json", "r", encoding="utf-8") as f:
            ts_config = json.load(f)

        required_options = [
            "target",
            "lib",
            "allowJs",
            "skipLibCheck",
            "strict",
            "forceConsistentCasingInFileNames",
            "noEmit",
            "esModuleInterop",
            "module",
            "moduleResolution",
            "resolveJsonModule",
            "isolatedModules",
            "jsx"
        ]

        passed = 0
        total = len(required_options)

        for option in required_options:
            if option in ts_config.get("compilerOptions", {}):
                print(f"✅ TS 配置 {option} 已设置")
                passed += 1
            else:
                print(f"❌ TS 配置 {option} 未设置")

        print(f"\nTypeScript 配置检查: {passed}/{total} 通过")
        return passed == total

    except Exception as e:
        print(f"❌ 读取 tsconfig.json 失败: {e}")
        return False

def check_development_server():
    """检查开发服务器状态"""
    print("\n=== 检查开发服务器 ===")

    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', 3000))
        sock.close()

        if result == 0:
            print("✅ 开发服务器运行在 localhost:3000")
            return True
        else:
            print("❌ 开发服务器未运行")
            return False

    except Exception as e:
        print(f"❌ 检查开发服务器失败: {e}")
        return False

def check_git_status():
    """检查 Git 状态"""
    print("\n=== 检查 Git 状态 ===")

    try:
        # 检查是否在 Git 仓库中
        result = subprocess.run(['git', 'rev-parse', '--git-dir'],
                              capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ 当前目录不是 Git 仓库")
            return False

        # 检查工作区状态
        result = subprocess.run(['git', 'status', '--porcelain'],
                              capture_output=True, text=True)
        if result.returncode == 0 and not result.stdout.strip():
            print("✅ Git 工作区干净")
            return True
        else:
            print("⚠️ Git 工作区有未提交的更改")
            return False

    except Exception as e:
        print(f"❌ 检查 Git 状态失败: {e}")
        return False

def validate_python_scripts():
    """验证 Python 脚本语法"""
    print("\n=== 验证 Python 脚本 ===")

    scripts = [
        "scripts/download_test.py",
        "scripts/ai_content_test.py"
    ]

    passed = 0
    total = len(scripts)

    for script in scripts:
        if Path(script).exists():
            try:
                result = subprocess.run([sys.executable, '-m', 'py_compile', script],
                                      capture_output=True, text=True)
                if result.returncode == 0:
                    print(f"✅ {script} 语法正确")
                    passed += 1
                else:
                    print(f"❌ {script} 语法错误: {result.stderr}")
            except Exception as e:
                print(f"❌ 验证 {script} 失败: {e}")
        else:
            print(f"❌ {script} 不存在")

    print(f"\nPython 脚本验证: {passed}/{total} 通过")
    return passed == total

def run_tests():
    """运行所有验证测试"""
    print("ResLibs 周期 1 - 基础架构验证")
    print("=" * 50)

    tests = [
        ("项目目录结构", check_directory_structure),
        ("项目依赖", check_dependencies),
        ("TypeScript 配置", check_typescript_config),
        ("开发服务器", check_development_server),
        ("Git 状态", check_git_status),
        ("Python 脚本", validate_python_scripts),
    ]

    passed_tests = 0
    total_tests = len(tests)

    for test_name, test_func in tests:
        try:
            if test_func():
                passed_tests += 1
        except Exception as e:
            print(f"❌ 测试 {test_name} 出现异常: {e}")

    print("\n" + "=" * 50)
    print(f"验证结果: {passed_tests}/{total_tests} 测试通过")

    if passed_tests == total_tests:
        print("🎉 所有验证通过！项目状态良好")
        return True
    else:
        print("⚠️ 部分验证未通过，请检查上述问题")
        return False

if __name__ == "__main__":
    os.chdir(Path(__file__).parent.parent)  # 切换到项目根目录
    success = run_tests()
    sys.exit(0 if success else 1)