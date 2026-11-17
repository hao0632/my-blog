import type { Metadata } from "next";
// 代码高亮用 highlight.js 官方主题，必须先于 globals.css 引入，
// 这样 globals.css 里的样式才能在同等优先级下覆盖它
import "highlight.js/styles/github.css";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "hao-0632's blog",
  description: "悟已往之不谏，知来者之可追",
  icons: {
    icon: "/cat.ico",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

/**
 * 在首屏渲染前把主题类打到 <html> 上。
 * 静态导出没有服务端，读不到 localStorage，只能靠这段同步脚本防止深色用户刷新时闪一下白。
 * 逻辑与 src/lib/theme.ts 的 applyTheme 保持一致。
 */
const themeInitScript = `
(function () {
  try {
    var mode = localStorage.getItem('theme');
    if (mode !== 'light' && mode !== 'dark' && mode !== 'system') mode = 'system';
    var dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    root.style.colorScheme = dark ? 'dark' : 'light';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', dark ? '#111827' : '#f9fafb');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Header />
        {children}
      </body>
    </html>
  );
}
