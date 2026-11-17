"use client";

import { useCallback, useEffect, useState } from "react";
import {
  THEME_LABEL,
  THEME_STORAGE_KEY,
  applyTheme,
  nextMode,
  prefersDark,
  readStoredMode,
  type ThemeMode,
} from "@/lib/theme";

function SunIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

export default function ThemeToggle() {
  // 初始必须是「跟随系统」，与服务端渲染保持一致；水合后再读本地偏好
  const [mode, setMode] = useState<ThemeMode>("system");
  const [systemDark, setSystemDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredMode();
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    setMode(stored);
    setSystemDark(media.matches);
    setHydrated(true);

    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // 跟随系统模式下，系统主题变化时立即生效
  useEffect(() => {
    if (!hydrated || mode !== "system") return;
    applyTheme("system", systemDark);
  }, [hydrated, mode, systemDark]);

  // 多标签页同步
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next = readStoredMode();
      setMode(next);
      applyTheme(next, prefersDark());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const cycle = useCallback(() => {
    const next = nextMode(mode);
    setMode(next);
    applyTheme(next, prefersDark(), true);
  }, [mode]);

  const label = THEME_LABEL[mode];
  const nextLabel = THEME_LABEL[nextMode(mode)];

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`当前主题：${label}，点击切换为${nextLabel}`}
      title={`当前：${label}（点击切换为${nextLabel}）`}
      className="flex-shrink-0 p-1.5 rounded-md text-muted hover:bg-raised hover:text-fg transition-colors"
    >
      {mode === "light" && <SunIcon />}
      {mode === "dark" && <MoonIcon />}
      {mode === "system" && <MonitorIcon />}
    </button>
  );
}
