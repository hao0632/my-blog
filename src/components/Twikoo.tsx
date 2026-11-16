"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { TWIKOO_ENABLED, TWIKOO_ENV_ID, TWIKOO_SCRIPT_URLS } from "@/lib/twikoo-config";

/** CDN 版脚本会把接口挂到 window.twikoo 上 */
interface TwikooInstance {
  init: (options: {
    envId: string;
    el?: HTMLElement | string;
    path?: string;
    lang?: string;
  }) => Promise<unknown>;
}

declare global {
  interface Window {
    twikoo?: TwikooInstance;
  }
}

/** 全站只加载一次脚本，多个实例共用同一个 Promise */
let twikooPromise: Promise<TwikooInstance> | null = null;

function injectScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error(src));
    };
    document.head.appendChild(script);
  });
}

function loadTwikoo(): Promise<TwikooInstance> {
  if (window.twikoo) return Promise.resolve(window.twikoo);
  if (twikooPromise) return twikooPromise;

  twikooPromise = (async () => {
    for (const src of TWIKOO_SCRIPT_URLS) {
      try {
        await injectScript(src);
      } catch {
        continue; // 这个 CDN 不通，换下一个
      }
      if (window.twikoo) return window.twikoo;
    }
    throw new Error("所有 CDN 都未能加载 Twikoo 脚本");
  })();

  // 失败后清掉缓存，刷新页面时可重新尝试
  twikooPromise.catch(() => {
    twikooPromise = null;
  });

  return twikooPromise;
}

interface TwikooProps {
  /** 评论归属路径，同一 path 的评论会聚合在一起，如 /posts/hello */
  path: string;
  /** 未配置 envId 时显示的占位内容 */
  fallback?: ReactNode;
}

export default function Twikoo({ path, fallback }: TwikooProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // 没填 envId 就整块跳过，避免线上出现一个加载不出来的空评论框
  useEffect(() => {
    if (TWIKOO_ENABLED) return;
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[twikoo] 未配置 envId，评论区已跳过。请编辑 src/lib/twikoo-config.ts 里的 TWIKOO_ENV_ID。"
      );
    }
  }, []);

  // 滚动到评论区附近再下载脚本：Twikoo 带的 Vue / 高亮库约 350KB，
  // 读者没看到底部就没必要付这个代价
  useEffect(() => {
    if (!TWIKOO_ENABLED) return;
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!TWIKOO_ENABLED || !shouldLoad) return;
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    // 切换文章时清掉上一篇文章的评论树，避免残留
    el.replaceChildren();
    setReady(false);
    setFailed(false);

    (async () => {
      try {
        const twikoo = await loadTwikoo();
        if (cancelled) return;
        await twikoo.init({
          envId: TWIKOO_ENV_ID.trim(),
          el,
          path,
          lang: "zh-CN",
        });
        if (!cancelled) setReady(true);
      } catch (error) {
        if (cancelled) return;
        console.error("[twikoo] 评论加载失败", error);
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shouldLoad, path]);

  if (!TWIKOO_ENABLED) return <>{fallback ?? null}</>;

  return (
    <div>
      {failed && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          评论加载失败，请刷新页面重试。
        </div>
      )}
      {shouldLoad && !ready && !failed && (
        <p className="mb-4 text-sm text-gray-400">评论加载中…</p>
      )}
      <div ref={containerRef} className="min-h-[64px]" />
    </div>
  );
}
