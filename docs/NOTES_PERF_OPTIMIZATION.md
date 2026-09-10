# 笔记页 dev 性能优化记录（思路与关键细节）

> 目标：解决 `npm run dev` 下「摘录 · 短句」页（`/excerpts/notes`）及其月份归档页明显卡顿的问题。
> 原则：**先量化、再假设、用最小实验证伪，最后才改代码**，不靠感觉下结论。

---

## 1. 现象与基线（先测量，不猜）

内容规模：5 个集合共 598 篇 Markdown，其中 notes 142 篇（约 250KB）、posts 440 篇。

用 `Measure-Command`/`Stopwatch` 对同一个 dev server 反复请求取「热耗时」：

| 路由 | 改前热耗时 | HTML 大小 |
|---|---|---|
| `/excerpts/notes`（142 条全渲染） | ~1100ms | 910KB |
| `/excerpts/notes/2026/01`（62 条） | 625–928ms | 539KB |
| 其它列表页（posts/home 等） | 200–400ms | 240–280KB |

结论：**全站共有 ~200–400ms 是 Vite dev SSR 的固有底线，真正的异常只在「一次性渲染上百张卡片」的笔记页。**

---

## 2. 诊断过程：两个被实验推翻的假设

### 假设 A：「对 142 篇逐个 `render()` 编译 Markdown 是瓶颈」
初版按这个思路改成「服务端不 render、客户端 marked 按需渲染」，结果耗时几乎没降（1043ms）。
→ **假设被推翻**：Markdown 编译不是主因。

### 关键发现：dev 会给每个元素注入源码定位属性
检查返回 HTML，发现**每个 DOM 元素**都带：
```
data-astro-source-file="...index.astro" data-astro-source-loc="160:12"
```
这是 Astro **dev 专属**（生产构建不输出）。一张卡片 ~10 个元素，142 张就是 1400+ 个被注解节点 —— 元素越多越慢、HTML 越大。

### 最小对照实验：把服务端卡片从 142 砍到 18
临时 `.slice(0,18)` 后：~1043ms → **~415ms**，890KB → 340KB。
→ **真因确认：服务端渲染的 DOM 元素数量是主因。**

### 次因：响应体积
再把内联数据里的正文（206KB）临时置空：又快约 150–200ms。
→ 响应体积是次要因素，需要一并压缩。

---

## 3. 最终方案（三层拆分）

核心一句话：**服务端只做首屏，客户端补齐列表，正文延迟到「展开」那一刻。**

1. **服务端只 SSR 首屏 18 张卡片「外壳」**（标题/摘要/标签/日期，本就来自 frontmatter，无需编译正文）。
2. **其余 124 张由客户端按 JSON 元数据补建**。浏览器用模板字符串建 124 个简单节点只需几毫秒，且**客户端创建的节点没有 dev source-loc 注解开销**。标签筛选 / 随机 / 加载更多依赖「全量卡片在 DOM 里」，因此在脚本初始化时一次性补齐，交互逻辑完全不变。
3. **正文从页面里剥离**，改为独立端点 `/excerpts/notes/bodies.json`：
   - 页面只内联「元数据」（小）；
   - 浏览器空闲时预取一次正文并缓存；
   - 用户首次点「展开」时才用 `marked` 把该条 Markdown 编译成 HTML。

### 数据流
```
getNoteViews()（utils/notesData.ts，按日期倒序、统一视图模型）
        │
        ├─ 页面 index.astro：前 18 条 → SSR 卡片；全部 142 条「元数据」→ JSON island
        └─ bodies.json.ts：全部「key→正文原文」→ 静态 JSON（dev 按需 / build 出文件）

客户端 noteBody.ts：fetch bodies（单例 Promise）→ marked 编译 → 注入 .note-body
```

---

## 4. 关键实现细节（容易踩坑的点）

