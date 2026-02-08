---
name: short-knowledge-archiving
description: 将灵感、短篇文稿或视频摘要（txt/docx）转换为易读的 Markdown 短篇笔记。此技能专注于快速归档零散知识点，自动提取来源与创作者信息，并进行语义分段优化。
---

# Short Knowledge Archiving

旨在将零散的灵感、短篇摘录或视频金句高效地转化为标准化的短篇笔记并存储在知识库中。该技能强调“快”与“准”，同时确保每一个知识点都有明确的来源归属。

# Workflow

### Step 1: Accept Input

- **Input**: Path to file or Video URL.
  - `.txt` file (ASR transcription)
  - `.docx` file
  - **Video URL**: Use `playwright` to extract core quote and author info.
- **Output**: Core insight and source details.

### Step 2: Extract Content & Author

- **Tooling**:
  - For files: Use `extract_docx.py`.
  - For Video URLs: Execute `.opencode/shared/scripts/.venv/Scripts/python.exe .opencode/shared/scripts/douyin_author.py {URL}` to extract creator name and profile URL.
- **Author Extraction**: 尽可能识别原始创作者。

### Step 3: Content Refinement (CRITICAL)

将零散文本转换为易读的笔记格式。

**处理要求**：

- **ASR Correction**: 修复语音识别错误，补全标点。
- **Structuring**:
  - 将长文本拆分为逻辑清晰的短句或段落。
  - 使用 **加粗** 突出核心金句或关键词。
  - 保持风格简洁，去除冗余废话。

### Step 4: Generate Frontmatter

笔记专用 YAML frontmatter，格式遵循 `src/content/config.ts`：

```yaml
---
title: "提取的核心观点（作为笔记标题）"
description: "用一句话提炼笔记精髓"
pubDate: "YYYY-MM-DD" # 使用当前日期
tags: ["基于内容生成2-3个主题标签"]
source: "作者/创作者名称"
mood: "根据内容情绪选择：blue/gray/amber/rose/green"
---
```

**mood 选项说明**：

- `blue`: 理性、客观、分析性强
- `gray`: 中性、纪实、平和
- `amber`: 警示、提醒、深思
- `rose`: 温情、个人感受、故事
- `green`: 成长、希望、方法论

### Step 5: Create File

- **Filename**: `src/content/excerpts/notes/{YYYY}-{MM}-{DD}_{简短标题}.md`
- **Path**: `src/content/excerpts/notes/`

### Step 6: Validate

- Run `npm run build` 验证 frontmatter。

## Must Follow

1. **Author Attribution**: 必须在 `source` 字段中记录创作者名称。如果是视频，必须提取作者主页 URL。
2. **Readability**: 虽然是短篇，也必须通过分段和加粗确保一眼就能看清核心观点。
3. **Simplicity**: 保持交互极简，直接发布到 `notes` 目录，无需选择复杂分类。
4. **Consistency**: 标签（tags）要精准，数量控制在 2-3 个。
