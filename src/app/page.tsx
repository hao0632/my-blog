import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">欢迎来到hao的博客</h1>
        <p className="text-gray-600 text-lg">分享技术与生活，记录成长点滴</p>
      </header>

      <main>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">最新文章</h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">暂无文章</p>
            <p className="mt-2">请在 /posts 文件夹中添加 Markdown 文件来创建文章</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <Link href={`/posts/${post.slug}`} className="block">
                  <h3 className="text-xl font-semibold text-primary mb-2 hover:underline">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{post.excerpt}</p>
                  <time className="text-sm text-gray-400">{post.date}</time>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>© 2026 hao的博客. 使用 Next.js 构建.</p>
      </footer>
    </div>
  );
}