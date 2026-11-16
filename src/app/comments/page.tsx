import Twikoo from "@/components/Twikoo";

export default function Comments() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">留言</h1>
      <p className="text-center text-gray-500 mb-10">
        欢迎留下你的想法，或者只是打个招呼。
      </p>

      <Twikoo
        path="/comments"
        fallback={<p className="text-center text-gray-400">评论区尚未配置。</p>}
      />
    </div>
  );
}
