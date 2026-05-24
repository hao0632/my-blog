import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Posts() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">文章</h1>
      
      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">暂无文章</p>
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
    </div>
  );
}