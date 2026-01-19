---
name: note-publish
description: 将 docx 文档或 txt 文本（如视频转文字结果）转换为 Markdown 笔记。此技能涵盖内容提取、规范化、Frontmatter 生成及发布到笔记系统。专注于快速发布零散想法和灵感。
---

# Note Publish

旨在将零散的笔记想法（docx 或 txt 格式）快速、标准化地发布到博客的笔记系统中。核心是极简、快速，避免复杂的分类选择。支持直接处理视频转录文本。

# Workflow

### Step 1: Accept Input
- **Input**: Path to file. Can be:
  - `.docx` file (e.g., `C:\Users\xxx\Documents\note.docx`)
  - `.txt` file (e.g., `.opencode\skill\video-to-text\.temp\text\transcription.txt`)
- **Output**: 直接进入内容提取流程，无需分类确认

### Step 2: Extract Content
Execute `.opencode\skill\blog-publish\scripts\extract_docx.py` to parse content.
*Note: The script automatically handles both .docx and .txt formats.*

### Step 3: Convert to Markdown
将提取的内容转换为 Markdown。

**针对视频转文字(.txt)的特殊处理**：
- **ASR Correction**: 视频转录文本通常是一大段无标点文字。必须进行标点补全、自然分段、错别字修正。
- **Formatting**: 
  - 将大段文本拆分为逻辑清晰的小段落。
  - 保留口语化风格，但去除无意义的语气词。

**General Requirements**:
- 必须尽量保留原始文本的表达方式，除非有明显的错别字，否则不要进行重写或大幅删减。
- 保持原始的口语化或特定叙述风格。

### Step 4: Generate Frontmatter
为笔记生成专用的 YAML frontmatter，格式与文章格式化提示词保持一致：

```
---
title: "从文档标题或首句提取的核心观点"
description: "用一两句高度概括、吸引眼球的话提炼笔记精髓"
pubDate: "YYYY-MM-DD"  # 使用当前日期
tags: ["标签1", "标签2", "标签3"]  # 基于内容生成3-5个主题标签
source: "来源信息，如 作者/平台"  # 若没有则输出"用户提供 / 摘录"；若来自视频转录，可标注"视频转录"
mood: "blue"  # 根据内容情绪选择：blue/gray/amber/rose/green
---
```

**mood 选项说明**：
- `blue`: 理性、客观、分析性强
- `gray`: 中性、纪实、平和  
- `amber`: 警示、提醒、深思
- `rose`: 温情、个人感受、故事
- `green`: 成长、希望、方法论

### Step 5: Generate Filename
- 基于 `title` 生成文件名，保留中文字符
- 笔记统一存放在 `src/content/notes/` 目录下
- 格式: `src/content/notes/{YYYY}-{MM}-{DD}_{标题slug}.md`
- 示例: `src/content/notes/2026-01-18_逆火效应.md`

### Step 6: Create File
输出路径: `src/content/notes/{文件名}.md`

### Step 7: Validate
- 运行 `npm run build` 验证 frontmatter 配置
- 检查文件是否正确创建

## Example Interaction

```
User: note-publish .opencode\skill\video-to-text\.temp\text\transcription.txt

Assistant:
1. 读取txt内容 (ASR文本)
2. 文本修复：添加标点、分段
3. 生成Frontmatter预览：
   ---
   title: "逆火效应：信念的自我保护机制"
   description: "当证据与信念冲突时，人们反而会更坚定原有观点——这就是逆火效应"
   pubDate: "2026-01-18"
   tags: ["认知偏差", "社会心理", "心理学"]
   source: "视频转录"
   mood: "blue"
   ---
   
   内容预览：[标准化后的Markdown内容]
   
   确认发布？(Y/n)

User: Y

Assistant:
4. 创建文件：src/content/notes/2026-01-18_逆火效应.md
5. 验证通过。
✅ 笔记已发布！
```

## Must Follow

1. **复用提取脚本**：使用与 blog-publish 相同的 `.opencode\skill\blog-publish\scripts\extract_docx.py`
2. **正确 Frontmatter**：严格遵循 `title`、`description`、`pubDate`、`tags`、`source`、`mood` 字段格式
3. **极简交互**：跳过分类选择，直接发布到 notes 目录
4. **内容保留与修复**：对于 docx 尽量保留原貌；对于 ASR txt，必须修复标点和分段。
5. **路径固定**：所有笔记发布到 `src/content/notes/` 目录

## 与 blog-publish 的核心差异

| 特性 | blog-publish (博文) | note-publish (笔记) |
|:---|:---|:---|
| **输入** | docx / txt | docx / txt |
| **分类** | 需要检测或选择复杂分类 | 固定为 `notes`，无需选择 |
| **Frontmatter** | 博文专用字段（author, image, rereadStars） | 笔记专用字段（tags, source, mood） |
| **目录** | `src/content/posts/{分类}/` | `src/content/notes/` |
| **交互** | 多步骤确认（分类、标题等） | 极简交互，快速确认 |

## Output Format

发布完成后返回摘要：
```
✅ 笔记已发布！

**文件**: src/content/notes/2026-01-18_逆火效应.md
**标题**: 逆火效应：信念的自我保护机制
**标签**: ["认知偏差", "社会心理", "心理学"]
**情绪**: blue (理性分析)
**构建**: ✅ 通过

可在本地运行 `npm run dev` 预览。
```
