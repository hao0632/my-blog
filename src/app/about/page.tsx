import Busuanzi from '@/components/Busuanzi';

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
            你好，欢迎来到 <span className="font-semibold text-gray-900">hao-0632&apos;s blog</span>！
            这是一个专注于技术分享与生活记录的个人博客。
          </p>
          <p>
            这里主要会分享 CTF
            竞赛、安全攻防、应急响应等技术内容，也会偶尔记录一些生活随笔和学习笔记。
          </p>
          <p>
            如果文章对你有帮助，欢迎留言交流。让我们一起在技术的道路上不断成长 🚀
          </p>
        </div>
      </section>

      {/* 访客统计 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📊</span> 访客统计
        </h2>
        <Busuanzi />
        <p className="text-center text-xs text-gray-400 mt-4">
          数据由
          <a
            href="https://www.busuanzi.cc/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 mx-1"
          >
            不蒜子
          </a>
          提供
        </p>
      </section>

      {/* 联系方式 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🔗</span> 联系方式
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">GitHub：</span>
            <span className="text-gray-500">hao-0632</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">邮箱：</span>
            <span className="text-gray-500">待补充</span>
          </div>
        </div>
      </section>
    </div>
  );
}
