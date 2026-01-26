---
name: video-knowledge-archiving
description: 将视频转文字结果（txt）或 docx 文档转换为结构清晰、易于阅读的 Markdown 知识库文章。此技能涵盖内容提取、语义重构、分类检测、作者信息提取及 Frontmatter 生成。
---

# Video Knowledge Archiving

旨在将视频转录文本或本地文档高效地转化为高质量的知识资产并存储在网站中。该技能的核心在于对原始文稿进行语义重构，使其更易于阅读和检索，特别强调对创作者信息的归属记录。

# Workflow

### Step 1: Accept Input
- **Input**: Path to file or Video URL.
  - `.txt` file (e.g., ASR transcription)
  - `.docx` file
  - **Video URL**: Use `playwright` to access the page and extract info.
- **Output**: Core themes and author info.

### Step 2: Extract Content & Context
- **Tooling**: 
  - For files: Use `extract_docx.py`.
  - For Video URLs: Execute `.opencode/shared/scripts/.venv/Scripts/python.exe .opencode/shared/scripts/douyin_author.py {URL}` to extract video title (if possible), creator name, and creator profile URL.
- **Goal**: Capture not just the text, but the context of "Who said it".

### Step 3: Semantic Reconstruction (CRITICAL)
此步骤将零散的内容转换为结构化的 Markdown 知识库文章。

**重构要求**：
- **ASR Correction**: 修复语音识别错误，添加标点，根据语义逻辑重新划分段落。
- **Readability**: 
  - 使用层级清晰的标题（##, ###）。
  - 对核心观点进行 **加粗**。
  - 使用无序列表（-）或有序列表整理关键点。
  - 移除冗余口语词（ filler words ）。
- **Independence**: 确保文章逻辑自洽，即使没有看过原视频也能读懂核心价值。

### Step 4: Determine Category
Analyze content to suggest category, then confirm with user.

### Step 5: Generate Frontmatter
Create YAML frontmatter based on `src/content/config.ts` schema:

```yaml
---
title: "提取的核心主题"
pubDate: 使用当前日期
description: "文章的简要摘要/知识点概括"
author:
  name: "创作者名称（必须提取）"
  url: "创作者个人主页链接（尽可能提取）"
image: "默认留空"
tags: ["分类名"]
rereadStars: 审阅思想深度与参考价值，0-5星打分。
---
```

### Step 6: Create File
- **Filename**: 短语形式，不含标点，保留中文。
- **Path**: `src/content/posts/{序号}_{分类}/{文件名}.md`

### Step 7: Validate
- Run `npm run build` to verify frontmatter validation.
- Check file structure.

## Must Follow

1. **Author Attribution**: 必须将创作者信息填入 `author` 字段，不仅是出于尊重，更是为了知识追溯。
2. **Formatting**: 禁止在标题上添加数字序号。使用标题标签和加粗提升阅读体验。
3. **Accuracy**: 严禁在没有事实依据的情况下编造内容，仅对表达方式进行优化。
4. **Consistency**: 确保 tags 仅包含分类名。
5. **Filename**: 确保文件名精简，不要太长。
