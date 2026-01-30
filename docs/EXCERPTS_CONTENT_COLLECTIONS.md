# Excerpts 内容收集（glob loader）实践笔记

更新时间：2026-01-30

本文记录一次将内容统一放在 `src/content/excerpts/*` 下，并通过 `astro:content` + `astro/loaders` 的 `glob()` 收集与渲染的经验。

目标：

- 内容文件集中在 `src/content/excerpts/{posts,notes,persons,conversations}`
- 路由体系统一挂在 `/excerpts/...`
- 在 **严格 TS** + **构建期静态生成** 下稳定通过（`npm run build` 会校验 frontmatter）

---

## 1. 为什么用 `glob loader`

当内容文件不适合放在 `src/content/<collectionName>/...` 的默认目录结构，或需要把多类内容放到统一的子目录（如 `excerpts/`）时，`defineCollection({ loader: glob(...) })` 很合适：

- 可以把 collection 的“物理目录”改到任意位置
- 仍然享受内容校验（Zod schema）与 `getCollection()` 的能力

在本仓库里：`posts/notes/persons/conversations` 都改为从 `src/content/excerpts/*` 读取；`originals` 仍保持 `type: 'content'`（默认模式）。

---

## 2. 目录约定与 URL 约定

**内容目录（物理位置）**

- `src/content/excerpts/posts/**/*.md(x)`
- `src/content/excerpts/notes/**/*.md(x)`
- `src/content/excerpts/persons/**/*.md(x)`
- `src/content/excerpts/conversations/**/*.md(x)`

**页面路由（站内 URL）**

- `/excerpts/`：总入口
- posts：
  - `/excerpts/posts`
  - `/excerpts/posts/p/:page`
  - `/excerpts/posts/page/:slug`
  - `/excerpts/category/:category(/:page)`
- notes：
  - `/excerpts/notes`
  - `/excerpts/notes/:year/:month`
- persons：
  - `/excerpts/persons`
  - `/excerpts/persons/:slug`
- conversations：
  - `/excerpts/conversations`
  - `/excerpts/conversations/:slug`

说明：notes 列表页已改为 `src/pages/excerpts/notes/index.astro`，因此 URL 可以保持为更短的 `/excerpts/notes`。

---

## 3. `src/content/config.ts` 的关键写法

核心点是：每个集合使用 `glob({ pattern, base })` 指到 excerpts 目录。

示例（以 posts 为例）：

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "src/content/excerpts/posts",
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    // ...
  }),
});
```

建议：

- `pattern` 统一用 `**/*.{md,mdx}`，保持兼容性
- schema 中对历史字段做兼容（如 notes 的 `date`/`pubDate`、`text`/`title` 等）

---

## 4. loader 模式下最常见的两个坑：`slug` 和 `render()`

### 4.1 不要依赖 `entry.slug`

在 `glob loader` 场景下，`CollectionEntry` 的 `slug` 往往不是你以为的“文件路径去掉扩展名”，尤其当内容目录与 collection 名称不一致时。

更稳的做法：**统一用 `entry.id` 推导 slug**。

```ts
export const toIdSlug = (id: string) => id.replace(/\.(md|mdx)$/i, "");
```

然后所有地方（列表链接、详情页 `getStaticPaths`、关联跳转等）都用这个规则。

### 4.2 不要用 `entry.render()`，改用 `render(entry)`

在 loader 模式下，`entry.render()` 不是可靠 API（类型/对象形态会变化）。

推荐写法：

```astro
---
import { render } from "astro:content";
const { Content, headings } = await render(entry);
---

<Content />
```

这点对 posts/notes/persons/conversations 都适用。

---

## 5. `getStaticPaths` 的构建期作用域坑（“not defined”）

Astro 在构建时会执行 `getStaticPaths()`。如果你在组件/页面内部定义 helper 或常量，再在 `getStaticPaths()` 里引用，某些情况下会出现构建错误：

- `xxx is not defined`

经验结论：

- **把 `getStaticPaths` 依赖的常量/函数写成 `export` 顶层声明**，最稳。

例如：

```astro
---
export const ITEMS_PER_PAGE = 8;
export const toPostSlug = (id: string) => id.replace(/\.(md|mdx)$/i, "");

export async function getStaticPaths() {
  // 使用 ITEMS_PER_PAGE / toPostSlug
}
---
```

---

## 6. 路由与布局的拆分经验（推荐模式）

一个稳定、好维护的模式：

- 路由页负责：
  - `getStaticPaths()`
  - `getCollection()` 取数据
  - 计算 props（分页、上一篇/下一篇、返回链接等）
- Layout 负责：
  - SEO/meta
  - 文章结构（标题、作者、TOC、上一篇/下一篇组件、样式）

好处：

- 同类内容（posts/conversations）可以复用布局与组件
- 迁移目录或更换 slug 策略时，改动面更可控

---

## 7. 站内链接统一策略（避免“旧路径残留”）

当路由体系迁移到 `/excerpts/...` 后，最容易遗漏的不是页面本身，而是这些地方：

- 首页入口（如 `/notes`、`/category` 等旧链接）
- Card 组件（ConversationCard/PersonCard）
- Layout 内的返回链接与 tag 链接
- 关联内容跳转（人物页 → 对话页、对话页 → 人物页）

建议做法：

- 先统一出一套“URL 生成函数”（至少是 `toIdSlug()` + 各模块 base path）
- 全局搜索旧路径（如 `/notes`、`/persons`、`/conversations`、`/category`）并替换

本仓库已提供一个通用 util：

- `src/utils/excerptsPaths.ts`：包含 `toIdSlug()` 与 `excerpts.*` URL 生成器（posts/notes/persons/conversations/category）

---

## 8. 迁移/改造步骤清单（可复用）

1. 内容目录搬迁（或新建目录）

- 把内容文件移动到 `src/content/excerpts/<collection>/...`

2. 更新 `src/content/config.ts`

- collection 改为 `loader: glob({ base: "src/content/excerpts/..." })`
- schema 补齐/兼容历史字段

3. 修路由：

- 所有 `getStaticPaths` 的 slug 统一用 `id` 推导
- 所有渲染统一用 `render(entry)`

4. 修组件链接：

- 卡片/列表/关联内容的 href 全部切到 `/excerpts/...`

5. 构建验证：

- 跑 `npm run build`
- 如果报 “not defined”，优先检查 `getStaticPaths` 是否引用了非顶层 `export` 的变量/函数

---

## 9. 常见排错速查

- 构建报 schema 校验错误：
  - 先看报错的集合与字段，补 schema 或修 frontmatter
- 某些详情页 404：
  - 检查 `getStaticPaths` 的 `params.slug` 是否与列表页链接规则一致
- 页面能生成但内容不显示：
  - 确认使用的是 `render(entry)`，而不是 `entry.render()`

---

## 10. 建议的下一步（可选）

- 把 `toIdSlug()` 抽成一个通用 util（如 `src/utils/slug.ts`），并在 posts/persons/conversations 复用
- 如果希望 URL 更优雅：将 `/excerpts/notes/notes` 重构成 `/excerpts/notes/`，并统一替换站内链接（这会涉及路由文件名调整）
