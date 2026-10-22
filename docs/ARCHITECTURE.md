# 站点架构总览（Astro 静态博客）

> 本文描述当前站点的整体架构与关键设计决策，供后续修改前快速建立上下文。
> 各专题的深入记录见：[EXCERPTS_CONTENT_COLLECTIONS.md](./EXCERPTS_CONTENT_COLLECTIONS.md)、
> [THEME_GUIDE.md](./THEME_GUIDE.md)、[SEO.md](./SEO.md)。

## 1. 技术栈与构建

- **Astro 5 全静态站点（SSG）**，无任何客户端框架，交互全靠少量原生 `<script>`。
- 站点域名单一真源：`astro.config.mjs` 的 `site`（`https://tourweint.shop`），布局内一律用 `Astro.site` 派生。
- 构建：`astro build && pagefind --site dist`。日常验证顺序：`npm run check` → `npm run build:quiet`。
- 部署：Vercel（无 `vercel.json`，使用默认缓存策略）。
- 内容即校验：构建时 Zod schema 校验全部 frontmatter（`src/content/config.ts`）。

## 2. 内容模型（5 个集合）

| 集合 | 加载器 | 数量 | 说明 |
|---|---|---|---|
| `posts` | glob loader（新 Content Layer API，key = `entry.id`） | ~440 | 摘录文章，11 个分类目录 |
| `notes` | glob loader | ~142 | 短句/笔记，schema 故意宽松（兼容旧字段 `text`/`date`） |
| `conversations` | glob loader | 3 | 对话，`guests` 按 slug 引用 `persons` |
| `persons` | glob loader | 3 | 人物 |
| `originals` | **旧版 `type: 'content'`**（`post.slug` / `post.render()`） | 10 | 原创，与上面四套 API 并存（已知技术债，见 §7） |

注意两套 API 的差异（详见 EXCERPTS_CONTENT_COLLECTIONS.md §4）：

- 新 API：`entry.id`（不含扩展名）、`await render(entry)`。
- 旧 API：`post.slug`、`post.render()`。**写新代码不要模仿 `originals` 的旧写法。**

## 3. URL 约定与单一真源

- 所有摘录 URL（列表/详情/翻页/返回链接）必须经 `src/utils/excerptsPaths.ts` 生成，禁止硬编码 `/excerpts/*`。
- 原创 URL 目前未走该工具：列表页 `/originals/{systems|fragments|projects}`，详情页 `/originals/{category}/{slug}`。

## 4. 渲染策略：静态分页 + 正文延迟加载

大集合页面采用「静态分页 + 正文懒加载」模式，避免把全量内容烘进 HTML：

1. **静态分页**：短句频道按 18 条一页切成 `/excerpts/notes` 与 `/excerpts/notes/p/N`，
   标签维度另有 `/excerpts/notes/tag/<标签>[/p/N]`；四个路由共用
   `src/components/excerpts/NotesChannel.astro`，只靠 props 区分作用域与页码。
   分页控件复用 `src/components/Pagination.astro`（与文章页同一套）。
2. **正文延迟加载**：全部笔记正文单独走 `/excerpts/notes/bodies.json`（由
   `src/pages/excerpts/notes/bodies.json.ts` 生成），客户端 idle 时拉取；
   展开某条笔记时才用 `marked` 渲染正文（`src/scripts/noteBody.ts`）。
3. **共享视图模型**：列表页/分页页/标签页/月度页/JSON 端点共用 `src/utils/notesData.ts`，
   排序、分月、标签统计、内容派生 key 只写一遍。
4. **跨页随机**：刊头「随机一条」读页面里的 `#notes-random-index`（作用域内每页 URL +
   每条短句所在页码），命中别的页就带 `#note-<key>` 跳过去，目标页自动展开、高亮、滚动定位。

> 历史：短句页最初是「SSR 首屏 18 张 + 数据岛补齐全量 + 加载更多」。
> 分页化后不再需要数据岛，页面体积反而更小（91KB → 92KB/页，但总量从 1 页 143 张变成 8 页 × 18 张）。

