import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-fg mb-3 sm:mb-4">欢迎来到hao的博客</h1>
          <p className="text-muted text-base sm:text-lg">悟已往之不谏，知来者之可追</p>
        </header>

        <main>
          <h2 className="text-xl sm:text-2xl font-semibold text-fg mb-4 sm:mb-6">最新文章</h2>
          
          {posts.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted">
              <p className="text-lg sm:text-xl">暂无文章</p>
              <p className="mt-2">请在 /posts 文件夹中添加 Markdown 文件来创建文章</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-surface rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6"
                >
                  <Link href={`/posts/${post.slug}`} className="block">
                    <h3 className="text-lg sm:text-xl font-semibold text-accent mb-2 hover:underline">
                      {post.title}
                    </h3>
                    <p className="text-muted mb-3">{post.excerpt}</p>
                    <time className="text-sm text-subtle">{post.date}</time>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      <footer className="bg-footer text-gray-300">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
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
          <div className="px-3 sm:px-4 py-4">
            <p className="text-center text-gray-500 text-sm">{"© 2026 hao-0632's blog"}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
