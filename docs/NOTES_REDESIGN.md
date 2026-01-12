# Notes 页面 Redesign 设计文档

## 1. 设计目标

### 核心定位
- **流式思考主题**：思维流动、碎片化学习的感觉
- **简约美学**：Apple 与 Notion 结合的极简风格
- **沉浸阅读**：适合快速浏览和深度阅读

### 设计关键词
- 轻盈 (Lightweight)
- 透气 (Airiness)
- 聚焦 (Focus)
- 流动 (Flow)

---

## 2. 视觉设计

### 2.1 配色方案

#### 主色调
```css
:root {
  /* 背景色 - 柔和的灰白，不刺眼 */
  --notes-bg: #fafafa;

  /* 卡片背景 - 纯白，干净 */
  --notes-card: #ffffff;

  /* 主文字 - 深灰，降低对比度 */
  --notes-text: #1d1d1f;

  /* 次要文字 - 柔和灰 */
  --notes-muted: #86868b;

  /* 强调色 - 保持蓝色系，但更克制 */
  --notes-accent: #0066cc;

  /* 边框 - 极淡 */
  --notes-border: rgba(0, 0, 0, 0.06);
}
```

#### 标签颜色 (mood 字段)
```css
.mood-blue    { color: #0066cc; }
.mood-green   { color: #34c759; }
.mood-orange  { color: #ff9500; }
.mood-red     { color: #ff3b30; }
.mood-purple  { color: #af52de; }
.mood-gray    { color: #86868b; }
```

### 2.2 排版

#### 字体
- 中文：`-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif`
- 英文：`-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`

#### 字号层级
```css
.hero h1           { font-size: 2rem; letter-spacing: -0.02em; }
.note-title        { font-size: 1.125rem; font-weight: 600; }
.note-hook         { font-size: 1rem; line-height: 1.7; }
.filter-label      { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
.tag-pill          { font-size: 0.75rem; }
```

### 2.3 间距与留白

```css
.notes-shell {
  gap: 24px;  /* 减少间距，更紧凑 */
}

.note-card {
  padding: 20px 24px;  /* 更多内边距 */
  border-radius: 12px; /* 更柔和的圆角 */
}

.note-card + .note-card {
  margin-top: 12px;  /* 卡片间距更小 */
}
```

---

## 3. 组件设计

### 3.1 Hero 区域

```
布局：左对齐，简洁
内容：
  - Eyebrow: "NOTES" (小字，灰色)
  - 标题: "留住短句的力度"
  - 副标题: 移除或简化

按钮：改为更简洁的 icon button
  - 随机图标 (🎲)
  - 去掉渐变背景，使用 outline 样式
```

### 3.2 筛选面板 (Filters Panel)

**Notion 风格**：
- 移除 sticky 定位，跟随内容流动
- 改为横向标签栏形式
- 简化视觉层级

```html
<div class="filter-bar">
  <span class="filter-label">标签</span>
  <div class="filter-chips">
    <button class="chip">全部</button>
    <button class="chip">哲学</button>
    <button class="chip">成长</button>
  </div>
</div>
```

**样式变化**：
```css
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--notes-border);
}

.chip {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  background: transparent;
  color: var(--notes-muted);
}

.chip.active {
  background: rgba(0, 102, 204, 0.1);
  color: var(--notes-accent);
}
```

### 3.3 笔记卡片 (Note Card)

**Apple 风格卡片**：

```css
.note-card {
  background: var(--notes-card);
  border: 1px solid var(--notes-border);
  border-radius: 12px;
  padding: 20px 24px;
  /* 移除左侧彩色边框 */
  /* 移除装饰性渐变 */
  transition: all 0.2s ease;
}

.note-card:hover {
  border-color: rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
```

**元信息区域**：
```css
.note-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: var(--notes-muted);
}

.note-source {
  font-weight: 500;
  color: var(--notes-accent);
}
```

**标题**：
```css
.note-title {
  margin: 8px 0 12px;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--notes-text);
}
```

**摘要 (hook)**：
```css
.note-hook {
  color: var(--notes-text);
  line-height: 1.7;
  /* 移除截断和渐变效果 */
}
```

**标签行**：
```css
.tag-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag-pill {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f5f5f7;
  color: var(--notes-muted);
}
```

### 3.4 展开/收起按钮

**极简风格**：
```css
.toggle-body {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8125rem;
  color: var(--notes-accent);
  background: transparent;
  border: none;
}

.toggle-body:hover {
  background: rgba(0, 102, 204, 0.1);
}
```

---

## 4. 布局结构

### 4.1 整体布局

```
┌─────────────────────────────────────────┐
│ Hero 区域                                │
├─────────────────────────────────────────┤
│ 筛选栏 (横向标签)                        │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │           笔记卡片流                 │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 卡片 1                      │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 卡片 2                      │    │ │
│ │  └─────────────────────────────┘    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 加载更多按钮                            │
└─────────────────────────────────────────┘
```

### 4.2 响应式断点

```css
/* 平板及以下 - 单列布局 */
@media (max-width: 768px) {
  .notes-shell {
    display: block;
  }

  .filter-bar {
    overflow-x: auto;
    padding-bottom: 16px;
  }
}
```

---

## 5. 交互动效

### 5.1 过渡效果

```css
.note-card {
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.chip {
  transition: all 0.15s ease;
}
```

### 5.2 展开动画

```css
.note-body {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 6. 改动清单

### 文件修改
1. `src/styles/notes.css` - 完全重写样式
2. `src/pages/notes.astro` - 调整 HTML 结构

### 样式变更
- [ ] 配色方案更新
- [ ] 卡片样式简化
- [ ] 筛选组件改为横向标签栏
- [ ] Hero 区域精简
- [ ] 按钮样式改为极简风格
- [ ] 响应式适配优化

### 功能变更
- [ ] 移除 sticky 筛选面板
- [ ] 简化展开/收起按钮
- [ ] 优化随机一条按钮

---

## 7. 视觉参考

### Apple 风格特点
- SF Pro 字体
- 大量留白
- 微妙的圆角 (8-12px)
- 克制使用颜色

### Notion 风格特点
- 纯白背景
- 清晰的层次结构
- 简洁的标签系统
- 卡片式布局

---

## 8. 实施优先级

### P0 - 核心体验
1. 配色更新
2. 卡片样式重设计
3. 筛选组件简化

### P1 - 交互优化
1. 展开动画
2. 响应式适配

### P2 - 细节打磨
1. Hover 效果
2. 过渡动画
3. 图标优化

---

## 9. 预期效果

### Before
- 色彩丰富但略显杂乱
- 左侧固定筛选面板占用空间
- 卡片装饰元素过多

### After
- 轻盈、通透的阅读体验
- 内容聚焦，干扰减少
- 符合 Apple/Notion 的极简美学
