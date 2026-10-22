import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/excerpts/posts" }),
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
    sourceUrl: z.string().optional(), // 原视频/文章链接
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/excerpts/notes" }),
  schema: z.object({
    title: z.string().optional(),        // 标题/核心观点
    text: z.string().optional(),         // 旧字段兼容
    description: z.string().optional(),  // 钩子/摘要
    source: z.string().optional(),       // 出处/自语
    authorUrl: z.string().optional(),    // 创作者主页链接
    sourceLine: z.string().optional(),   // 正文底部「来源」行（Markdown 原文，由渲染层拼回正文末尾）
    tags: z.array(z.string()).default([]),
    mood: z.string().optional(),         // 用来配色
    pubDate: z.coerce.date().optional(), // 新字段
    date: z.coerce.date().optional(),    // 旧字段兼容
  }),
});

const conversations = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/excerpts/conversations" }),
  schema: z.object({
    title: z.string(),                          // 对话标题
    pubDate: z.coerce.date(),                   // 发布日期
    guests: z.array(z.string()).default([]),    // 嘉宾 slug 列表，人物页统一维护
    interviewer: z.string().optional(),         // 提问者
    source: z.string(),                         // 来源（如 YC Podcast）
    sourceUrl: z.string().optional(),           // 原文链接
    pullQuote: z.string().optional(),           // 金句
    tags: z.array(z.string()).default([]),      // 标签/话题
    editorNote: z.string().optional(),          // 编者按
    // toc 移除：目录由正文自动生成
  }),
});

const persons = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/excerpts/persons" }),
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

// v6 起旧版 type: 'content' 集合被移除，统一走 glob 加载器；
// id = 相对 originals/ 的路径（不含扩展名），与旧版 slug 一致，URL 保持不变
const originals = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/originals" }),
  schema: z.object({
    title: z.string(),                          // 标题
    description: z.string().optional(),         // 描述/摘要
    pubDate: z.coerce.date(),                   // 发布日期
    category: z.enum(['systems', 'fragments', 'projects']), // 分类
    status: z.enum(['wip', 'done']).optional(),  // 进度（projects 常用）
    githubUrl: z.string().optional(),            // GitHub 仓库链接（可选）
    demoUrl: z.string().optional(),              // Demo/线上地址（可选）
    tags: z.array(z.string()).default([]),       // 标签
    image: z.string().optional(),                // 封面图
    readingTime: z.number().optional(),          // 阅读时间（分钟）
    featured: z.boolean().default(false),        // 是否推荐
  }),
});

export const collections = { posts, notes, conversations, persons, originals };
