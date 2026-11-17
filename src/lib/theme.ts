/**
 * 主题（浅色 / 深色 / 跟随系统）的共享逻辑
 *
 * 真正决定颜色的是 globals.css 里的 CSS 变量：
 * 给 <html> 加上 .dark 类，变量整体切换，组件里不用写任何 dark: 变体。
 */

export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme";

/** 循环顺序：日 → 月 → 自动 */
export const THEME_CYCLE: ThemeMode[] = ["light", "dark", "system"];

export const THEME_LABEL: Record<ThemeMode, string> = {
  light: "浅色",
  dark: "深色",
  system: "跟随系统",
};

/** 浏览器地址栏 / 滚动条等原生 UI 的配色，需与 --c-page 保持一致 */
const THEME_COLOR = {
  light: "#f9fafb",
  dark: "#111827",
};

/** 读取本地偏好，没有则回落到「跟随系统」 */
export function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") return value;
  } catch {
    // 隐私模式下 localStorage 可能不可用
  }
  return "system";
}

export function prefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function nextMode(mode: ThemeMode): ThemeMode {
  const index = THEME_CYCLE.indexOf(mode);
  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
}

/**
 * 把主题应用到 <html> 上。
 * 注意 data-theme：Twikoo 的表情面板靠 [data-theme=dark] 切换深色样式。
 */
export function applyTheme(mode: ThemeMode, systemDark: boolean, persist = false) {
  const dark = mode === "dark" || (mode === "system" && systemDark);
  const root = document.documentElement;

  root.classList.toggle("dark", dark);
  root.dataset.theme = dark ? "dark" : "light";
  root.style.colorScheme = dark ? "dark" : "light";

  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", dark ? THEME_COLOR.dark : THEME_COLOR.light);

  if (persist) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // 存不了就只在当前页面生效
    }
  }
}
