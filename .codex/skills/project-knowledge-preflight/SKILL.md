---
name: project-knowledge-preflight
description: "当准备在 English_Learn 开发、排查、评审或修改代码前使用。负责先读取项目入口、LLM Wiki 和任务相关资料，再阅读真实代码确认当前状态；输出项目结构理解、影响范围、Wiki 过期风险和下一步建议。不负责直接修改代码。"
---

# 项目知识库开发前预读

## 定位

本 Skill 只负责开发前建立上下文。目标是让 Codex 先理解项目规则、业务边界、历史决策和真实代码状态，再进入 `safe-coding` 或其他实现流程。

## 固定入口

- 当前仓库：`D:\Projects\English_Learn`
- LLM Wiki 入口：`E:\笔记\项目笔记\30-LLM-WIKI\English_Learn\00-index.md`
- 开发指南：`E:\笔记\项目笔记\30-LLM-WIKI\English_Learn\08-codex-guide.md`
- 项目架构：`E:\笔记\项目笔记\30-LLM-WIKI\English_Learn\01-architecture.md`
- 编码规则：`E:\笔记\项目笔记\30-LLM-WIKI\English_Learn\02-coding-rules.md`
- 原始资料：`E:\笔记\项目笔记\20-Projects\English_Learn`

## 开发前流程

1. 确认仓库根目录和当前任务范围。
2. 读取固定入口中的 `00-index.md`、`08-codex-guide.md`、`01-architecture.md`、`02-coding-rules.md`。
3. 只按当前任务读取相关 Wiki 文件和原始资料，不要一次性塞入全部知识库。
4. 如果任务涉及 `02-coding-rules.md` 或 `08-codex-guide.md` 标记的高风险领域，先打开对应 Wiki 和资料。
5. 用 `rg` 或项目既有结构阅读真实代码，至少确认入口、业务层、数据层、模型/Schema、异步任务、测试和调用方。
6. 当 Wiki、原始资料和代码冲突时，以代码为准，并把冲突标为开发后需要沉淀的 Wiki 修正点。

## 输出要求

预读完成后先回复用户，除非用户已明确要求继续实现。回复包含：

- 已读取的入口和任务相关 Wiki。
- 对项目结构和业务边界的简要理解。
- 当前任务可能影响的模块、接口、数据表、异步任务或测试。
- Wiki 中明显过期、待确认或需要用代码验证的信息。
- 下一步建议：进入 `safe-coding`、继续补充资料，或先澄清风险点。

## 注意事项

- 不要盲信 Wiki；它是导航和背景，代码是真实状态。
- 不确定的信息必须标注“待确认”。
- 如果知识库入口缺失或路径不可访问，说明缺失项并停止进入开发实现，等待用户确认入口。
