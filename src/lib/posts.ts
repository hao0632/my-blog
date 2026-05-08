import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

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

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(remarkHtml).process(markdown);
  return result.toString();
}

export { getPostSlugs, getPostBySlug, getAllPosts, markdownToHtml };