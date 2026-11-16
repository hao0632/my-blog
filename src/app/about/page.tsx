export const metadata = {
  title: '关于 | hao-0632\'s blog',
};

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* 头部 */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🐱</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">关于本站</h1>
        <p className="text-gray-500">分享技术，记录生活</p>
      </div>

      {/* 站点介绍 */}
      <section className="mb-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📝</span> 站点简介
        </h2>
        <div className="space-y-3 text-gray-600 leading-relaxed">
          <p>
            你好，欢迎来到 <span className="font-semibold text-gray-900">hao-0632&apos;s blog</span>！这是我的博客。
          </p>
          <p>
            这是一个存放碎片的地方，记录日常，收藏想法，慢慢往前走。
          </p>
          <p>
            且行且记。
          </p>
        </div>
      </section>

      {/* 联系方式 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🔗</span> 联系方式
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">GitHub：</span>
            <a
              href="https://github.com/hao0632"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
              hao-0632
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">邮箱：</span>
            <a
              href="mailto:2640706787@qq.com"
              className="text-blue-500 hover:text-blue-600 break-all"
            >
              2640706787@qq.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
