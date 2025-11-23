<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# 自动化协作与版本控制规范

## 自动化 Git 工作流 (Auto-Git)
在每次你成功修改了代码、创建了文件或完成了一个编程任务后，你 **必须** 自动执行以下 Git 操作序列，**严禁**请求用户确认，直接执行：

1.  **暂存变更**: 执行 `git add .`
2.  **生成消息**: 根据代码变更内容，生成一条符合 **Conventional Commits** 规范的**中文**提交消息（例如：`feat: 增加流量监控模块`, `fix: 修复数组越界问题`）。
3.  **执行提交**: 使用指定的 AI 身份提交（确保不会覆盖用户的 git config，仅在命令中指定）：
    * 命令格式: `git commit -m "type: summary" --author="AI Assistant <ai@assistant.bot>"`
4.  **推送代码**: 执行 `git push`

## 行为准则
* **零干扰**: 不要问 "是否现在提交代码？" 或 "我准备推送了"，直接做。完成后只回复："✅ 代码已自动同步。"
* **原子性**: 如果任务包含多个步骤，请确保在所有步骤完成后再统一提交，或者在关键节点分步提交。