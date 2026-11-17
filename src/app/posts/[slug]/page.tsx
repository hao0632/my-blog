import Link from "next/link";
import { getPostBySlugWithHeadings, getAllPosts, markdownToHtml } from "@/lib/posts";
import CodeBlockWrapper from "@/components/CodeBlockWrapper";
import TableOfContents from "@/components/TableOfContents";
import BackToTop from "@/components/BackToTop";
import Twikoo from "@/components/Twikoo";
import { TWIKOO_ENABLED } from "@/lib/twikoo-config";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  const invalid = posts.filter(p => !p.slug || p.slug === 'posts');
  if (invalid.length) {
    throw new Error(
      `Invalid post slug(s) found: ${invalid.map(p => String(p.slug)).join(', ')}. ` +
      `Make sure no slug is empty or equals 'posts'.`
    );
  }
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
        <h1 className="text-2xl font-bold text-fg mb-4">文章未找到</h1>
        <Link href="/" className="text-accent hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  const content = await markdownToHtml(post.content);

  return (
    <div className="min-h-screen">
      <BackToTop />
      
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <Link
          href="/"
          className="inline-block mb-6 sm:mb-8 text-accent hover:underline"
        >
          ← 返回首页
        </Link>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <article className="flex-1 min-w-0">
            <header className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-fg mb-3 sm:mb-4">
                {post.title}
              </h1>
              <time className="text-muted text-sm sm:text-base">{post.date}</time>
            </header>

            <div className="prose-container overflow-x-auto">
              <CodeBlockWrapper htmlContent={content} />
            </div>
          </article>

          <aside className="w-full lg:w-64 flex-shrink-0">
            <TableOfContents headings={post.headings} />
          </aside>
        </div>

        {TWIKOO_ENABLED && (
          <section className="mt-10 sm:mt-14 pt-8 border-t border-line">
            <h2 className="text-lg sm:text-xl font-bold text-fg mb-4">评论</h2>
            <Twikoo path={`/posts/${post.slug}`} />
          </section>
        )}
      </div>

      <footer className="bg-footer text-gray-300">
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
            <p className="text-center text-gray-500 text-sm">{"© 2026 hao-0632's blog"}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
