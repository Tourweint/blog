# AI Agent 工作手册（中文版）

## 基本命令（构建/预览）

```bash
npm run dev      # 本地开发热重载
npm run build    # 生产构建（Astro 静态站点）
npm run preview  # 预览已构建站点
```

当前项目无测试脚本；`npm run build` 会校验所有 frontmatter（依赖 Zod）。

## 代码与内容规范

- 类型与严格模式：`tsconfig.json` 继承 `astro/tsconfigs/strict`，禁止使用 `@ts-ignore`、`as any`。
- 前置数据校验：所有 frontmatter 经 `src/content/config.ts` 中的 Zod schema 校验。
- 类型引用：内容集合请使用 `CollectionEntry<"posts">` 等类型，示例见下。

```astro
import type { CollectionEntry } from "astro:content";
const posts: CollectionEntry<"posts">[] = await getCollection("posts");
```

- 命名约定：组件 PascalCase（如 `TableOfContents.astro`），页面小写（如 `index.astro`），布局 `{Name}Layout.astro`（如 `MainLayout.astro`）。
- 导入顺序：
  1. 第三方（`astro:content` 等）
  2. 相对路径组件/布局
  3. 样式
  4. 类型导入
- Astro 结构模板：按顺序放置导入、Props、数据获取、计算、模板、脚本、样式。

### 动态路由与渲染

```astro
export async function getStaticPaths() {
  const posts = await getCollection("posts");
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content, headings } = await post.render();
```

### Frontmatter 规范（示例：posts）

```yaml
title: "必填"
pubDate: 2025-12-08
description: "可选摘要"
author: "姓名" 或 { name: "姓名", url: "..." }
tags: ["tag1", "tag2"]
rereadStars: 0-5  # 0 隐藏，1-5 评级
image: "可选图片 URL"
```

### 客户端脚本与样式

- 客户端交互直接写 `<script>`，可用 `define:vars` 传入服务器数据。
- 样式默认作用域化；全局样式放在 `src/styles/` 或使用 `<style is:global>`。
- CSS 变量定义在 `src/styles/global.css`（如 `--nav-height`, `--bg-body`）。

## 文件与技能分布（核心入口）

- 内容模型与验证：`src/content/config.ts`
- 摘录文章：`src/content/excerpts/posts/`
- 摘录短句：`src/content/excerpts/notes/`
- 摘录对话：`src/content/excerpts/conversations/`
- 摘录人物：`src/content/excerpts/persons/`
- 组件：`src/components/`（卡片、目录、分页等）
- 布局：`src/layouts/`（`MainLayout.astro`, `ConversationLayout.astro`）
- 页面路由：`src/pages/`（含子目录 `category/`, `conversations/`, `notes/`, `posts/` 等）
- 样式：`src/styles/`（按页面拆分，如 `home.css`, `notes.css`）
- 公开资源：`public/`（favicon、静态图片）

## SEO 与可访问性

- `MainLayout` 负责 OG、Twitter Card、canonical、meta description。
- 语义标签：优先使用 `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`。
- 图片必须有 `alt` 文本；无文本交互元素需添加合适的 `aria-label`。

## 依赖与工具链

- 主要依赖：`astro@5.16.6`、`@astrojs/sitemap`、`rehype-external-links`。
- 无 ESLint/Prettier 配置，遵循 TypeScript 严格模式即可。
- 构建同时校验内容：`npm run build`。

## Python 环境与乱码处理

Windows 终端默认编码可能导致 Python 输出中文乱码。执行脚本前请强制指定 UTF-8 编码：

```bash
export PYTHONIOENCODING=utf-8
```

推荐命令模式：

```bash
export PYTHONIOENCODING=utf-8 && python path/to/script.py ...
```

## 安全与执行规范（面向 AI 代理）

### Git 操作禁令（必须遵守）

- AI 不得执行任何 Git 命令（`git reset/rebase/commit/push/stash/checkout` 等）。
- 若需 Git 建议，只能提供用户手动执行的命令与风险说明，禁止自动运行。
- 涉及历史改写的建议需明确风险、影响范围与回滚方案（如 `git reflog`）。

### 命令输出与编辑约束

- 输出命令时使用独立代码块，附简要目的/风险说明；可先给只读检查命令（如 `git status`）。
- 允许修改仓库文件内容，但不得触发任何 Git 操作；说明变更仅保存在工作区。

### 交互流程（用户请求 Git 时）

- 先列只读检查命令；
- 给出可选方案及回滚路径；
- 提供命令但不执行，由用户复制；
- 提醒用户操作后再次检查状态。
