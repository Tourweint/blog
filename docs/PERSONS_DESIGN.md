# 人物页设计方案

## 概述

新增一个独立的"人物"内容集合和页面，用于集中管理和展示各类人物（名人、博主、嘉宾等）。对话页可以通过引用 slug 来关联人物，简化 frontmatter 的复杂度。

## 目标

1. **集中管理人物数据**：所有人物信息存储在 `src/content/persons/` 目录
2. **组件化复用**：创建 `PersonCard` 组件，可在对话页、人物详情页等处复用
3. **简化对话页**：移除 `toc` 字段，将嘉宾信息简化为 slug 引用
4. **独立人物页**：提供人物列表页和详情页，方便浏览和管理

---

## 文件结构

```
src/
├── content/
│   ├── config.ts              # 新增 persons schema
│   ├── persons/               # 新增人物目录
│   │   ├── sam-altman.md
│   │   ├── ken-robinson.md
│   │   └── lex-fridman.md
│   └── conversations/         # 现有对话目录
│       └── *.md               # 修改 frontmatter 结构
├── components/
│   ├── PersonCard.astro       # 新增人物卡片组件
│   └── PersonCardMini.astro   # 新增迷你人物卡片（对话页侧边栏用）
├── pages/
│   ├── persons.astro          # 新增人物列表页
│   └── persons/
│       └── [slug].astro       # 新增人物详情页
├── layouts/
│   └── conversationlayout.astro # 修改：使用 PersonCard
└── styles/
    └── persons.css            # 新增人物页样式
```

---

## Schema 设计

### 1. Persons Schema (新增)

```typescript
// src/content/config.ts
const persons = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),                           // 姓名
    nameEn: z.string().optional(),              // 英文名
    avatar: z.string().optional(),              // 头像 URL
    role: z.string().optional(),                // 身份/职位
    bio: z.string().optional(),                 // 简介
    tags: z.array(z.string()).default([]),      // 标签 (如: AI, 教育, 创业)
    links: z.object({                           // 社交链接
      website: z.string().optional(),
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      github: z.string().optional(),
    }).optional(),
    featured: z.boolean().default(false),       // 是否推荐/置顶
  }),
});
```

### 2. Conversations Schema (修改)

**移除字段**：
- `toc` - 目录改为自动从 headings 生成

**简化字段**：
- `guests` - 从完整对象改为 slug 数组引用
- `interviewer` - 保留字符串（可选改为 slug）

```typescript
const conversations = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    guests: z.array(z.string()),               // 改为 slug 数组，如 ["sam-altman"]
    interviewer: z.string().optional(),         // 保持简单字符串或也可改为 slug
    source: z.string(),
    sourceUrl: z.string().optional(),
    pullQuote: z.string().optional(),
    readingTime: z.number().optional(),
    tags: z.array(z.string()).default([]),
    editorNote: z.string().optional(),
    // 移除: toc
  }),
});
```

---

## 组件设计

### 1. PersonCard.astro (人物卡片 - 列表页用)

```astro
---
interface Props {
  person: CollectionEntry<"persons">;
  showBio?: boolean;
}
---
<!-- 卡片布局：头像 + 姓名 + 身份 + 简介 + 标签 + 链接 -->
```

**样式特点**：
- 卡片式布局，hover 效果
- 头像居左，信息居右
- 标签以 pill 形式展示
- 社交链接图标

### 2. PersonCardMini.astro (迷你卡片 - 对话页侧边栏用)

```astro
---
interface Props {
  personSlug: string;
}
---
<!-- 紧凑布局：头像 + 姓名 + 身份 + "查看详情" 链接 -->
```

**用途**：
- 对话页侧边栏显示嘉宾信息
- 点击可跳转到人物详情页

---

## 页面设计

### 1. /persons (人物列表页)

**功能**：
- Hero 区域：标题 + 描述
- 标签过滤器（按领域筛选）
- 人物卡片网格
- 分页或无限滚动

**布局**：
```
┌─────────────────────────────────────┐
│  Persons / 人物志                    │
│  收录各领域有影响力的人物             │
├─────────────────────────────────────┤
│  [全部] [AI] [教育] [创业] [科技]     │
├─────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ Card │  │ Card │  │ Card │       │
│  └──────┘  └──────┘  └──────┘       │
│  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ Card │  │ Card │  │ Card │       │
│  └──────┘  └──────┘  └──────┘       │
└─────────────────────────────────────┘
```

### 2. /persons/[slug] (人物详情页)

