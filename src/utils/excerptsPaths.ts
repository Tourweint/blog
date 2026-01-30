export const toIdSlug = (idOrSlug: string) => idOrSlug.replace(/\.(md|mdx)$/i, "");

const pad2 = (value: string | number) => String(value).padStart(2, "0");

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
  notesMonth: (year: string | number, month: string | number) =>
    `/excerpts/notes/${year}/${pad2(month)}`,

  personsIndex: "/excerpts/persons",
  personDetail: (idOrSlug: string) => `/excerpts/persons/${toIdSlug(idOrSlug)}`,

  conversationsIndex: "/excerpts/conversations",
  conversationDetail: (idOrSlug: string) =>
    `/excerpts/conversations/${toIdSlug(idOrSlug)}`,
} as const;
