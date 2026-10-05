# AI Agent 工作手册（中文版）

## 基本命令（构建/预览）

```bash
npm run dev      # 本地开发热重载
npm run build    # 生产构建（Astro 静态站点）
npm run preview  # 预览已构建站点

# 更快/更安静的校验与构建（推荐）
npm run check        # 优先：只做项目检查（输出更少）
npm run build:quiet  # 安静构建：关闭 Astro 日志 + Pagefind 仅输出 warning/error
npm run build:silent # 极安静构建：关闭 Astro 日志 + Pagefind 仅输出 error
```

当前项目无测试脚本；`npm run build` 会校验所有 frontmatter（依赖 Zod）。

### 精简构建输出（避免长日志淹没上下文）

- 日常验证优先顺序：`npm run check` → `npm run build:quiet` →（仅排障时）`npm run build`
- 安静构建的原理：
  - Astro 支持 `--silent` 关闭日志
  - Pagefind 支持 `--quiet/--silent` 只输出更关键的信息
- 当需要把日志粘贴到对话里时：只贴“报错段 + 前后少量上下文”（例如最后 40-80 行），避免整段构建输出占用上下文。

## 代码与内容规范

- 类型与严格模式：`tsconfig.json` 继承 `astro/tsconfigs/strict`，禁止使用 `@ts-ignore`、`as any`。
- 前置数据校验：所有 frontmatter 经 `src/content.config.ts` 中的 Zod schema 校验。
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
import { getCollection, render } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("posts");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content, headings } = await render(post);
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

- 内容模型与验证：`src/content.config.ts`
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

- 主要依赖：`astro@7.3.5`（Vite 8，Node ≥ 22.12）、`@astrojs/sitemap`、`@astrojs/markdown-remark`（unified 处理器，承载 rehype 外链插件）、`rehype-external-links`。
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

### Git 操作规则（必须遵守）

- AI 默认不得执行任何写操作 Git 命令（`add/commit/push/reset/rebase/stash/checkout` 等）。
- 每次需要执行 Git 写操作前，必须先征得用户明确同意（例如"你提交一下"），得到授权后才可执行该次操作。
- 只读检查命令（`git status/log/diff/show`）可直接运行，无需逐次询问。
- 涉及历史改写的建议需明确风险、影响范围与回滚方案（如 `git reflog`）。

### 命令输出与编辑约束

- 输出命令时使用独立代码块，附简要目的/风险说明。
- 允许修改仓库文件内容；未经用户授权不得将修改提交到 Git。
- 说明变更保存在工作区，待用户审阅后再决定是否提交。

### 交互流程（用户请求 Git 时）

- 先列只读检查命令确认状态；
- 给出本次拟执行的命令、涉及文件与回滚路径；
- 用户明确同意后执行；操作后再次检查状态并汇报结果。
