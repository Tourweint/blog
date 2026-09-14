import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

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
  const posts = (await getCollection("originals"))
    .filter((post) => !post.slug.startsWith("_"))
    .sort(
      (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
    );

  return rss({
    title: "Tourweint/多鸣 · 原创",
    description: "思维、哲学与成长的长期记录 —— 原创频道",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description:
        post.data.description ?? stripMarkdown(post.body ?? ""),
      link: `/originals/${post.slug}`,
      categories: post.data.tags,
    })),
    customData: "<language>zh-cn</language>",
  });
};
