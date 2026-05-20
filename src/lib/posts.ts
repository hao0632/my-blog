import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

const postsDirectory = path.join(process.cwd(), 'posts');

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

function getPostSlugs(): string[] {
  try {
    return fs.readdirSync(postsDirectory);
  } catch {
    return [];
  }
}

function getPostBySlug(slug: string): Post | null {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      slug: realSlug,
      title: data.title || realSlug,
      date: data.date ? String(data.date) : '',
      excerpt: data.excerpt || content.slice(0, 100) + '...',
      content: content,
    };
  } catch {
    return null;
  }
}

function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  
  return posts;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
}

async function markdownToHtml(markdown: string): Promise<string> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight, true)
    .use(rehypeStringify)
    .process(markdown);
  
  let html = result.toString();
  
  if (basePath) {
    html = html.replace(/<img\s+([^>]*?)src=["']\/([^"']+)["']([^>]*)>/gi, `<img $1src="${basePath}/$2" $3>`);
  }
  
  html = html.replace(/<h([2-6])([^>]*)>([^<]+)<\/h\1>/g, (match, level, attrs, text) => {
    const id = slugify(text);
    return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
  });
  
  return html;
}

function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const regex = /^(#{2,6})\s+(.+)$/gm;
  let match;
  
  while ((match = regex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
    
    headings.push({
      id,
      text,
      level,
    });
  }
  
  return headings;
}

function getPostBySlugWithHeadings(slug: string): (Post & { headings: Heading[] }) | null {
  const post = getPostBySlug(slug);
  if (!post) return null;
  
  const headings = extractHeadings(post.content);
  
  return {
    ...post,
    headings,
  };
}

export { getPostSlugs, getPostBySlug, getAllPosts, markdownToHtml, getPostBySlugWithHeadings, extractHeadings };
