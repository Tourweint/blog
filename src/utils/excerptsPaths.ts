export const toIdSlug = (idOrSlug: string) => idOrSlug.replace(/\.(md|mdx)$/i, "");

const pad2 = (value: string | number) => String(value).padStart(2, "0");

/**
 * 路由片段里的特殊字符需要转义。
 * Astro 生成静态路径时也只处理 `#` 和 `?`，这里保持一致，
 * 避免链接里的标签把路径截断。
 */
const safeSegment = (value: string) =>
  value.replace(/#/g, "%23").replace(/\?/g, "%3F");

/** 短句分页：第 1 页用 /excerpts/notes，其余用 /excerpts/notes/p/N */
const notesPageUrl = (page: number) =>
  page <= 1 ? "/excerpts/notes" : `/excerpts/notes/p/${page}`;

/** 短句标签页：/excerpts/notes/tag/<标签>，带分页时追加 /p/N */
const notesTagUrl = (tag: string, page?: number) => {
  const seg = safeSegment(tag);
  if (!page || page <= 1) return `/excerpts/notes/tag/${seg}`;
  return `/excerpts/notes/tag/${seg}/p/${page}`;
};

export const excerpts = {
  root: "/excerpts",
  rootHref: "/excerpts/",

  postsIndex: "/excerpts/posts",
  postsPage: (page: number) => (page <= 1 ? "/excerpts/posts" : `/excerpts/posts/p/${page}`),
  postDetail: (idOrSlug: string) => `/excerpts/posts/page/${toIdSlug(idOrSlug)}`,

  categoryIndex: "/excerpts/category",
  categoryBaseHref: "/excerpts/category/",
  category: (category: string, page?: number | string) => {
    const safeCategory = encodeURIComponent(category);
    if (!page || String(page) === "1") return `/excerpts/category/${safeCategory}`;
    return `/excerpts/category/${safeCategory}/${page}`;
  },

  notesIndex: "/excerpts/notes",
  notesPage: notesPageUrl,
  notesTag: notesTagUrl,
  /** 单条短句的定位锚点（跨页随机跳转用） */
  notesNoteAnchor: (page: number, key: string) => `${notesPageUrl(page)}#note-${key}`,
  notesMonthsIndex: "/excerpts/notes/months",
  notesMonth: (year: string | number, month: string | number) =>
    `/excerpts/notes/${year}/${pad2(month)}`,

  personsIndex: "/excerpts/persons",
  personDetail: (idOrSlug: string) => `/excerpts/persons/${toIdSlug(idOrSlug)}`,

  conversationsIndex: "/excerpts/conversations",
  conversationDetail: (idOrSlug: string) => `/excerpts/conversations/${toIdSlug(idOrSlug)}`,
} as const;
