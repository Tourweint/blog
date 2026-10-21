# 主题使用指南（tokens + 作用域化）

这份指南用于统一全站视觉语言，并降低 CSS 污染风险。

## 1. 设计原则

- **tokens 优先**：颜色/阴影/圆角/动效尽量来自 `--t-*` 与 `--c-*`。
- **作用域化优先**：频道/页面样式必须写在 `body.page-xxx ...` 下，避免跨页污染。
- **组件带主题**：复用组件（卡片/分页/目录/入口卡片）自身具备一致的默认观感，页面 CSS 只负责布局与少量差异化。
- **渐进迁移**：不要一次性全站重写；每改一块用 `npm run build` 做护栏。

补充（母主题系统要点）：

- **基底统一，差异局部**：全局基础样式只在 `src/styles/global.css` 定义；频道样式只在各自 `body.page-xxx` 范围覆盖。
- **默认去卡片化**：辅助区块（元信息、导航、侧栏分区、标签等）优先留白 + 文字灰度，不用白卡/阴影/圆角；卡片只留给真正需要强调或承载操作的面板，且避免厚阴影/大位移。
- **分隔线层级（避免满屏横线）**：一页之内水平线只分三级，宁少勿多——
  1. **版头线**：仅标题区与正文之间可保留一条通栏淡线，颜色 `var(--t-rule)`（约 rgba(0,0,0,.1)），1px；
  2. **章节短横线**：大区块边界（正文收束、页脚、并列条目之间）用居中短横线：48px / 1px / `rgba(0,0,0,.15)`（条目之间可用 32px），上下留约 2rem 白；正文 Markdown 的 `hr` 同语言（60px 居中）；
  3. **章节内部无线**：H2/H3、提问标签等靠字重、字号、间距分章，不加通栏下划线。
  - 禁止 2px 粗通栏线、禁止给每个区块上下都封线（线多即显锋利）。
- **色彩克制**：强调色统一用 `--t-link`（靛青）；不使用暖棕/米色等频道私有色；灰色层次走 `--t-muted` 与 `rgba(0,0,0,.1~.15)`，不要硬编码灰阶。
- **排版优先**：标题/摘录更适合衬线体，元信息小号、加字距、弱化。
- **交互克制**：hover 以 `opacity` / `underline` / 颜色变化为主，避免位移、放大、发光等过度动效。

## 2. Tokens 速查

tokens 定义位置：

- `src/styles/global.css`

### Theme tokens（全站母语）

- `--t-bg`：页面背景
- `--t-surface`：卡片/面板背景
- `--t-text`：正文
- `--t-muted`：弱化文字
- `--t-rule`：分隔线/边框
- `--t-accent`：强调色
- `--t-font-sans` / `--t-font-serif`：字体栈
- `--t-radius`：圆角
- `--t-shadow-sm`：基础阴影
- `--t-ease` / `--t-dur`：动效曲线与时长

### Component tokens（组件语义）

- `--c-bg` / `--c-surface` / `--c-text` / `--c-muted` / `--c-rule`
- `--c-accent` / `--c-radius` / `--c-shadow` / `--c-shadow-hover`
- `--c-focus`：焦点可见样式

推荐用法：

- 文本弱化：`color: var(--c-muted)`
- 卡片（仅限需要强调/承载操作的面板，默认不用）：`background: var(--c-surface); border: 1px solid var(--c-rule); box-shadow: var(--c-shadow)`
- hover：`box-shadow: var(--c-shadow-hover)`（仅卡片；普通链接用下划线/变色）
- 分隔：版头用 1px `var(--c-rule)` 通栏淡线；区块边界用居中短横线 `48px × 1px rgba(0,0,0,.15)`；章节内部不加线（见第 1 节）
- focus：`outline/box-shadow` 使用 `var(--c-focus)`

补充：尽量避免在频道 CSS 里直接写 `body {}` 和 `.page-content {}`。如需调整版心宽度或 padding，优先通过页面容器或公共类完成。

## 3. 页面作用域（page-\* 约定）

页面作用域由 `src/layouts/mainlayout.astro` 根据 URL 注入 `<body class="...">`：

- 全局：`site-body`
- 首页：`page-home`
- 原创：`page-originals`（列表）/ `page-originals-detail`（详情）
- 摘录：`page-excerpts`（总体系）
  - 根页：`page-excerpts-index`
  - 列表/分类：`page-excerpts-posts`
  - 短句：`page-excerpts-notes`
  - 人物：`page-excerpts-persons`
  - 对话：`page-excerpts-conversations`

写 CSS 时必须以 `body.page-xxx` 开头，例如：

- `body.page-excerpts-posts .excerpts-posts__header { ... }`

## 4. 频道页头（策展 header）推荐结构

频道页建议统一为：

- `eyebrow`：频道名（如“摘录”“原创”）
- `h1`：页面主题（如“按主题阅读”“人物”“对话”）
- `sub`：一句解释
- `meta`：可选的面包屑/跳转

样式参考：

- `src/styles/index.css`（摘录 posts/category 列表页）
- `src/styles/excerpts.css`（摘录根页）

## 5. 字体与性能策略

默认策略：**不主动加载外链字体**，使用系统/本地字体栈（更快、更少 CLS）。

如需更强一致性（例如跨设备统一 Inter / Noto Serif SC）：

- 优先自托管字体文件或使用 `@fontsource/*`
- 控制字体文件体积、并配置预加载/`font-display: swap`

## 6. 常见操作清单

- 新增频道/页面：
  - 先在 `mainlayout.astro` 增加合适的 `page-*` body class
  - CSS 新增/修改时只在 `body.page-xxx` 下写规则
  - 最后跑一次 `npm run build`

- 收敛硬编码颜色：
  `rgba(...)` / `#xxxxxx` 优先改为 `var(--c-muted)` / `var(--c-rule)` / `color-mix(...)`

- 加区块前先想“分隔从哪来”：
  先数当前页已有几条水平线；能用留白/字重/文字灰度解决就不加线；必须分隔时按第 1 节的三级层级选用，避免给区块上下同时封通栏线。
