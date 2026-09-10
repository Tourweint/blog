import { marked } from "marked";

// 笔记正文的客户端按需渲染：正文不在服务端编译，首次展开时拉取 bodies.json，
// 用 marked 编译为 HTML。笔记列表页与月份归档页共用此模块。

marked.setOptions({ gfm: true });

const BODIES_URL = "/excerpts/notes/bodies.json";
let bodiesPromise: Promise<Record<string, string>> | null = null;

/** 拉取全部笔记正文（只拉一次，复用同一 Promise） */
export function loadNoteBodies() {
  return (bodiesPromise ??= fetch(BODIES_URL)
    .then((r) => r.json())
    .catch(() => ({})));
}

/** 把某条笔记的 Markdown 正文渲染进指定容器（只渲染一次） */
export function renderNoteBody(bodyEl: HTMLElement, key: string) {
  if (bodyEl.dataset.rendered === "1") return;
  bodyEl.dataset.rendered = "loading";
  loadNoteBodies().then((bodies) => {
    bodyEl.innerHTML = marked.parse(bodies[key] ?? "", {
      async: false,
    }) as string;
    // 与 rehype-external-links 保持一致：外链新窗口打开
    bodyEl.querySelectorAll('a[href^="http"]').forEach((a) => {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });
    bodyEl.dataset.rendered = "1";
  });
}

/** 展开/收起一张笔记卡片 */
export function setCardOpen(card: HTMLElement, open: boolean) {
  const body = card.querySelector<HTMLElement>(".note-body");
  const toggle = card.querySelector<HTMLElement>(".toggle-body");

  if (open) {
    card.setAttribute("data-state", "open");
    card.classList.add("expanded");
    if (body) {
      renderNoteBody(body, card.dataset.noteKey || "");
      body.removeAttribute("hidden");
    }
    if (toggle) {
      toggle.textContent = toggle.dataset.labelClose || "收起";
      toggle.setAttribute("aria-expanded", "true");
    }
  } else {
    card.setAttribute("data-state", "closed");
    card.classList.remove("expanded");
    body?.setAttribute("hidden", "true");
    if (toggle) {
      toggle.textContent = toggle.dataset.labelOpen || "展开";
      toggle.setAttribute("aria-expanded", "false");
    }
  }
}

/** 为容器内所有“展开/收起”按钮绑定事件（幂等） */
export function bindNoteToggles(root: ParentNode = document) {
  root
    .querySelectorAll<HTMLElement>(".note-card .toggle-body")
    .forEach((btn) => {
      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        const card = btn.closest<HTMLElement>(".note-card");
        if (!card) return;
        setCardOpen(card, card.getAttribute("data-state") !== "open");
      });
    });
}

/** 浏览器空闲时预取正文，让首次展开更顺滑 */
export function prefetchBodiesWhenIdle() {
  const idle =
    "requestIdleCallback" in window
      ? (cb: () => void) => window.requestIdleCallback(() => cb())
      : (cb: () => void) => window.setTimeout(cb, 400);
  idle(() => {
    void loadNoteBodies();
  });
}
