import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "hao的博客",
  description: "分享技术与生活",
  icons: {
    icon: "/cat.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}