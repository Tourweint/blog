# 主题设计系统（Draft）

目标：把当前“各频道各一套 UI”统一成同一套母主题语言，让首页的“文人策展”成为全站基调，而不是单页特效。

## 1. 原则（必须遵守）

1. **基底统一，差异局部**：`body`、`.page-content`、默认链接/标题/分隔线只在 `src/styles/global.css` 定义；页面样式只能在页面根容器下做覆盖（例如 `.notes-page ...`），禁止在频道 CSS 里直接写 `body {}` 和 `.page-content {}`。
2. **去卡片化为默认**：默认用留白 + 分隔线；需要卡片的地方只用轻边框，不用厚阴影与大位移。
3. **排版是第一视觉**：标题/摘录优先衬线体，元信息（日期/标签）小号、加字距、弱化。
4. **交互克制**：hover 以 `opacity` / `underline` 为主，避免 `translateY` 到处飞。

## 2. 设计 Tokens（CSS 变量）

> 位置建议：统一放在 `src/styles/global.css` 的 `:root`，作为全站主题的唯一真源。

### 2.1 色彩（Paper & Ink）

- `--t-bg`: 页面背景（纸色）
- `--t-surface`: 内容承载面（浅底，可选）
- `--t-text`: 主文字（墨色）
- `--t-muted`: 次要文字（弱化灰）
- `--t-rule`: 分隔线（细灰）
- `--t-accent`: 强调色（链接/小标题点缀）

默认建议（与首页方案一对齐）：

- `--t-bg: #fbfbf9;`
- `--t-surface: #ffffff;`
- `--t-text: #1a1a1a;`
- `--t-muted: #86868b;`
- `--t-rule: rgba(0,0,0,0.10);`
- `--t-accent: #333333;`（更“文人”，不走科技蓝）

### 2.2 字体（Serif vs Sans）

- `--t-font-serif`: 标题/摘录
- `--t-font-sans`: 正文/UI

建议栈：

- `--t-font-serif: "Noto Serif SC", "Source Han Serif CN", "Songti SC", serif;`
- `--t-font-sans: "Inter", "Source Han Sans CN", system-ui, -apple-system, "Segoe UI", sans-serif;`

> 是否真正加载 Inter / Noto Serif SC：见本文第 6 节（性能策略）。

### 2.3 排版与尺寸

- `--t-leading: 1.75;`
- `--t-radius: 12px;`（需要卡片时用）
- `--t-shadow-sm: 0 2px 10px rgba(0,0,0,0.06);`（尽量少用）

### 2.4 动效

- `--t-ease: cubic-bezier(0.4, 0, 0.2, 1);`
- `--t-dur: 180ms;`

默认交互：

- hover：`opacity: 0.86` 或 `text-decoration: underline`

## 3. 旧变量到新变量的映射（兼容策略）

短期不推倒重来：先把旧变量“映射到 tokens”，逐页迁移。

建议在 `:root` 内临时保留：

- `--bg-body` → `var(--t-bg)`
- `--bg-card` → `var(--t-surface)`
- notes：`--notes-bg` → `var(--t-bg)`（逐步删除 notes 私有 tokens）
- conversations：`--color-bg` / `--color-text` / `--color-border` → 对齐到 `--t-*`

## 4. 全站基础样式（Global Base）应包含什么

放在 `src/styles/global.css`：

- `body { background: var(--t-bg); color: var(--t-text); font-family: var(--t-font-sans); line-height: var(--t-leading); }`
- 链接默认：`a { color: inherit; text-decoration-thickness: ... }` + hover underline
- `.page-content` 的统一 padding / 宽度策略（必要时用 `.container` 类）
- 分隔线统一：`hr`、`.rule`

## 5. 页面/频道样式改造路线

1. **先拆掉 body/page-content 的多处覆盖**（notes/posts 影响最大）
2. **统一导航与页脚的背景/边框/字体**（让“母语法”固定）
3. **统一列表页（originals、excerpts）** → 再统一详情页

## 6. 字体资源与性能策略（建议）

两种方案：

- A：先不引入外部字体，只用 fallback（最快、最稳）
- B：引入 Google Fonts / 字体 CDN（提升气质，但要做预连接与加载策略，控制 CLS）

如果选 B：

- 在 `src/layouts/mainlayout.astro` 的 `<head>` 添加 `preconnect` 与字体 `link`
- 优先 `display=swap`
- 用 `font-weight` 数量最少的子集

## 7. 验收标准（改造完成后应当满足）

- 首页/原创/摘录/关于切换时：背景色、字体气质、链接反馈一致
- 任意页面不再出现 `body { padding: ... }` 的“自行接管”
- 卡片阴影/位移被限制在少数需要强调的模块
- `npm run build` 通过
