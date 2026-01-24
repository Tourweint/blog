# AGENTS.md - Codebase Guide for AI Agents

## Build Commands

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Production build (Astro static site)
npm run preview      # Preview build locally
```

**No test commands configured** - This is a static blog without automated tests.

## Code Style Guidelines

### TypeScript & Types

- **Strict mode**: `tsconfig.json` extends `astro/tsconfigs/strict`
- **Never suppress errors**: No `@ts-ignore` or `as any`
- **Zod schemas**: All frontmatter fields validated in `src/content/config.ts`
- **CollectionEntry types**: Use `CollectionEntry<"posts">` etc. for type safety

```astro
import type { CollectionEntry } from "astro:content";

const post: CollectionEntry<"posts"> = await getCollection("posts");
```

### Component Naming

- **Components**: PascalCase (`TableOfContents.astro`, `Pagination.astro`)
- **Pages**: lowercase (`index.astro`, `notes.astro`)
- **Layouts**: `{Name}Layout.astro` (`MainLayout.astro`, `ConversationLayout.astro`)

### Import Patterns

1. **Third-party imports first**: `import { getCollection } from "astro:content"`
2. **Relative imports for components**: `import MainLayout from "../layouts/mainlayout.astro"`
3. **Styles**: `import "../styles/global.css"`
4. **Type imports**: `import type { CollectionEntry } from "astro:content"`

### Astro Component Structure

```astro
---
// 1. Imports (styles, components, types)
import Component from "../components/Component.astro";

// 2. Props interface (export if reusable)
interface Props {
  title: string;
  active?: boolean;
}

// 3. Props extraction with defaults
const { title, active = false } = Astro.props;

// 4. Data fetching (async)
const posts = await getCollection("posts");

// 5. Data transformation/sorting
posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

// 6. Utility functions
const formatDate = (date: Date) => date.toLocaleDateString("zh-CN");
---

<!-- Template -->
<Component title={title} active={active} />

<!-- Client-side script -->
<script>
  // DOM manipulation, event listeners
  document.addEventListener("DOMContentLoaded", () => { ... });
</script>

<!-- Scoped styles -->
<style>
  .component { ... }
</style>
```

### Dynamic Routes

```astro
---
export async function getStaticPaths() {
  const posts = await getCollection("posts");
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post, prevPost: ..., nextPost: ... }, // Compute derived data
  }));
}

const { post, prevPost, nextPost } = Astro.props;
const { Content, headings } = await post.render();
---
```

### Content Frontmatter (Zod Schema)

All content in `src/content/posts/`, `notes/`, `conversations/` follows schema in `src/content/config.ts`:

**Posts**:

```yaml
title: "Required"
pubDate: 2025-12-08
description: "Optional summary"
author: "Name" or { name: "Name", url: "..." }
tags: ["tag1", "tag2"]
rereadStars: 0-5  # 0 = hidden, 1-5 = star rating
image: "optional-image-url"
```

### Client-Side Interactivity

Use `<script>` tags (no build step needed):

```astro
<script>
  // Direct DOM access
  const element = document.querySelector(".class");

  // Event listeners
  element.addEventListener("click", () => { ... });

  // Use define:vars to pass server data
</script>
```

**Pattern for server→client data**:

```astro
<script define:vars={{ CONSTANT_FROM_SERVER }}>
  const clientVar = CONSTANT_FROM_SERVER;
