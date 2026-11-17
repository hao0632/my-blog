import Twikoo from "@/components/Twikoo";

export default function Comments() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-fg mb-3 text-center">留言</h1>
      <p className="text-center text-muted mb-10">
        欢迎留下你的想法，或者只是打个招呼。
      </p>

      <Twikoo
        path="/comments"
        fallback={<p className="text-center text-subtle">评论区尚未配置。</p>}
      />
    </div>
  );
}
