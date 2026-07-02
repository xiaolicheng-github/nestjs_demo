---
name: nestjs-demo-changelog
description: This skill tracks the evolution of the nestjs_demo project - new modules, features added, and known issues/gotchas resolved. Use this skill when adding a major feature/module to the project or when encountering/solving tricky problems that should be documented for future reference. Always update this skill after completing significant work on the project.
  This skill tracks the evolution of the nestjs_demo project - new modules,
  features added, and known issues/gotchas resolved. Use this skill when
  adding a major feature/module to the project or when encountering/solving
  tricky problems that should be documented for future reference.
  Always update this skill after completing significant work on the project.
allowed-tools: 
disable: false
---

# NestJS Demo 项目变更日志 & 知识库

## 用途

此 Skill 用于记录项目的**演进历史**和**经验积累**，确保团队成员共享上下文、避免重复踩坑。

## 何时更新

完成以下任一操作后，**必须**更新 `references/changelog.md`：

1. **新增模块/功能** - 在「功能变更」区添加条目
2. **解决疑难杂症** - 在「问题记录」区添加条目
3. **架构调整** - 在「架构变更」区添加条目

## 更新规范

### 新增功能的格式

```markdown
#### YYYY-MM-DD - [功能名称]
- **涉及文件**: 列出新增/修改的文件
- **说明**: 简要描述做了什么
- **注意事项**: 后续开发需要注意的点（如有）
```

### 记录问题的格式

```markdown
#### [问题描述] (解决日期)
- **现象**: 遇到的问题表现
- **原因**: 根因分析
- **解决方案**: 如何修复的
- **预防**: 如何避免再次出现
```

## 参考文档

完整的变更记录和问题库见 `references/changelog.md`。
