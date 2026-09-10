import type { APIRoute } from "astro";
import { getNoteViews } from "../../../utils/notesData";

// 笔记正文（原始 Markdown）单独输出为 JSON：
// - 列表页首屏文档不再内联全部正文，减小体积、加快 dev 响应；
// - 客户端在空闲时拉取一次并缓存，首次“展开”时编译为 HTML；
// - 静态构建时会生成同名 JSON 文件，生产环境直接由静态服务器返回。
export const GET: APIRoute = async () => {
  const notes = await getNoteViews();
  const bodies = Object.fromEntries(
    notes.map((note) => [note.key, note.body]),
  );
  return new Response(JSON.stringify(bodies), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
};
