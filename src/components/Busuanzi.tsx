'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

type StatItem = {
  id: string;
  label: string;
  icon: string;
};

const stats: StatItem[] = [
  { id: 'busuanzi_site_pv', label: '总访问量', icon: '👁️' },
  { id: 'busuanzi_site_uv', label: '总访客数', icon: '👥' },
  { id: 'busuanzi_today_pv', label: '今日访问', icon: '📈' },
  { id: 'busuanzi_today_uv', label: '今日访客', icon: '🚶' },
];

export default function Busuanzi() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // 脚本加载超过 8s 视为失败，避免一直显示"加载中"
  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(() => {
      if (!ready) setFailed(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [ready]);

  return (
    <>
      <Script
        src="//cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
        onError={() => setFailed(true)}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="flex flex-col items-center justify-center p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all"
          >
            <span className="text-3xl mb-2" aria-hidden>
              {stat.icon}
            </span>
            <span
              id={stat.id}
              className="text-2xl font-bold text-gray-900 tabular-nums"
            >
              {failed ? '—' : ready ? '' : '加载中'}
            </span>
            <span className="text-sm text-gray-500 mt-1">{stat.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
