import Link from "next/link";
import { getPostBySlug, getAllPosts, markdownToHtml } from "@/lib/posts";

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
  const post = getPostBySlug(params.slug);
  if (!post) {
    return { title: "文章未找到" };
  }
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function Post({ params }: Props) {
  const post = getPostBySlug(params.slug);

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
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/"
        className="inline-block mb-8 text-primary hover:underline"
      >
        ← 返回首页
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <time className="text-gray-500">{post.date}</time>
        </header>

        <div
          className="prose prose-lg max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>

      <footer className="mt-16 pt-8 border-t border-gray-200">
        <Link
          href="/"
          className="inline-block text-primary hover:underline"
        >
          ← 返回首页
        </Link>
      </footer>
    </div>
  );
}