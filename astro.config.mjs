import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSpeakerLines from './src/utils/rehype-speaker-lines.mjs';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import * as pagefind from 'pagefind';

// 把 Pagefind 索引生成挂进 astro build 收尾阶段，保证任何构建命令（本地/Vercel）的产物都带检索索引
function pagefindIntegration() {
  return {
    name: 'pagefind-index',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const siteDir = fileURLToPath(dir).replace(/[\\/]+$/, '');
        const { index, errors } = await pagefind.createIndex();
        if (!index || errors.length > 0) {
          throw new Error(`Pagefind 创建索引失败: ${errors.join('; ')}`);
        }
        const { page_count, errors: indexErrors } = await index.addDirectory({
          path: siteDir,
        });
        if (indexErrors.length > 0) {
          throw new Error(`Pagefind 索引页面失败: ${indexErrors.join('; ')}`);
        }
        const { errors: writeErrors } = await index.writeFiles({
          outputPath: fileURLToPath(new URL('pagefind/', dir)),
        });
        if (writeErrors.length > 0) {
          throw new Error(`Pagefind 写入索引失败: ${writeErrors.join('; ')}`);
        }
        await pagefind.close();
        if (page_count === 0) {
          logger.warn('Pagefind 未索引到任何页面，请检查构建产物');
        } else {
          logger.info(`Pagefind 索引完成，共 ${page_count} 页`);
        }
      },
    },
  };
}

export default defineConfig({
  site: 'https://tourweint.shop', // 替换为你的实际域名
  compressHTML: true, // v7 默认改为 'jsx'，显式恢复 v5 的空白压缩行为，避免中文排版出现空格丢失
  integrations: [sitemap(), pagefindIntegration()],
  markdown: {
    processor: unified({
      rehypePlugins: [
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
        rehypeSpeakerLines,
      ],
    }), // v7 默认处理器为 Sätteri，换回 unified 以保留 rehype 外链插件
  },
});