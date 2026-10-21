/*
  筛选切换过渡（同文档 View Transitions）

  标签/分类筛选目前都是同步改 `display`，浏览器会瞬时重排：
  旧结果"啪"地消失、新结果"啪"地出现。这里把一次 DOM 变更整体包进
  `document.startViewTransition`，由浏览器拍前后两张快照再交叉淡化。

  三个关键点：
  1. 只有结果区参与过渡：列表容器临时挂上 `filter-results`，
     刊头、标签栏、页脚等其余部分在过渡中直接切到新状态，看起来是静止的；
  2. 筛选控件（标签栏 / 侧栏）单独成层，点击高亮立即生效；
  3. 过渡靠 `html.is-filtering` 与页面跳转的 240ms 区分开，筛选只用约 180ms。

  不支持 View Transitions 或用户要求减少动效时，直接执行更新（等同原行为）。
*/

type ViewTransitionLike = {
  readonly finished: Promise<void>;
  skipTransition: () => void;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => ViewTransitionLike;
};

declare global {
  interface Window {
    /** 供 `is:inline` 页面脚本调用（inline 脚本无法 import 模块） */
    runFilterTransition?: (update: () => void) => void;
  }
}

/**
 * 过渡期间需要静止的筛选控件；同一页面只会命中一个：
 * - 摘录左栏：.excerpts-aside（短句 / 人物 / 文章）
 * - 摘录顶部：.filter-pills（对话）
 * - 原创左栏：.originals-aside
 */
const STATIC_CONTROLS_SELECTOR =
  ".excerpts-aside, .filter-pills, .originals-aside";
const STATIC_CONTROLS_NAME = "filter-controls";

/** 真正需要"动一下"的结果列表；按页面顺序取第一个命中的 */
const RESULTS_SELECTORS = [
  "#note-list",
  "#persons-grid",
  "#conversations-grid",
  ".systems-list",
  ".fragments-list",
  ".projects-list",
].join(",");
const RESULTS_NAME = "filter-results";

const FILTERING_CLASS = "is-filtering";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

let activeTransition: ViewTransitionLike | null = null;

export function runFilterTransition(update: () => void): void {
  const doc = document as ViewTransitionDocument;
  const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;

  if (typeof doc.startViewTransition !== "function" || reduced) {
    update();
    return;
  }

  // 快速连点标签：让上一轮直接收尾，避免多次快照互相打断导致闪烁
  activeTransition?.skipTransition();

  const controls = document.querySelector<HTMLElement>(
    STATIC_CONTROLS_SELECTOR,
  );
  const results = document.querySelector<HTMLElement>(RESULTS_SELECTORS);

  controls?.style.setProperty("view-transition-name", STATIC_CONTROLS_NAME);
  results?.style.setProperty("view-transition-name", RESULTS_NAME);

  const root = document.documentElement;
  root.classList.add(FILTERING_CLASS);

  const transition = doc.startViewTransition(update);
  activeTransition = transition;

  const cleanup = () => {
    // 已被下一轮接管时什么都别做，否则会把新一轮的标记清掉
    if (activeTransition !== transition) return;
    activeTransition = null;
    root.classList.remove(FILTERING_CLASS);
    controls?.style.removeProperty("view-transition-name");
    results?.style.removeProperty("view-transition-name");
  };

  void transition.finished.then(cleanup, cleanup);
}
