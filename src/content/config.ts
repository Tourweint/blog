import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    author: z.union([
      z.string(),
      z.object({
        name: z.string(),
        url: z.string().optional(),
      }),
    ]).optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    rereadStars: z.number().int().min(0).max(5).default(0),
  }),
});

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),        // 标题/核心观点
    text: z.string().optional(),         // 旧字段兼容
    description: z.string().optional(),  // 钩子/摘要
    source: z.string().optional(),       // 出处/自语
    tags: z.array(z.string()).default([]),
    mood: z.string().optional(),         // 用来配色
    pubDate: z.coerce.date().optional(), // 新字段
    date: z.coerce.date().optional(),    // 旧字段兼容
  }),
});

const conversations = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),                          // 对话标题
    description: z.string().optional(),         // 描述
    pubDate: z.coerce.date(),                   // 发布日期
    guests: z.array(z.object({                  // 嘉宾信息
      name: z.string(),
      role: z.string().optional(),              // 身份
      bio: z.string().optional(),               // 简介
      image: z.string().optional(),             // 嘉宾照片
      url: z.string().optional(),               // 主页链接
    })),
    interviewer: z.string().optional(),         // 提问者
    source: z.string(),                         // 来源（如：YC Podcast, 播客名称等）
    sourceUrl: z.string().optional(),           // 原文链接
    pullQuote: z.string().optional(),           // 金句
    readingTime: z.number().optional(),         // 阅读时间（分钟）
    tags: z.array(z.string()).default([]),      // 标签/话题
    editorNote: z.string().optional(),          // 编者按
    toc: z.array(z.object({                     // 目录
      title: z.string(),
      id: z.string(),
    })).default([]),                            // 目录项
  }),
});

export const collections = { posts, notes, conversations };