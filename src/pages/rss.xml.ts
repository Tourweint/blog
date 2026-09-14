import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { excerpts } from "../utils/excerptsPaths";

// 从 Markdown 原文提取纯文本摘要（优先使用 frontmatter description）
const stripMarkdown = (markdown: string) =>
  markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~`]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);

export const GET: APIRoute = async (context) => {
  const posts = (await getCollection("posts"))
    .filter((post) => !post.id.startsWith("_"))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, 100); // 订阅源只保留最近 100 篇，控制体积

  return rss({
    title: "Tourweint/多鸣 · 摘录",
    description: "思维、哲学与成长的长期记录 —— 摘录频道",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description:
        post.data.description ??
        stripMarkdown(post.body ?? ""),
      link: excerpts.postDetail(post.id),
      categories: post.data.tags,
    })),
    customData: "<language>zh-cn</language>",
  });
};
