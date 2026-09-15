---
name: project-knowledge-sync
description: "当 English_Learn 完成开发、修复、重构、测试或代码评审后，需要把本次真实改动沉淀回 LLM Wiki 时使用。基于 git diff、实际修改文件和测试结果判断受影响的 Wiki，只更新确实需要更新的知识库文件，并记录 last_updated、last_verified_commit、证据和待确认项。"
---

# 项目知识库开发后同步

## 定位

本 Skill 只负责开发后的知识库沉淀。目标是把已经完成且经过代码和测试验证的变化写回 LLM Wiki，让下一次开发前预读能复用这些结论。

## 固定入口

- 当前仓库：`D:\Projects\English_Learn`
- LLM Wiki 目录：`E:\笔记\项目笔记\30-LLM-WIKI\English_Learn`
- LLM Wiki 入口：`E:\笔记\项目笔记\30-LLM-WIKI\English_Learn\00-index.md`

## 同步前检查

1. 先读取 `git status --short`，识别本次相关改动和用户已有无关改动。
2. 读取 `git diff`、必要时读取 `git diff --staged`，只基于真实代码变化和测试结果更新 Wiki。
3. 获取当前提交：优先使用 `git rev-parse --verify HEAD` 作为 `last_verified_commit`。
4. 如果有测试结果，记录测试命令、输入、期望、实际结果和关键失败信息；没有测试结果时标注未验证原因。
5. 不要移动原始资料，不要把临时对话原样塞进 Wiki。

## 文件选择

只更新确实受影响的文件：

- `00-project-overview.md`：项目定位、模块地图、核心能力发生变化。
- `01-architecture.md`：模块边界、调用链、异步任务、外部依赖或整体结构变化。
- `02-coding-rules.md`：沉淀新的编码约定、高风险边界或测试规则。
- `03-local-dev.md`：启动、环境变量、Docker、Worker、测试命令变化。
- `04-api.md`：新增、删除或修改接口、鉴权、入参、出参、错误语义。
- `05-database.md`：表结构、字段、枚举、索引、数据归属或状态语义变化。
- `06-decisions.md`：关键设计选择，按 ADR 格式记录。
- `07-debug-log.md`：修复问题、排查路径、踩坑或事故复盘。
- `08-codex-guide.md`：以后 Codex 开发必须遵守的新流程或注意事项。

## 写入规则

- 每个被更新文件保留或补齐 frontmatter：`project`、`source_repo`、`last_updated`、`last_verified_commit`、`status`。
- `last_updated` 使用当前日期，`last_verified_commit` 使用同步时读取到的完整 HEAD SHA。
- 新增英文表名、字段名、枚举、状态、接口参数或返回字段时，紧邻写中文业务含义。
- Wiki 和代码冲突时修正 Wiki；无法确认的信息标注“待确认”。
- 保持文档可复用，只写以后开发还值得保留的规则、结构、边界、决策和排障证据。

## 输出要求

完成后回复用户：

- 更新了哪些 Wiki 文件。
- 本次同步依据的 git diff、提交 SHA 和测试结果。
- 记录了哪些待确认项。
- 哪些文件判断后没有更新，以及原因。
