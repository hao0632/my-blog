import Link from "next/link";
import { getPostBySlugWithHeadings, getAllPosts, markdownToHtml } from "@/lib/posts";
import CodeBlockWrapper from "@/components/CodeBlockWrapper";
import TableOfContents from "@/components/TableOfContents";
import BackToTop from "@/components/BackToTop";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const post = getPostBySlugWithHeadings(params.slug);
  if (!post) {
    return { title: "文章未找到" };
  }
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function Post({ params }: Props) {
  const post = getPostBySlugWithHeadings(params.slug);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">文章未找到</h1>
        <Link href="/" className="text-primary hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  const content = await markdownToHtml(post.content);

  return (
    <div className="min-h-screen">
      <BackToTop />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-block mb-8 text-primary hover:underline"
        >
          ← 返回首页
        </Link>

        <div className="flex gap-8">
          <article className="flex-1">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
              <time className="text-gray-500">{post.date}</time>
            </header>

            <CodeBlockWrapper htmlContent={content} />
          </article>

          <aside className="w-64 flex-shrink-0">
            <TableOfContents headings={post.headings} />
          </aside>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h4 className="text-gray-400 mb-4">链接</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://github.com/hao0632"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800">
          <div className="px-4 py-4">
            <p className="text-center text-gray-500 text-sm">© 2026 hao-0632's blog</p>
          </div>
        </div>
      </footer>
    </div>
  );
}