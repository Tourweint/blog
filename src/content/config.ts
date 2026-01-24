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
    guests: z.array(z.string()).default([]),    // 嘉宾 slug 列表，人物页统一维护
    interviewer: z.string().optional(),         // 提问者
    source: z.string(),                         // 来源（如 YC Podcast）
    sourceUrl: z.string().optional(),           // 原文链接
    pullQuote: z.string().optional(),           // 金句
    readingTime: z.number().optional(),         // 阅读时间（分钟）
    tags: z.array(z.string()).default([]),      // 标签/话题
    editorNote: z.string().optional(),          // 编者按
    // toc 移除：目录由正文自动生成
  }),
});

const persons = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),                           // 姓名
    nameEn: z.string().optional(),              // 英文名
    avatar: z.string().optional(),              // 头像 URL
    role: z.string().optional(),                // 身份/职位
    bio: z.string().optional(),                 // 简介
    tags: z.array(z.string()).default([]),      // 标签
    links: z.object({                           // 社交/外部链接
      website: z.string().optional(),
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      github: z.string().optional(),
    }).optional(),
    featured: z.boolean().default(false),       // 是否推荐
  }),
});

export const collections = { posts, notes, conversations, persons };