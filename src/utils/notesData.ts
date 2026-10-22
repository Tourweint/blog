import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { excerpts } from "./excerptsPaths";

// 笔记视图模型：笔记列表页 / 月份页 / 正文 JSON 端点共用
export type NoteView = {
  /** 内容派生的稳定 id（文件路径哈希） */
  id: string;
  /** 与 id 一一对应的短 key，用于 DOM id / bodies.json / 跨页锚点 */
  key: string;
  title: string;
  hook: string;
  tags: string[];
  year: number;
  month: string;
  dateISO: string;
  dateLabel: string;
  source: string;
  /** 正文 Markdown（末尾已拼回 frontmatter sourceLine 的来源行） */
  body: string;
};

// 短句列表每页条数（短句卡片比文章矮，所以比文章页的 8 条给得多一些） */
export const NOTES_PAGE_SIZE = 18;

export const resolveNoteDate = (data: any): Date =>
  data.pubDate || data.date || new Date();

const flatten = (text: string) =>
  text
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[#!>*`~_|>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const createNoteExcerpt = (note: any, max = 140) => {
  const source = note.data.description || note.data.text || note.body || "";
  const clean = flatten(source);
  if (!clean) return "随手的一句短摘";
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
};

/**
 * 把 frontmatter 里的「来源行」拼回正文末尾。
 *
 * 来源信息早期写在正文里（如 `**来源**: [标题](url)`），编辑正文时容易被误删或
 * 改坏；迁到 frontmatter（Zod 校验，坏了构建直接报错）后由这里原样拼回，
 * 页面显示效果与迁移前保持一致。
 */
const withSourceLine = (body: string, sourceLine?: string): string => {
  const block = sourceLine?.trim();
  if (!block) return body;
  const tail = body.trimEnd();
  return tail ? `${tail}\n\n${block}\n` : `${block}\n`;
};

/**
 * 内容派生的稳定 key。
 *
 * 早期版本用数组下标当 key（String(index)），一旦增删短句，后面所有条目的
 * key 都会整体错位——分页后更致命：随机跳转指向的锚点会落在另一条短句上。
 * 这里改成「文件路径哈希」，同一条短句在任何一次构建里都是同一个 key。
 */
const hashNoteId = (input: string): string => {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ code, 0x85ebca6b) >>> 0;
    h2 = (h2 + 0x27d4eb2f) >>> 0;
  }
  return `${(h1 >>> 0).toString(36)}${(h2 >>> 0).toString(36)}`;
};

/** 读取全部笔记，按日期倒序，整形为视图模型（不在此渲染 Markdown） */
export async function getNoteViews(): Promise<NoteView[]> {
  const rawNotes = (
    await getCollection("notes")
  ).sort(
    (a: CollectionEntry<"notes">, b: CollectionEntry<"notes">) =>
      resolveNoteDate(b.data).getTime() - resolveNoteDate(a.data).getTime(),
  );

  // 理论上哈希不会撞车，真撞上了就加后缀，保证 key 唯一
  const usedKeys = new Set<string>();

  return rawNotes.map((note) => {
    const resolvedDate = resolveNoteDate(note.data);
    const tags: string[] = note.data.tags?.length
      ? note.data.tags
      : ["未分类"];
    const hook = createNoteExcerpt(note);

    const baseKey = hashNoteId(note.id);
    let key = baseKey;
    let suffix = 1;
    while (usedKeys.has(key)) {
      suffix += 1;
      key = `${baseKey}-${suffix}`;
    }
    usedKeys.add(key);

    return {
      id: note.id,
      key,
      title: note.data.title || hook || "未命名短句",
      hook,
      tags,
      year: resolvedDate.getFullYear(),
      month: (resolvedDate.getMonth() + 1).toString().padStart(2, "0"),
      dateISO: resolvedDate.toISOString().split("T")[0],
      dateLabel: resolvedDate.toLocaleDateString("zh-cn"),
      source: note.data.source || "原创",
      body: withSourceLine(note.body ?? "", note.data.sourceLine),
    };
  });
}

/* ------------------------------------------------------------------
   标签维度：左栏「标签」栏的数据来源
   ------------------------------------------------------------------ */

export type NoteTagItem = {
  label: string;
  count: number;
  href: string;
  active: boolean;
};

/** 统计每个标签下的短句条数 */
export const getNoteTagCounts = (notes: NoteView[]): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const note of notes) {
    for (const tag of new Set(note.tags)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
};

/** 取出某个标签下的全部短句（保持日期倒序） */
export const filterNotesByTag = (notes: NoteView[], tag: string): NoteView[] =>
  tag === "全部" ? notes : notes.filter((note) => note.tags.includes(tag));

/**
 * 左栏标签项。
 *
 * - 「全部」指向短句首页；
 * - 两条以上的标签有独立页面（/excerpts/notes/tag/<标签>）；
 * - 只有一条的标签不单独建页，直接定位到那条短句所在分页的锚点，
 *   避免为两百多个一次性标签各生成一个空页面。
 */
export const buildNoteTagItems = (
  notes: NoteView[],
  activeTag = "全部",
  pageSize = NOTES_PAGE_SIZE,
): NoteTagItem[] => {
  const counts = getNoteTagCounts(notes);
  const indexByKey = new Map(notes.map((note, index) => [note.key, index]));
  const firstNoteByTag = new Map<string, NoteView>();
  for (const note of notes) {
    for (const tag of note.tags) {
      if (!firstNoteByTag.has(tag)) firstNoteByTag.set(tag, note);
    }
  }

  const tags = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"))
    .map(([label, count]): NoteTagItem => {
      let href: string;
      if (count > 1) {
        href = excerpts.notesTag(label);
      } else {
        const only = firstNoteByTag.get(label);
        const index = only ? (indexByKey.get(only.key) ?? 0) : 0;
        const page = Math.floor(index / pageSize) + 1;
        href = excerpts.notesNoteAnchor(page, only?.key ?? "");
      }
      return { label, count, href, active: label === activeTag };
    });

  return [
    {
      label: "全部",
      count: notes.length,
      href: excerpts.notesIndex,
      active: activeTag === "全部",
    },
    ...tags,
  ];
};

/* ------------------------------------------------------------------
   时间线分组：年份 / 月份 / 单条短句
   ------------------------------------------------------------------ */

export type NoteGroup =
  | { type: "year"; value: string }
  | { type: "month"; value: string; rawValue: string; year: string }
  | { type: "note"; note: NoteView };

export const buildNoteGroups = (list: NoteView[]): NoteGroup[] => {
  const groups: NoteGroup[] = [];
  let currentYear = 0;
  let currentMonth = "";
  list.forEach((note) => {
    if (note.year !== currentYear) {
      currentYear = note.year;
      groups.push({ type: "year", value: currentYear.toString() });
      currentMonth = "";
    }
    if (note.month !== currentMonth) {
      currentMonth = note.month;
      groups.push({
        type: "month",
        value: `${currentMonth}月`,
        rawValue: currentMonth,
        year: currentYear.toString(),
      });
    }
    groups.push({ type: "note", note });
  });
  return groups;
};

/** 取第 page 页的切片（页码从 1 开始，越界返回空数组） */
export const paginateNotes = <T>(
  list: T[],
  page: number,
  pageSize = NOTES_PAGE_SIZE,
): T[] => {
  const start = (page - 1) * pageSize;
  if (start < 0) return [];
  return list.slice(start, start + pageSize);
};
