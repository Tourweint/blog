# SEO 优化指南

> 本文档记录博客的 SEO（搜索引擎优化）配置，帮助理解每个标签的作用。

## 什么是 SEO？

SEO（Search Engine Optimization）是让网站更容易被搜索引擎（如 Google、百度）发现和理解的技术。好的 SEO 可以：

- 提高搜索排名，让更多人找到你的内容
- 在社交媒体分享时显示漂亮的预览卡片
- 帮助搜索引擎理解页面内容

---

## 基础 Meta 标签

### 1. `<title>` 标签

```html
<title>文章标题 - 多鸣的博客</title>
```

- **作用**：显示在浏览器标签页、搜索结果标题
- **建议**：50-60 个字符，包含关键词

### 2. `<meta name="description">`

```html
<meta name="description" content="这是文章的简短描述..." />
```

- **作用**：搜索结果中显示的摘要文字
- **建议**：150-160 个字符，吸引用户点击

### 3. `<link rel="canonical">`

```html
<link rel="canonical" href="https://yoursite.com/posts/xxx" />
```

- **作用**：告诉搜索引擎这是页面的"官方"URL
- **解决问题**：防止重复内容（如 `/page` 和 `/page/` 被当作两个页面）

### 4. `<meta name="robots">`

```html
<meta name="robots" content="index, follow" />
```

- **作用**：告诉搜索引擎如何处理这个页面
- **常见值**：
  - `index, follow` - 收录页面，跟踪链接（默认）
  - `noindex` - 不收录此页面
  - `nofollow` - 不跟踪页面上的链接

---

## Open Graph 标签（社交分享）

当你在微信、Facebook、Twitter 等平台分享链接时，这些标签决定了预览卡片的样子。

```html
<meta property="og:type" content="article" />
<meta property="og:url" content="https://yoursite.com/posts/xxx" />
<meta property="og:title" content="文章标题" />
<meta property="og:description" content="文章描述" />
<meta property="og:image" content="https://yoursite.com/image.png" />
<meta property="og:site_name" content="多鸣的博客" />
<meta property="og:locale" content="zh_CN" />
```

### 标签说明

| 标签             | 作用         | 示例值                               |
| ---------------- | ------------ | ------------------------------------ |
| `og:type`        | 内容类型     | `website`（首页）、`article`（文章） |
| `og:url`         | 页面完整 URL | `https://yoursite.com/posts/xxx`     |
| `og:title`       | 分享标题     | `如何高效学习`                       |
| `og:description` | 分享描述     | `本文介绍了...`                      |
| `og:image`       | 预览图片     | 建议尺寸 1200×630px                  |
| `og:site_name`   | 网站名称     | `多鸣的博客`                         |
| `og:locale`      | 语言地区     | `zh_CN`                              |

### 文章专用标签

```html
<meta property="article:published_time" content="2025-01-01T00:00:00Z" />
<meta property="article:tag" content="学习" />
<meta property="article:tag" content="效率" />
```

---

## Twitter Card 标签

Twitter 有自己的一套标签系统：

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="文章标题" />
<meta name="twitter:description" content="文章描述" />
<meta name="twitter:image" content="https://yoursite.com/image.png" />
```

### Card 类型

| 类型                  | 效果             |
| --------------------- | ---------------- |
| `summary`             | 小图预览         |
| `summary_large_image` | 大图预览（推荐） |

---

## Sitemap（站点地图）

### 什么是 Sitemap？

Sitemap 是一个 XML 文件，列出网站所有页面的 URL，帮助搜索引擎更快地发现和索引内容。

### 配置方式

已安装 `@astrojs/sitemap` 插件，在 `astro.config.mjs` 中配置：

```javascript
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://yoursite.com",
  integrations: [sitemap()],
});
```

### 生成位置

构建后会生成：

- `/sitemap-index.xml` - 站点地图索引
- `/sitemap-0.xml` - 实际的页面列表

---

## robots.txt

### 作用

告诉搜索引擎爬虫哪些页面可以抓取，哪些不可以。

### 当前配置

```txt
User-agent: *
Allow: /

Sitemap: https://yoursite.com/sitemap-index.xml
```

- `User-agent: *` - 对所有爬虫生效
- `Allow: /` - 允许抓取所有页面
- `Sitemap:` - 告知站点地图位置

### 常见配置示例

```txt
# 禁止抓取某个目录
Disallow: /admin/

# 禁止抓取某个文件
Disallow: /private.html

# 只允许 Google 爬虫
User-agent: Googlebot
Allow: /
```

---

## 本博客的 SEO 配置

### 需要修改的地方

**1. 修改域名**（两处）：

`astro.config.mjs`:

```javascript
site: 'https://你的域名.com',
```

`src/layouts/mainlayout.astro`:

```javascript
const siteUrl = "https://你的域名.com";
```

`public/robots.txt`:

```txt
Sitemap: https://你的域名.com/sitemap-index.xml
```

### Props 说明

布局组件 `MainLayout` 接受以下 props：

| Prop            | 类型                   | 默认值        | 说明               |
| --------------- | ---------------------- | ------------- | ------------------ |
| `title`         | string                 | "多鸣的博客"  | 页面标题           |
| `description`   | string                 | "多元发声..." | 页面描述           |
| `image`         | string                 | favicon       | 分享预览图         |
| `type`          | "website" \| "article" | "website"     | 内容类型           |
| `publishedTime` | Date                   | -             | 发布时间（文章用） |
| `tags`          | string[]               | []            | 标签（文章用）     |

### 使用示例

```astro
---
import MainLayout from "../layouts/mainlayout.astro";
---

<MainLayout
  title="关于我 - 多鸣的博客"
  description="这是关于页面的描述"
>
  <!-- 页面内容 -->
</MainLayout>
```

文章页面：

```astro
<MainLayout
  title={`${post.title} - 多鸣的博客`}
  description={post.description}
  type="article"
  publishedTime={post.pubDate}
  tags={post.tags}
  image={post.image}
>
```

---

## 测试工具

验证 SEO 配置是否正确：

1. **[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)** - 测试 Open Graph 标签
2. **[Twitter Card Validator](https://cards-dev.twitter.com/validator)** - 测试 Twitter 卡片
3. **[Google Rich Results Test](https://search.google.com/test/rich-results)** - 测试结构化数据
4. **浏览器开发者工具** - 查看 `<head>` 中的 meta 标签

---

## 参考链接

- [Open Graph 协议](https://ogp.me/)
- [Twitter Cards 文档](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Google SEO 入门指南](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Astro Sitemap 集成](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
