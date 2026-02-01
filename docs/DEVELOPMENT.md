# 开发指南（本地开发 / 内容维护）

## 1. 环境要求

- Node.js（建议使用当前 LTS）
- 包管理：npm

## 2. 启动与构建

在项目根目录执行：

- 安装依赖：
  - `npm install`
- 本地开发（热更新）：
  - `npm run dev`
- 生产构建：
  - `npm run build`
- 本地预览构建产物：
  - `npm run preview`

## 3. 内容结构（写文章放哪）

摘录文章放在：

- `src/content/excerpts/posts/`

你可以按分类建文件夹，例如：

- `src/content/excerpts/posts/04_教育、学习与写作/晚自习与读书月的讨论.md`

路由规则：

- 文章列表页：`/excerpts/posts`
- 文章详情页：`/excerpts/posts/page/<slug>`
- 其中 `<slug>` 由文件路径自动生成（包含子目录）。

## 4. 文章 Frontmatter 字段说明

每篇 Markdown/MDX 文章顶部需要 `---` 包裹的 frontmatter（示例）：

```md
---
title: "标题"
pubDate: 2025-12-28
description: "摘要（可选）"
author: "作者（可选）"
image: "" # 可选
tags: ["分类A", "分类B"]

# 复读/推荐星级：0-5（0 表示不展示）
rereadStars: 4
---
```

字段来源与校验位置：

- `src/content/config.ts`（`posts` collection schema）

### rereadStars（复读/推荐星级）

- 取值范围：`0 ~ 5` 的整数
- 默认值：`0`
- 展示规则：
  - `0` 不展示
  - `>=1` 在文章详情页的“分类”后面展示星星（★）

## 5. 主页功能说明

### 分类与搜索

- 左侧栏会根据所有文章的 `tags` 汇总分类
- 搜索框支持按标题/描述/分类关键词筛选（前端筛选）

### 主页分页（每页 10 篇）

当前主页分页是“前端分页”（不改变 URL）：

- 每页显示 10 篇（`itemsPerPage = 10`）
- 支持：第一页 / 上一页 / 下一页 / 最后一页
- 当切换分类或输入搜索关键词时，会自动回到第 1 页

实现文件：

- `src/pages/index.astro`（前端分页逻辑）
- `src/styles/index.css`（分页样式）

## 6. 文章详情页（星级展示）

文章详情页会在元信息区显示：

- 发布时间
- 分类（tags）
- 推荐星级（当 `rereadStars > 0`）

实现文件：

- `src/pages/excerpts/posts/page/[slug].astro`
- `src/styles/posts.css`

## 7. 常用维护动作

- 新增文章：在 `src/content/excerpts/posts/` 下新增 `.md` 文件，并写好 frontmatter
- 设置星级：在文章 frontmatter 加 `rereadStars: 1~5`
- 修改分类：调整 `tags: [...]` 数组

## 8. 主题与样式维护

主题 tokens、页面作用域（`page-*` body class）与组件/频道 CSS 约定见：

- [docs/THEME_GUIDE.md](docs/THEME_GUIDE.md)