**功能**：
- 人物完整信息展示
- Markdown 正文内容（可选）
- 相关对话列表（该人物参与的对话）
- 社交链接

**布局**：
```
┌─────────────────────────────────────┐
│  [头像]                              │
│  姓名 / 英文名                        │
│  身份                                │
│  [标签1] [标签2] [标签3]              │
├─────────────────────────────────────┤
│  简介 / 详细介绍（Markdown 正文）      │
├─────────────────────────────────────┤
│  相关对话                            │
│  ┌──────────────────────────────┐   │
│  │ 对话标题 1                    │   │
│  │ 对话标题 2                    │   │
│  └──────────────────────────────┘   │
├─────────────────────────────────────┤
│  [网站] [Twitter] [LinkedIn]         │
└─────────────────────────────────────┘
```

---

## 对话页修改

### ConversationLayout.astro 改动

1. **侧边栏嘉宾卡片**：
   - 现在：直接渲染 `data.guests` 数组中的对象
   - 改为：根据 slug 查询 persons 集合，使用 `PersonCardMini` 组件

2. **目录**：
   - 现在：使用 frontmatter 中的 `toc` 字段
   - 改为：自动从 `headings` 生成（已有 TableOfContents 组件支持）

```astro
---
// 查询嘉宾信息
const allPersons = await getCollection("persons");
const guestPersons = data.guests
  .map(slug => allPersons.find(p => p.slug === slug))
  .filter(Boolean);
---

<!-- 侧边栏 -->
{guestPersons.map(person => (
  <PersonCardMini person={person} />
))}
```

---

## 数据迁移

### 现有对话文件修改示例

**Before (lex-sam-altman-agi.md)**:
```yaml
guests:
  - name: Sam Altman
    role: OpenAI CEO
    bio: OpenAI 首席执行官，推动 AI 民主化的践行者
    image: https://...
    url: https://twitter.com/sama
interviewer: Lex Fridman
```

**After**:
```yaml
guests:
  - sam-altman
interviewer: Lex Fridman  # 或改为 interviewer: lex-fridman
```

### 新增人物文件示例

**src/content/persons/sam-altman.md**:
```yaml
---
name: Sam Altman
nameEn: Sam Altman
avatar: https://n.sinaimg.cn/spider20230113/50/w1400h1050/20230113/1141-3448133ca28e750d991410132b3cd2f4.jpg
role: OpenAI CEO
bio: OpenAI 首席执行官，推动 AI 民主化的践行者
tags: [AI, 创业, 科技领袖]
links:
  twitter: https://twitter.com/sama
  website: https://blog.samaltman.com/
featured: true
---

Sam Altman 是 OpenAI 的首席执行官...
```

---

## 导航更新

在 `mainlayout.astro` 中添加人物页入口：

```html
<li><a href="/persons">人物</a></li>
```

建议放置位置：对话和短句之间。

---

## 实施步骤

1. **创建 persons schema** - 在 config.ts 中添加
2. **创建示例人物数据** - 迁移现有嘉宾信息
3. **创建 PersonCard 组件** - 列表页用
4. **创建 PersonCardMini 组件** - 对话页侧边栏用
5. **创建人物列表页** - /persons
6. **创建人物详情页** - /persons/[slug]
7. **修改 conversations schema** - 移除 toc，简化 guests
8. **修改 conversationlayout** - 使用 PersonCardMini
9. **更新现有对话文件** - 迁移 frontmatter
10. **更新导航** - 添加入口
11. **验证构建** - 确保无错误

---

## 风险与注意事项

1. **数据迁移**：需要同步创建人物文件和更新对话文件
2. **向后兼容**：建议一次性完成迁移，避免混合状态
3. **图片资源**：人物头像建议使用稳定的外部链接或本地资源
4. **slug 规范**：统一使用小写字母和连字符（如 `sam-altman`）

---

## 问题确认

在实施前，请确认以下问题：

1. **interviewer 是否也改为 slug 引用？**
   - 如果 interviewer 也需要详细信息 → 改为 slug
   - 如果只需要显示名字 → 保持字符串

2. **人物详情页是否需要 Markdown 正文？**
   - 是 → 可以写详细介绍
   - 否 → 只用 frontmatter 数据

3. **是否需要"该人物参与的对话"关联功能？**
   - 需要在人物详情页显示相关对话列表

4. **导航位置偏好？**
   - 建议：首页 | 归档 | 对话 | **人物** | 短句 | 工具 | 关于

---

*文档创建时间：2025-01-20*
