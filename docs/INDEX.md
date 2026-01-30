方案一（**文人策展风格**）的核心在于通过**不对称布局**和**极致的排版对比**，将你的主页从“内容堆砌”变为“内容呈现”。

以下是为你设计的完整方案，包含视觉规范和代码实现。

---

### 一、 视觉设计规范

1. **色彩 (Palette):**
* 背景：`#FBFBF9` (带有纸质感的米白)
* 正文：`#1A1A1A` (深灰，比纯黑更有质感)
* 辅助色：`#888888` (用于日期、标签等次要信息)


2. **字体 (Typography):**
* 标题/摘录：衬线体（如：思源宋体、Noto Serif SC）。
* 正文/UI：非衬线体（如：Inter、思源黑体）。


3. **核心逻辑：**
* **首屏 (Hero):** 放弃居中，采用左对齐或错位对齐。
* **原创区 (Featured):** 第一篇作为“封面文章”占据大面积，另外两篇作为附属列表。
* **摘录区 (Margin Notes):** 模仿书籍页边笔记，轻盈、留白多。



---

### 二、 关键代码实现

你可以直接修改或替换你现有的 `home.css` 和 `.astro` 文件中的结构。

#### 1. CSS 变量与基础设置 (home.css)

```css
:root {
  --bg-color: #fbfbf9;
  --text-main: #1a1a1a;
  --text-muted: #86868b;
  --accent: #333;
  --font-serif: "Noto Serif SC", "Source Han Serif CN", serif;
  --font-sans: "Inter", "Source Han Sans CN", sans-serif;
}

body {
  background-color: var(--bg-color);
  color: var(--text-main);
  font-family: var(--font-sans);
}

/* 建立一个 12 列响应式网格系统 */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

```

#### 2. 重新编排的 Hero 区 (Astro)

将文字进行物理上的“错位”，制造视觉上的设计感。

```html
<section class="hero grid-layout">
  <div class="hero-content">
    <span class="hero-eyebrow">Tourweint / 多鸣</span>
    <h1 class="hero-title">
      思考、摘录、写作<br />
      <span class="indent-text">在这里交织成网</span>
    </h1>
    <p class="hero-sub">
      记录对世界的理解，以及思考的过程。<br/>
      每一篇文章，都是我在认真打磨的作品。
    </p>
  </div>
</section>

<style>
.hero { padding: 12vh 0 8vh; }
.hero-content { grid-column: 1 / span 8; } /* 占据左侧 8 列，右侧留白 */
.hero-eyebrow { font-size: 0.9rem; letter-spacing: 0.2em; color: var(--text-muted); text-transform: uppercase; }
.hero-title { 
  font-family: var(--font-serif); 
  font-size: clamp(2.5rem, 5vw, 4rem); 
  margin: 1.5rem 0; 
  line-height: 1.1; 
}
.indent-text { margin-left: 2rem; color: var(--text-muted); }
.hero-sub { font-size: 1.1rem; line-height: 1.6; max-width: 400px; }
</style>

```

#### 3. 原创文章：封面文章模式

利用 `index` 判断，给第一篇文章特殊的样式。

```html
<section class="originals-section grid-layout">
  <div class="section-header">
    <h2>最新原创</h2>
    <a href="/originals" class="more">Archive →</a>
  </div>

  <div class="originals-grid">
    {recentOriginals.map((post, index) => (
      <a href={`/originals/${post.slug}`} class={index === 0 ? "featured-card" : "standard-card"}>
        <div class="card-meta">{formatDate(post.data.pubDate)}</div>
        <h3 class="card-title">{post.data.title}</h3>
        {index === 0 && <p class="card-desc">{post.data.description}</p>}
        <div class="card-tags">
          {post.data.tags?.slice(0, 2).map(tag => <span>#{tag}</span>)}
        </div>
      </a>
    ))}
  </div>
</section>

<style>
.originals-section { margin-top: 4rem; }
.section-header { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
.originals-grid { 
  grid-column: 1 / -1; 
  display: grid; 
  grid-template-columns: 1.5fr 1fr; /* 左大右小布局 */
  gap: 4rem; 
}

/* 重点：第一篇文章占据左侧大空间 */
.featured-card { grid-row: span 2; display: flex; flex-direction: column; justify-content: center; }
.featured-card .card-title { font-family: var(--font-serif); font-size: 2.2rem; margin: 1rem 0; }
.standard-card { border-bottom: 1px solid #f0f0f0; padding: 1.5rem 0; }
.standard-card .card-title { font-size: 1.2rem; }
</style>

```

#### 4. 摘录区：碎片感布局 (Fragments)

不要用死板的格子，用 `column-count` 或者错开的 `flex`。

```html
<section class="excerpts-section">
  <div class="grid-layout">
     <div class="section-header"><h2>精选摘录</h2></div>
  </div>
  
  <div class="excerpt-waterfall">
    {recentExcerpts.map(post => (
      <article class="excerpt-item">
        <p class="excerpt-text">“{pickExcerptText(post)}”</p>
        <cite>— {pickExcerptSource(post)}</cite>
      </article>
    ))}
  </div>
</section>

<style>
.excerpt-waterfall {
  column-count: 2; /* 瀑布流布局 */
  column-gap: 4rem;
  max-width: 1000px;
  margin: 4rem auto;
  padding: 0 1.5rem;
}
.excerpt-item {
  break-inside: avoid;
  margin-bottom: 4rem;
  padding: 1rem;
}
.excerpt-text {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  line-height: 1.8;
  margin-bottom: 1rem;
  position: relative;
}
/* 给摘录加一个装饰性的引号 */
.excerpt-text::before {
  content: "「";
  position: absolute;
  left: -1.5rem;
  color: #ddd;
}
cite { font-style: normal; color: var(--text-muted); font-size: 0.9rem; }
</style>

```

---

### 三、 为什么这样更有“设计感”？

1. **打破对称：** 传统的 3 栏/4 栏布局太像 Bootstrap 时代的模板。通过 `1.5fr 1fr` 的不对称比例，视觉重心会先落在你的“封面文章”上，更有叙事感。
2. **增加留白：** 所有的文字不再挤在一起。Hero 区右侧的空白、瀑布流之间的间距，都是为了让读者的眼睛“呼吸”。
3. **字体对比：** 标题使用大号衬线体，仿佛书刊标题；日期和标签使用极细的小号非衬线体。这种**尺寸和风格的极端对比**是高级感的来源。
4. **去卡片化：** 减少生硬的边框和背景色，改用下划线或留白来区分区域。这样页面会显得更像一张平铺的纸，而不是一堆塑料卡片。

### 四、 下一步建议

* **图像点缀：** 如果原创文章有配图，可以将配图作为 `featured-card` 的背景，蒙上一层淡淡的灰色滤镜。
* **平滑过渡：** 在 CSS 中给 `a` 标签添加 `transition: opacity 0.3s ease;`，鼠标悬停时轻微改变文字透明度，这种反馈比变色更优雅。