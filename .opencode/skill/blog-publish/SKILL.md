---
name: blog-publish
description: 将 docx 文档或 txt 文本（如视频转文字结果）转换为 Markdown 博客文章。此技能涵盖内容提取、规范化、语法与风格调整、分类检测、Frontmatter 生成及发布。
---

# Blog Publish

旨在将本地 docx 文档或文本文件高效、高质量地发布到博客系统中。不仅仅是简单的格式转换，更包含对内容的深度审阅与优化。特别是针对视频转录的文本，需要进行标点、分段和语义修正。

# Workflow


### Step 1: Accept Input
- **Input**: Path to file. Can be:
  - `.docx` file (e.g., `C:\Users\xxx\Documents\article.docx`)
  - `.txt` file (e.g., `.opencode\skill\video-to-text\.temp\text\transcription.txt`)
- **Output**: Ask user for category if not determinable from content

### Step 2: Extract Content
Execute `.opencode\skill\blog-publish\scripts\extract_docx.py` to parse content. 
*Note: The script automatically handles both .docx and .txt formats.*

### Step 3: Convert to Markdown
此步骤将提取的内容转换为整洁的 Markdown 文档。

**针对视频转文字(.txt)的特殊处理**：
- **ASR Correction**: 视频转录文本通常缺乏标点、段落划分，且可能包含同音错别字。必须根据语义添加标点符号，合理分段，并修复明显的语音识别错误。
- **Formatting**: 
  - Ensure meaningful paragraph breaks.
  - Remove filler words (uh, um, 那个, 就, 然后) unless necessary for context.

**General Conversions**:
- **Headings**: Detect heading styles → `#`, `##`, `###`
- **Bold/Italic**: `**bold**`, `*italic*`
- **Lists**: `- item` or `1. item`
- **Links**: `[text](url)`
- **Quotes**: `> quote`
- **Code blocks**: ```code```
- **Tables**: Convert to markdown table format

### Step 4: Determine Category
Analyze content to suggest category, then confirm with user:

**Available Categories**:
- `01_思维与认知方法/` - Thinking and cognitive methods
- `02_哲学与思想史/` - Philosophy and intellectual history
- `03_人生发展与价值观/` - Life development and values
- `04_教育、学习与写作/` - Education, learning, writing
- `05_社会、文化与经济/` - Society, culture, economics
- `06_科技、未来与物理/` - Technology, future, physics
- `07_心理、道德与行为/` - Psychology, morality, behavior
- `08_生活理念与实践/` - Life philosophy and practice
- `11_生活随笔/` - Life essays
- `12_圆中百知/` - "Circle of Knowledge" series (numbered models/frameworks)

**For Notes** (short-form): `src/content/notes/`
**For Conversations** (interviews): `src/content/conversations/`

### Step 5: Generate Frontmatter
Create YAML frontmatter based on `src/content/config.ts` schema:

```
---
title: "从文档标题提取"
pubDate: 使用当前日期
description: "这里填写文档的简要描述"
author:
  name: "若文章内未提及，则默认留空"
  url: "默认留空" 
image: "默认留空"
tags: ["大多数情况下为一个标签，就是分类名"]
rereadStars: 请从思想深度、逻辑和美感审阅输入内容，按0-5星打分。0-1星存档，3星起发，5星推荐。
---
```

### Step 6: Generate Filename
- Extract title or use first heading
- Convert to Chinese slug (keep Chinese characters)
- Format: `{序号}_{类别}/{标题}.md`
- Example: `01_思维与认知方法/如何深度思考.md`

### Step 7: Create File
Output path: `src/content/posts/{序号}_{分类}/{文件名}.md`

### Step 8: Validate
- Run `npm run build` to verify frontmatter validation
- Check file was created correctly

## Category Detection Keywords

| Category | Keywords |
|----------|----------|
| 思维与认知方法 | 思考, 认知, 思维模型, 分析, 推理, 逻辑 |
| 哲学与思想史 | 哲学, 思想, 尼采, 苏格拉底, 存在主义, 虚无 |
| 人生发展与价值观 | 人生, 成长, 价值观, 意义, 目标, 幸福 |
| 教育、学习与写作 | 教育, 学习, 写作, 读书, 学生, 老师 |
| 社会、文化与经济 | 社会, 文化, 经济, 政治, 美国, 中国 |
| 科技、未来与物理 | 科技, AI, 未来, 物理, 科技发展 |
| 心理、道德与行为 | 心理, 道德, 行为, 情绪, 人性 |
| 生活理念与实践 | 生活, 实践, 理念, 日常 |
| 圆中百知 | 模型, 框架, 法则, 原理, SWOT, 28法则 |

## Example Interaction

```
User: 帮我发布这篇博文 .opencode\skill\video-to-text\.temp\text\transcription.txt

Assistant:
1. 读取txt内容 (ASR文本)
2. 文本修复：添加标点、分段、修正错别字
3. 分析内容，识别分类
4. 显示预览并确认:
   - 标题: "抖音视频核心观点整理"
   - 分类: 06_科技、未来与物理
   - 位置: src/content/posts/06_科技、未来与物理/抖音视频核心观点整理.md
   - 是否正确？

User: 对，就是这个分类

Assistant:
5. 生成markdown + frontmatter
6. 创建文件
7. 验证
8. 完成
```

## Frontmatter Schema Reference

**Posts** (`src/content/config.ts`):
```typescript
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    author: z.union([z.string(), z.object({
      name: z.string(),
      url: z.string().optional(),
    })]).optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    rereadStars: z.number().int().min(0).max(5).default(0),
  }),
});
```

## Error Handling

- **File not found**: Ask user for correct path
- **No title found**: Ask user to provide title
- **Category unclear**: Show options and ask user to choose
- **Build failed**: Report error, show frontmatter issues

## Output Format

Return a summary after completion:
```markdown
✅ 博文已发布！

**文件**: src/content/posts/04_教育、学习与写作/如何坚持困难的事情.md
**标题**: 如何坚持困难的事情
**分类**: 04_教育、学习与写作
**标签**: ["教育、学习与写作"]
**构建**: ✅ 通过

可在本地运行 `npm run dev` 预览。
```

## Must Follow

1. Always extract **title** from docx/txt (first line or title style). For txt, infer a title if missing.
2. Always ask user to **confirm category** before creating file
3. Always use **today's date** for pubDate
4. 确保tags就是分类名，不要添加其他标签
5. 确保方便阅读，适量添加 # ## ### 标签以及 **加粗** 方便阅读，但是不要在标题上添加数字
6. Keep Chinese characters in filename (don't transliterate)
7. Use proper numbering for category folders (01_, 02_, etc.)
8. **Grammar & Style**: Always proactively fix grammar errors and typos. For ASR text, this is CRITICAL (add punctuation, break paragraphs).
9. 确保文件名不要太长，用一个短语，不要加任何标点符号
