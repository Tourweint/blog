/*
  短句频道的客户端行为（列表页 / 分页页 / 标签页共用）

  三件事：
  1. 卡片展开 / 收起（复用 noteBody 的懒加载正文）
  2. 左栏标签：搜索 + 收起展开（标签本身是链接，筛选语义交给 URL）
  3. 「随机一条」：从当前作用域（全部 / 某个标签）的全量短句里随机抽一条，
     命中本页就原地展开高亮，命中别的页就跳到那一页并用锚点定位。
*/

import {
  bindNoteToggles,
  prefetchBodiesWhenIdle,
  setCardOpen,
} from "./noteBody";

type RandomIndex = {
  /** 作用域内每一页的 URL，下标 0 对应第 1 页 */
  urls: string[];
  /** 每条短句：[key, 所在页码] */
  items: [string, number][];
};

/** 左栏默认露出的标签数量，其余靠「全部 N 个标签」和搜索 */
const COLLAPSED_TAGS = 12;

const readRandomIndex = (): RandomIndex | null => {
  const el = document.getElementById("notes-random-index");
  if (!el) return null;
  try {
    const parsed = JSON.parse(el.textContent || "{}") as Partial<RandomIndex>;
    if (!Array.isArray(parsed.urls) || !Array.isArray(parsed.items)) return null;
    return { urls: parsed.urls, items: parsed.items };
  } catch {
    return null;
  }
};

const flashCard = (card: HTMLElement) => {
  card.classList.add("flash");
  window.setTimeout(() => card.classList.remove("flash"), 1200);
};

const focusCard = (card: HTMLElement) => {
  setCardOpen(card, true);
  flashCard(card);
  card.scrollIntoView({ behavior: "smooth", block: "center" });
};

/** 从 URL 锚点定位到某条短句：跨页跳转过来时自动展开 + 高亮 + 滚动 */
const locateFromHash = () => {
  const hash = window.location.hash;
  if (!hash.startsWith("#note-")) return;

  let key = hash.slice("#note-".length);
  try {
    key = decodeURIComponent(key);
  } catch {
    // 锚点不是合法编码就按原样处理
  }

  const card = document.getElementById(`note-${key}`);
  if (!card) return;

  focusCard(card);
  // 正文是懒加载的，展开后高度还会变，再补一次定位
  window.setTimeout(() => {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 320);
};

/** 左栏标签：搜索过滤 + 展开/收起 */
const setupAside = () => {
  const items = Array.from(
    document.querySelectorAll<HTMLElement>(".aside-item[data-tag]"),
  );
  if (!items.length) return;

  const search = document.querySelector<HTMLInputElement>("[data-aside-search]");
  const moreBtn = document.querySelector<HTMLButtonElement>("[data-aside-more]");
  const moreLabel = document.querySelector<HTMLElement>("[data-aside-more-label]");

  let expanded = false;
  let query = "";

  const update = () => {
    const keyword = query.trim().toLowerCase();

    items.forEach((item, index) => {
      const label = (item.dataset.tag || "").toLowerCase();
      const matched = !keyword || label.includes(keyword);
      const isActive = item.classList.contains("is-active");
      const withinLimit =
        expanded || Boolean(keyword) || index < COLLAPSED_TAGS || isActive;
      item.hidden = !(matched && withinLimit);
    });

    if (moreBtn) {
      moreBtn.hidden = Boolean(keyword) || items.length <= COLLAPSED_TAGS + 1;
      moreBtn.setAttribute("aria-expanded", String(expanded));
    }

    if (moreLabel) {
      moreLabel.textContent = expanded
        ? "收起标签"
        : `全部 ${items.length - 1} 个标签`;
    }
  };

  search?.addEventListener("input", () => {
    query = search.value;
    update();
  });

  moreBtn?.addEventListener("click", () => {
    expanded = !expanded;
    update();
  });

  update();
};

/** 「随机一条」：跨页定位到作用域内的任意一条短句 */
const setupRandom = () => {
  const btn = document.getElementById("random-note");
  const index = readRandomIndex();
  if (!btn || !index || !index.items.length) return;

  btn.addEventListener("click", () => {
    const pick = index.items[Math.floor(Math.random() * index.items.length)];
    if (!pick) return;

    const [key, page] = pick;
    const card = document.getElementById(`note-${key}`);
    if (card) {
      // 就在本页，原地展开高亮
      focusCard(card);
      return;
    }

    const url = index.urls[page - 1];
    if (!url) return;
    window.location.assign(`${url}#note-${key}`);
  });
};

export function initNotesChannel() {
  bindNoteToggles();
  setupAside();
  setupRandom();
  locateFromHash();
  prefetchBodiesWhenIdle();
}
