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