</script>
```

### CSS Patterns

- **Scoped styles**: Default in `.astro` files
- **Global styles**: Use `<style is:global>` or import from `src/styles/`
- **CSS Variables**: Defined in `src/styles/global.css` (`--nav-height`, `--bg-body`)
- **Responsive**: Mobile-first with `@media` queries
- **System fonts**: `font-family: system-ui, sans-serif`

### Error Handling

Minimal explicit error handling. Astro throws build errors for:

- Invalid frontmatter (Zod validation)
- Missing required fields
- Type mismatches

When adding error handling, use try/catch with meaningful error messages.

## File Structure

```
src/
├── content/
│   ├── config.ts          # Zod schemas for collections
│   ├── posts/            # Blog articles
│   ├── notes/            # Short quotes
│   └── conversations/    # Interview transcripts
├── pages/
│   ├── index.astro       # Homepage
│   ├── posts/[...slug].astro  # Article pages
│   └── ...
├── components/           # Reusable Astro components
├── layouts/              # Layout templates
└── styles/               # CSS files
```

## SEO & Accessibility

- **MainLayout** handles: Open Graph, Twitter Card, canonical URLs, meta description
- **Use semantic HTML**: `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`
- **ARIA labels**: For interactive elements without text
- **Alt text**: Required for images

## Content Guidelines

- **Chinese primary**: Content is in Chinese
- **Date format**: `YYYY-MM-DD` in frontmatter
- **Categories**: Use `tags` array for categorization
- **File organization**: Group by category in subdirectories (e.g., `01_思维与认知方法/`)

## Key Dependencies

- `astro` - Framework (v5.16.6)
- `@astrojs/sitemap` - Sitemap generation
- `rehype-external-links` - External links open in new tab

## Quick Reference

- **Single test run**: No tests configured
- **Linting**: No ESLint configured (follow TypeScript strict mode)
- **Formatting**: No Prettier configured
- **Content validation**: `npm run build` validates all frontmatter via Zod schemas

## Agent Execution & Safety Rules

### 禁止 Git 操作（强制）

- 不得在任何情况下由 AI 执行 Git 相关操作（包括但不限于 `git reset`, `git rebase`, `git commit`, `git push`, `git stash`, `git checkout`，以及任何会更改仓库历史或工作区的命令）。
- 不得调用任何终端工具以直接执行 Git 命令；需要进行 Git 变更时，AI 仅提供“用户手动复制粘贴”的命令建议与风险说明。
- 涉及潜在破坏性历史变更（如重置、强推）的建议必须包含：影响范围、风险提示、可恢复方案（如 `git reflog`、撤销步骤）、以及“请手动确认后再执行”的明确提示。

### 命令输出与执行策略

- AI 输出命令时，使用独立代码块，保持可复制性与最少交互；绝不自动执行。
- 为每一组命令提供简短说明：目的、影响、可撤销方式；必要时提供只读检查命令（如 `git status`, `git log --oneline`, `git reflog`）供用户先确认。
- 优先推荐安全替代方案（如 `--force-with-lease` 而非 `--force`，使用 `git reset --soft` 而非 `--hard` 等）。

### 文件编辑与代码更改

- 允许通过文件编辑工具对仓库文件进行内容修改（如样式、页面逻辑），但不触发任何 Git 操作。
- 对涉及破坏性影响的更改，需在说明中标明该更改仅保存到工作区，是否提交与推送由用户自行决定。

### 示例模板（供用户手动执行）

目的：移除最后一次提交记录，但保留改动（本地）

```bash
# 查看当前状态（只读）
git status
git log --oneline -5

# 软回退：删除最近一次提交记录，但保留改动在暂存区
git reset --soft HEAD~1

# 可选：重新提交（如需合并改动到新的提交）
git commit -m "整理：合并最近改动但不保留旧提交记录"

# 可选：更新远端历史（风险较高，需确认）
# 强烈建议使用 --force-with-lease 而不是 --force
git push --force-with-lease
```

风险提示：

- 任何历史变更都可能影响协作分支，请先与团队确认。
- 若误操作，可尝试 `git reflog` 查找之前的游标位置并手动恢复。

### 交互规范

- 当用户请求执行 Git 操作时，AI 应：
  - 提供只读检查命令，帮助用户确认当前状态；
  - 列出可选方案及其风险与回滚路径；
  - 输出命令但不执行，由用户复制粘贴运行；
  - 在完成后提示用户再次用只读命令确认结果。