- **用「全局排序索引」做 key**：`key = String(index)`，元数据 island 与 bodies.json 用同一套 key，一一对应（已校验 142/142、无缺失）。
- **年/月分组续接**：客户端补建尾部卡片时，用第 17 条（最后一条 SSR）的 year/month 作为 seed，遇到相同年月就**不重复输出月份头**，跨年/跨月才补 header，保证与服务端拼接后顺序、分组都正确。
- **JSON island 安全**：`<script type="application/json" set:html=...>` 需加 `is:inline`（否则 Astro 会把它当待处理脚本而告警），并把所有 `<` 转义为 `\u003c`，防止正文里出现 `</script>` 破坏页面。
- **marked 输出与原 remark 对齐**：
  - `marked.setOptions({ gfm: true })`，支持笔记里实际用到的加粗/列表/标题/引用/链接/行内代码（事先扫描过 142 篇用到的语法集合）；
  - 编译后遍历 `a[href^="http"]` 补 `target="_blank" rel="noopener noreferrer"`，等价于 `rehype-external-links` 的效果；
  - 卡片标题/摘要等用 `esc()` 做 HTML 转义再拼模板，避免注入。
- **幂等**：`renderNoteBody` 用 `data-rendered` 防重复编译；`bindNoteToggles` 用 `data-bound` 防重复绑定；正文请求用单个 Promise 复用。
- **抽共享模块**：列表页和月份页的展开逻辑统一放到 `src/scripts/noteBody.ts`，数据整形统一放到 `src/utils/notesData.ts`，避免两份实现漂移。
- **修掉一个潜在 bug —— 重复路由导致 dev/构建不一致**：
  - 原本 `[year]/[month].astro` 与 `[year]/[month]/index.astro` 映射到同一路径；
  - 实测 **dev 服务旧版、生产 build 却用新版**；
  - 删除遗留的 `[month].astro`，让 dev 与生产统一到带「前后月导航」的 `[month]/index.astro`。

---

## 5. 为什么没有去改 posts 列表/详情页

- posts 列表已分页到每页 8 张，本就在 Vite ~200ms 底线上；
- 侧边栏「每标签 filter 全部文章」看似 O(标签×文章)，实测只有 **14 个标签、6160 次**亚毫秒迭代，无优化价值；
- 详情页 `getStaticPaths` 的全量遍历是计算「上一篇/下一篇」所必需，props 传 entry 在 dev 内是内存引用，改动无实际收益反而增风险。
- 结论：**测量证明没有收益的地方不动**，控制改动面。

---

## 6. 结果（同一 dev server 热耗时）

| 路由 | 改前 | 改后 | 生产 HTML |
|---|---|---|---|
| `/excerpts/notes` | ~1100ms / 910KB | **~295ms / 406KB** | 91KB |
| `2026/01`（62 条） | 625–928ms | **~315ms** | 165→63KB |
| `2026/02`（59 条） | ~560ms | **~290ms** | 125→52KB |

笔记页提速约 70%+，所有页面回到同一耗时区间。生产构建后：笔记页 91KB、月份页体积平均降约 60%，正文独立为 201KB 的 `bodies.json`，marked 打包成约 43.6KB、仅笔记相关页面加载的共享包。

---

## 7. 验证方式

- `astro check`：0 error / 0 warning / 0 hint；`npm run build:quiet` 构建通过。
- 真实浏览器：142 张卡片补建、首屏仅 18 张可见、分组头数量正确、展开渲染段落/加粗/列表/外链、收起、随机、加载更多（18→36）、标签跨全量筛选均正常，控制台无报错。
- 数据一致性：元数据 island 与 bodies.json 的 key 完全对齐。

## 8. 权衡与注意

- 笔记流的卡片主体依赖少量 JS 构建（该页本来就强依赖 JS：筛选/展开/随机/加载更多）；首屏 18 张仍由服务端渲染，保证首屏内容与基础 SEO，月份归档页同样保留服务端外壳。
- 新增运行时依赖 `marked`（零依赖、成熟），已写入 `dependencies`，换机需 `npm install`。
- dev 的 source-loc 注解是「元素越多越慢」的根因，这条经验对其它「一次渲染大量重复节点」的页面同样适用：**dev 卡顿时优先减少服务端节点数，而不是先怀疑数据量或 Markdown**。
