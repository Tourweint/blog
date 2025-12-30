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

export const collections = { posts };