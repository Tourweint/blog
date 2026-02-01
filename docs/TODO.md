# 开发 TODO（按当前项目状态）

> 使用建议：
>
> - 从 P0 开始推进。
> - 完成项打勾（`[x]`）。
> - 不确定的先放到 P2。

## P0（影响发布）

- [x] **统一摘录入口链接**：所有摘录列表/详情及返回链接均通过 `src/utils/excerptsPaths.ts` 生成，无旧路径残留。
- [x] **归档入口检查**：当前无 `/archive` 路由或导航入口；首页 "Archive →" 链接指向 `/originals`，无需额外归档页。
- [x] **站点域名配置单一真源**：`mainlayout.astro` 使用 `Astro.site` 作为域名来源，避免与 `astro.config.mjs` 中的 `site` 重复硬编码。
- [x] **构建验证**：`npm run build` 全量校验通过（含 frontmatter 与路由），无错误，仅有少量预期警告。

## P1（体验与维护）

- [x] **主页/摘录页 Meta 统一**：统一摘录文章、短句、人物、对话频道头部 meta 行的字号、间距与分隔符/链接样式。
- [x] **人物/对话/短句列表交互统一**：统一三频道筛选区域的容器 padding/圆角/背景，以及标签按钮的尺寸、字号、hover/active/focus 状态。
- [x] **摘录短句月度页**：为月度详情页增加“上一月份/下一月份”导航，并保留返回月份列表与短句首页入口。
- [x] **组件链接复查**：PersonCard/ConversationCard 及摘录入口 PageEntry 已统一通过 `src/utils/excerptsPaths.ts` 生成链接，无直接硬编码 `/excerpts/*` 路径。
- [x] **导航当前态高亮**：在 MainLayout 中基于 `Astro.url.pathname` 为桌面与移动端导航链接增加 active class，并以下划线与品牌色做克制高亮。
- [x] **设计 Token 收敛**：将全局导航/页脚与多个共享组件（PersonCard/ConversationCard/Pagination 等）的灰阶颜色与分隔线收敛到 `--t-*` / `--c-*` 及基于 tokens 的 `color-mix` 表达式。

## P2（增强项）

- [ ] **RSS 订阅**（摘录与原创分流）。
- [ ] **全站搜索**（可先覆盖 excerpts/posts）。
- [ ] **暗色模式**（确保 tokens 完整）。
- [ ] **代码块复制按钮** 与 **高亮主题**。
- [ ] **图片懒加载**（内容卡片与详情页）。
- [ ] **写作规范简表**（标题/摘要/标签长度约束）。
- [ ] **可访问性增强**：增加“跳到正文”链接、统一 `:focus-visible` 焦点样式，完善移动端抽屉导航的键盘体验。

## 记录区

- 问题：
  - 现象：
  - 复现步骤：
  - 期望结果：
  - 实际结果：
  - 备注：
