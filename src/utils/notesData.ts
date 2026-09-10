import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

// 笔记视图模型：笔记列表页 / 月份页 / 正文 JSON 端点共用
export type NoteView = {
  key: string;
  title: string;
  hook: string;
  tags: string[];
  year: number;
  month: string;
  dateISO: string;
  dateLabel: string;
  source: string;
  body: string;
};

// 不含正文的元数据（用于构建卡片外壳）
export type NoteMeta = Omit<NoteView, "body">;

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

/** 读取全部笔记，按日期倒序，整形为视图模型（不在此渲染 Markdown） */
export async function getNoteViews(): Promise<NoteView[]> {
  const rawNotes = (
    await getCollection("notes")
  ).sort(
    (a: CollectionEntry<"notes">, b: CollectionEntry<"notes">) =>
      resolveNoteDate(b.data).getTime() - resolveNoteDate(a.data).getTime(),
  );

  return rawNotes.map((note, index) => {
    const resolvedDate = resolveNoteDate(note.data);
    const tags: string[] = note.data.tags?.length
      ? note.data.tags
      : ["未分类"];
    const hook = createNoteExcerpt(note);
    return {
      key: String(index),
      title: note.data.title || hook || "未命名短句",
      hook,
      tags,
      year: resolvedDate.getFullYear(),
      month: (resolvedDate.getMonth() + 1).toString().padStart(2, "0"),
      dateISO: resolvedDate.toISOString().split("T")[0],
      dateLabel: resolvedDate.toLocaleDateString("zh-cn"),
      source: note.data.source || "原创",
      body: note.body ?? "",
    };
  });
}

export const toNoteMeta = (note: NoteView): NoteMeta => {
  const { body: _body, ...meta } = note;
  void _body;
  return meta;
};
