---
title: "my blog 技术栈"
slug: "my-blog-tech-stack"
date: "2026-05-24"
excerpt: "前端框架、样式方案、Markdown 处理、评论系统、部署流程"
---

## 概述

这篇文章将详细介绍我的个人博客所使用的技术栈，包括前端框架、样式方案、Markdown 处理、评论系统、部署流程等核心技术。

---

## 技术栈总览

| 分类 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **前端框架** | Next.js | 14.2.3 | React 全栈框架 |
| **UI 库** | React | 18.x | UI 组件库 |
| **样式方案** | TailwindCSS | 3.4.1 | 原子化 CSS 框架 |
| **样式插件** | @tailwindcss/typography | 0.5.19 | Markdown 排版优化 |
| **编程语言** | TypeScript | 5.x | 类型安全的 JavaScript |
| **Markdown解析** | remark | 15.0.1 | Markdown AST 处理 |
| **HTML转换** | rehype | - | Markdown 到 HTML 转换 |
| **代码高亮** | highlight.js | 11.11.1 | 代码语法高亮 |
| **评论系统** | Twikoo | 2.0.17 | 博客评论（前端脚本 + 云函数） |
| **部署工具** | gh-pages | 6.3.0 | GitHub Pages 部署 |

---

## 核心技术详解

### 1. 前端框架：Next.js 14

博客基于 **Next.js 14** 构建，采用 **App Router** 模式。

**主要特点：**
- **静态站点生成（SSG）**: 通过 `output: 'export'` 配置实现纯静态导出
- **文件系统路由**: `src/app` 目录下的文件自动映射为路由
- **React Server Components**: 默认支持服务端组件，提升性能

**关键配置（next.config.js）：**
```javascript
const nextConfig = {
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true,
  },
}
```

### 2. 样式方案：TailwindCSS 3

使用 **TailwindCSS 3.4.1** 作为样式框架，配合 `@tailwindcss/typography` 插件优化 Markdown 内容展示。

**自定义配置（tailwind.config.ts）：**
- 自定义主题色：`primary: #2563eb`（蓝色）、`secondary: #7c3aed`（紫色）
- 扩展 typography 样式，移除默认的代码块背景色，便于自定义代码高亮

### 3. Markdown 处理流程

博客使用 **remark** 和 **rehype** 系列工具链处理 Markdown 内容：

```
Markdown 文件
    ↓
gray-matter (解析 frontmatter)
    ↓
remark (解析 Markdown → AST)
    ↓
remark-gfm (支持 GitHub Flavored Markdown)
    ↓
remark-rehype (转换为 rehype AST)
    ↓
rehype-highlight (代码语法高亮)
    ↓
rehype-raw (保留原始 HTML)
    ↓
rehype-stringify (转换为 HTML 字符串)
```

### 4. 代码高亮：highlight.js

使用 `highlight.js` 配合 `rehype-highlight` 实现代码块语法高亮，支持多种编程语言。

### 5. 评论系统：Twikoo

评论基于 **Twikoo 2.0.17**。它由「云函数 + 前端」两部分组成：云函数负责数据存储与接口，前端只负责渲染界面。因此静态博客也能有评论，云函数部署在独立平台，不需要博客本身带服务端。

**部署结构：**

| 部分 | 实现 |
|------|------|
| 前端 | 通过 CDN 引入 `twikoo.min.js`，不进入项目打包产物 |
| 云函数 | Netlify Functions |
| 数据存储 | MongoDB Atlas |

**前端初始化（src/components/Twikoo.tsx）：**

```javascript
await twikoo.init({
  envId: "https://xxx.netlify.app/.netlify/functions/twikoo",
  el: containerRef.current,
  path,          // 显式指定评论归属路径
  lang: "zh-CN",
});
```

**几个实现细节：**

- **CDN 三级回退**：脚本依次尝试 zstatic → npmmirror → jsDelivr，任一失败自动切换下一个，避免单一 CDN 不可用时评论区整体失效
- **按需加载**：用 `IntersectionObserver` 监听评论区位置，滚动到附近（400px 内）才开始下载脚本。Twikoo 打包了 Vue 运行时与代码高亮库，体积约 350KB，读者没翻到底部就没必要付这个代价
- **路径显式指定**：文章页传 `/posts/<slug>`，留言页传 `/comments`，不依赖 `location.pathname`。这样加上 `basePath` 或将来绑定自定义域名，历史评论都不会错位
- **版本锁定**：前端固定 2.0.17，升级云函数时保持两边版本一致，避免非兼容更新导致评论区异常
- **未配置即隐藏**：`TWIKOO_ENV_ID` 为空时整块不渲染，避免线上出现一个加载不出来的空评论框

### 6. 部署方案

采用 **GitHub Pages** 作为托管平台：

**部署流程：**
1. `npm run build` - 构建静态站点到 `out` 目录
2. `gh-pages -d out` - 将构建产物推送到 `gh-pages` 分支

**自动化部署：**
通过 `.github/workflows/deploy.yml` 配置 GitHub Actions，实现提交代码自动部署。

---

## 项目结构

```
my-blog/
├── src/
│   ├── app/                 # App Router 路由
│   │   ├── layout.tsx       # 全局布局
│   │   ├── page.tsx         # 首页
│   │   └── posts/[slug]/    # 文章详情页
│   ├── components/          # 自定义组件
│   │   ├── CodeBlock.tsx    # 代码块组件
│   │   ├── TableOfContents.tsx  # 目录组件
│   │   ├── Twikoo.tsx       # 评论组件
│   │   └── BackToTop.tsx    # 返回顶部组件
│   └── lib/
│       ├── posts.ts         # 文章数据处理
│       └── twikoo-config.ts # 评论系统配置
├── posts/                   # Markdown 文章目录
├── public/                  # 静态资源
└── package.json             # 依赖配置
```

---

## 技术选型理由

### 为什么选择 Next.js？

1. **静态导出能力**: 适合博客这种以内容为主的站点
2. **文件系统路由**: 简化路由管理，文章文件即为路由
3. **社区成熟**: 丰富的生态系统和文档支持
4. **性能优秀**: 内置优化，无需额外配置

### 为什么选择 TailwindCSS？

1. **快速开发**: 原子化 CSS 提高开发效率
2. **响应式设计**: 内置响应式断点
3. **主题定制**: 灵活的主题配置能力

### 为什么选择 remark/rehype 生态？

1. **可扩展性强**: 支持丰富的插件系统
2. **社区活跃**: 持续维护和更新
3. **灵活性高**: 可以定制 Markdown 解析和转换流程

### 为什么选择 Twikoo？

1. **对静态站点友好**: 前端只是一个脚本，云函数部署在独立平台，博客本身不需要服务端
2. **数据在自己手里**: 评论存在自己的 MongoDB 里，不依赖第三方托管评论服务
3. **功能够用**: 支持 Markdown、管理面板审核、邮件通知，比自研一套评论系统省心得多

---

## 总结

我的博客采用了一套现代化的技术栈：

- **框架层**: Next.js 14 + React 18
- **样式层**: TailwindCSS 3 + @tailwindcss/typography
- **内容层**: remark + rehype + highlight.js
- **评论层**: Twikoo + Netlify Functions + MongoDB
- **部署层**: GitHub Pages + GitHub Actions

这套技术栈兼顾了开发效率、性能表现和可维护性，是构建现代静态博客的理想选择。
