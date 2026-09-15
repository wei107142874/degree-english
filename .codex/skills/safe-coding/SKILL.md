---
name: safe-coding
description: "当需要分析或修改 English_Learn 的需求和代码时使用。定位为开发中的安全执行流程：先读取 LLM Wiki 中的 Codex Guide、架构和编码规则，再按这些文档的需求理解模板、高风险检查、修改原则、测试要求和交付模板执行；Skill 本身不重复维护规则正文。"
---

# 安全开发执行流程

## 职责边界

本 Skill 只负责开发中的执行编排，不作为项目规则的唯一来源。

- 规则来源：`E:\笔记\项目笔记\30-LLM-WIKI\English_Learn\08-codex-guide.md`、`E:\笔记\项目笔记\30-LLM-WIKI\English_Learn\01-architecture.md`、`E:\笔记\项目笔记\30-LLM-WIKI\English_Learn\02-coding-rules.md`。
- 开发前知识库预读：交给 `project-knowledge-preflight`。
- 开发后 Wiki 沉淀：交给 `project-knowledge-sync`。
- 不在本 Skill 重复维护高风险规则、分层规则、测试映射、交付模板等规则正文；这些内容以 LLM Wiki 为准。

## 开发前必读

修改代码前先阅读：

- `E:\笔记\项目笔记\30-LLM-WIKI\English_Learn\00-index.md`
- `E:\笔记\项目笔记\30-LLM-WIKI\English_Learn\08-codex-guide.md`
- `E:\笔记\项目笔记\30-LLM-WIKI\English_Learn\01-architecture.md`
- `E:\笔记\项目笔记\30-LLM-WIKI\English_Learn\02-coding-rules.md`

必要时按任务读取原始项目资料：

- `E:\笔记\项目笔记\20-Projects\English_Learn`

只读取当前任务需要的资料。不要移动原始资料。

## 开发中流程

1. 先确认已读取三份必读 Wiki；如果没有，立即补读。
2. 根据任务所属业务域，只补读相关 Wiki 和必要的原始资料。
3. 回到代码，用 `rg` 查真实入口、调用链、数据结构、接口实现和测试。
4. 如果 Wiki、原始资料和代码冲突，以代码、测试、迁移和接口实现为真实状态，并把 Wiki 修正列为开发后同步事项。
5. 按 `08-codex-guide.md` 的需求理解模板输出一句话边界、影响分析和回归计划。
6. 如果触及高风险业务、目录或方法，按 `08-codex-guide.md` 和 `02-coding-rules.md` 的高风险检查执行；需要用户确认时，确认前只分析不改代码。
7. 用户确认可以实现或任务本身已明确要求实现后，按 Wiki 的修改原则、分层规则、权限隔离和测试要求做最小变更。
8. 完成后运行最小相关测试，并按 `08-codex-guide.md` 的交付说明模板报告修改、验证、风险和待确认项。
9. 如产生可复用的规则、结构、接口、数据库或排障信息，继续使用 `project-knowledge-sync` 基于 git diff 更新 LLM Wiki。

## 敏感信息边界

- 不读取与当前任务无关的私人账号、密钥、客户隐私或个人笔记。
- 不复制、输出或写入密钥、令牌、账号密码；发现敏感信息时只说明存在敏感信息和所在配置类别。
- 不把敏感信息写入 LLM Wiki、测试证据、日志说明或交付总结。

## 维护原则

如果发现本 Skill 和 LLM Wiki 内容重复或冲突：

- 保留本 Skill 的触发条件、必读清单和执行顺序。
- 删除本 Skill 中重复的规则正文。
- 把规则内容维护到对应 Wiki 文件中。
