import type { MarkdownHeading } from "astro";

export interface Author {
  name: string;
  url?: string;
}

export interface NavItem {
  href: string;
  title: string;
}

export interface ContentDetailLayoutProps {
  seoTitle: string;
  contentTitle: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: Date;
  tags?: string[];

  backUrl: string;
  backLabel?: string;

  dateText?: string;
  readingTime?: number;
  totalWords?: number;
  author?: Author | null;

  rereadStars?: number;
  maxStars?: number;

  sourceUrl?: string;
  headings?: MarkdownHeading[];

  tagsBaseHref?: string;

  prevItem?: NavItem | null;
  nextItem?: NavItem | null;
}
