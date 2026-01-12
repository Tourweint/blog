# 对话页面 - 使用指南

## 📖 功能简介

这是一个专为收藏和展示优质对话的功能模块，包括：

- 名人访谈
- 播客文字版
- 深度对谈录
- 技术问答
- 其他高质量对话内容

## 📁 文件结构

```
src/
├── content/
│   └── conversations/          # 对话内容库
│       ├── lex-sam-altman-agi.md
│       └── ken-robinson-curiosity.md
├── pages/
│   ├── conversations.astro     # 对话列表页面
│   └── conversations/
│       └── [slug].astro        # 动态对话内容页面
├── layouts/
│   └── conversationlayout.astro # 对话内容页面布局
├── components/
│   └── ConversationCard.astro  # 对话卡片组件
└── styles/
    └── conversations.css       # 对话页面样式
```

## ✍️ 如何添加新对话

### 1. 创建 Markdown 文件

在 `src/content/conversations/` 目录中创建新的 `.md` 文件。

文件名格式建议：`[英文主题或人名]-[简要描述].md`

### 2. 前置元数据 (Frontmatter)

```yaml
---
title: 对话标题（必需）
description: 简要描述
pubDate: 2024-01-15
guests: # 嘉宾信息（数组）
  - name: 嘉宾名字
    role: 身份/职位
    bio: 个人简介
    image: /image/conversations/guest-name.jpg # 可选
    url: https://example.com # 主页链接，可选
interviewer: 提问者名字 # 可选
source: 来源说明 # 必需，如"YC Podcast"
sourceUrl: https://example.com # 原文链接，可选
pullQuote: 最震撼的一句话 # 可选，卡片和标题下显示
readingTime: 45 # 阅读时间（分钟），可选
tags: # 话题标签
  - AI
  - 未来
  - 技术
editorNote: | # 编者按，可选
  这篇对话的价值所在...
  为什么收藏这篇...
toc: # 目录，可选
  - title: 第一部分标题
    id: first-section
  - title: 第二部分标题
    id: second-section
---
```

### 3. 内容格式

对话内容使用标准 Markdown 格式。

**关键点：**

- 使用 `## 小标题` 分隔不同的对话主题
- 提问者和回答者的区分方式：

```markdown
## 小标题

**提问者:** 这是提问...

**回答者:** 这是回答...

**提问者:** 继续提问...

**回答者:** 继续回答...
```

### 4. 前置部分（可选）

在 Q&A 之前可以添加：

```markdown
## 关于嘉宾与来源

**[嘉宾名字]** 是...

这次采访...
```

### 5. 底部信息（可选）

在文末添加：

```markdown
## 原文链接与延伸阅读

**完整视频/原文：** [链接文本](URL)

**相关推荐：**

- [推荐 1](URL)
- [推荐 2](URL)
```

## 🎨 设计细节

### 列表页面 (`/conversations`)

- **布局：** 卡片网格（3 列响应式）
- **卡片显示：**
  - 嘉宾头像（可选）
  - 提问者 × 嘉宾名字
  - 对话标题
  - 金句摘录
  - 来源标记
  - 阅读时间
  - 话题标签

### 内容页面 (`/conversations/[slug]`)

- **顶部：** 嘉宾信息 + 标题 + 元数据 + 金句
- **编者按：** 黄色背景框，解释为什么收藏此篇
- **正文：**
  - 清晰的 Q&A 排版
  - 侧边栏嘉宾卡片和目录
  - 深度阅读友好的排版
- **底部：** 原文链接 + 话题标签 + 分享按钮

## 🏷️ 推荐标签

使用一致的标签便于分类：

- **话题：** AI, 创意, 教育, 商业, 技术, 人生哲学, 心理学, 科学, 艺术, 社会...
- **形式：** 播客, 访谈, 演讲, 讨论, 问答...
- **行业：** 科技, 教育, 商业, 创意, 医疗...

## 📸 图片指南

嘉宾照片建议：

- 路径：`/public/image/conversations/[guest-name].jpg`
- 格式：JPG、PNG（推荐 JPG）
- 尺寸：300×300px 或更大（会自动裁剪为圆形）
- 建议使用黑白或深色半身照，体现专业感

## 🔍 SEO 注意事项

- `title`: 简洁、包含关键词
- `description`: 60-160 字，总结核心内容
- `pullQuote`: 选择最有吸引力的句子
- `tags`: 包含相关搜索关键词

## 🎯 编者按技巧

编者按是区别于普通转载的关键。好的编者按：

1. **说明价值** - 为什么收藏这篇
2. **指引重点** - 哪些部分最值得读
3. **连接读者** - 这与你的读者什么相关
4. **展示品味** - 让读者了解你的思维

示例：

```
这是关于 AGI 现状最深刻的对话。Sam 不仅讨论了技术本身，
更重要的是触及了人类存在的根本问题。特别推荐第三部分
关于安全对齐的讨论——这可能是本世纪最重要的工程问题。
```

## 🚀 发布流程

1. 创建 `.md` 文件并填写 frontmatter
2. 编写对话内容
3. 本地测试：`npm run dev`
4. 访问 `http://localhost:3000/conversations` 检查列表
5. 点击卡片检查内容页面
6. 确认无误后提交

## 💡 最佳实践

1. **Q&A 清晰区分** - 使用粗体标记提问者和回答者
2. **段落适度** - 长的回答分成多段便于阅读
3. **保留原意** - 如果是转录或翻译，尽量保持原始风味
4. **链接到原文** - 总是在底部提供原文链接
5. **多样化话题** - 让对话库包含不同领域的声音
6. **定期更新** - 保持新鲜内容流入

## 🎓 示例模板

```yaml
---
title: [对话标题]
description: [简要介绍，100字左右]
pubDate: 2024-01-15
guests:
  - name: 嘉宾名字
    role: 身份
    bio: 简介
    image: /image/conversations/name.jpg
interviewer: 主持人名字
source: 来源（如：某某播客）
sourceUrl: https://...
pullQuote: "最有冲击力的一句话"
readingTime: 30
tags: [话题1, 话题2, 话题3]
editorNote: 编者为什么推荐这篇...
toc:
  - title: 部分标题1
    id: section1
  - title: 部分标题2
    id: section2
---

## 开头信息（可选）

对话背景、嘉宾介绍等

## Q&A 部分

**提问者:** 提问...

**回答者:** 回答...

## 原文与延伸
```

---

**更新于：** 2024 年 1 月

如有问题，欢迎反馈！