> 经验：dev 下 Astro 会给每个 DOM 元素注入 `data-astro-source-*` 源码定位注解，「一次性渲染上百张卡片」的页面卡顿主因是**服务端节点数量**（已用对照实验量化），而非数据量或 Markdown 编译；生产构建无此开销。

## 5. 搜索（Pagefind）

- 构建末尾对 `dist/` 建索引（约 5 MB，只在访问 `/search` 时按需动态 `import`）。
- 索引范围靠 `<main data-pagefind-body>` 圈定（`mainlayout.astro`），新页面想进搜索就在 `<main>` 上挂这个属性；反之不挂即不入库。
- 中文无词干化支持（构建时会提示，属预期）。

## 6. 字体与关键 CSS 策略

- 三套自托管可变字体：`@fontsource-variable/inter`、`/noto-sans-sc`、`/noto-serif-sc`，在 `src/styles/global.css` **不 import**（历史原因见下）。
- 两个 Noto SC 包的 `index.css` 各含 101 条 `@font-face`（unicode-range 切片），加上 Inter 共约 200 条声明、~200 KB。若按常规打进全局 CSS，会成为每页共享的渲染阻塞资源。
- 现行方案：在 `mainlayout.astro` 的 head 里用 `?url` 把三份字体 CSS 引成独立文件，
  `<link rel="preload" as="style">` + `media="print"`（加载完成后由内联小脚本切回 `media="all"`），
  附 `<noscript>` 回退。效果：页面关键 CSS 只有十几 KB，字体声明异步加载，
  `font-display: swap` 兜底闪烁。
- 浏览器按 `unicode-range` 只下载实际用到的字体切片（站点全量woff2 ~11 MB，运行时仅取少数）。
- ⚠️ 已知 Astro 编译器坑：head 中「`.map()` 表达式 + 含表达式的 `<noscript>`」组合会把后续 JSX 表达式错编译成文本（症状：构建报 `tag is not defined`）。因此 head 内字体标签写成**静态标签**而非 map，改这里时留意。

## 7. 已知脆弱设计与技术债（改动前必读）

| 位置 | 问题 | 风险 |
|---|---|---|
| `src/pages/originals/**` + `src/content/config.ts` | `originals` 仍用旧版 content API（`type: 'content'`） | 与其余集合 API 不一致，新代码易混用两套 slug/render 语义 |
| `/originals/fragments/fragments` 等列表 URL | 目录名与页面名撞车，`mainlayout.astro` 靠 `pathSegments[1] === pathSegments[2]` 特判区分列表/详情 | 改路由或新增分类时极易漏改特判 |
| `src/utils/notesData.ts`（`getNoteViews` 的 key） | 笔记 key 已改成**文件路径哈希**（内容派生） | 增删笔记不会再让 `bodies.json` 与卡片错位；换 key 规则时记得同步 `bodies.json?v=N` 的缓存版本号 |
| `mainlayout.astro` frontmatter | 由 pathname 字符串匹配推导 ~15 个 body class | 新路由不挂类就没有对应页面作用域样式，需手动补 if 分支 |
| `src/styles/home.css` | 重复定义 `--font-serif/--font-sans` 等别名，与 `--t-*`/`--c-*` token 层并存 | 主题 token 双轨，见 THEME_GUIDE.md，待收敛 |
| `bodies.json`（`bodies.json.ts`） | `Cache-Control: max-age=300` 且文件名无哈希 | 部署后客户端可能拿到过期/缺失正文；可改内容哈希 + 长缓存 |
| `public/favicon/favicon.svg` | 本质是内嵌 base64 PNG 的“假 SVG”（103 KB，可接受但非矢量） | 想真正瘦身需重做矢量图标；`scripts/rebuild_favicon.py` 可从高清源重建全套图标 |

其他待办与排错记录见 [TODO.md](./TODO.md)。
