import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#7c3aed",
        // 语义色板：实际颜色来自 globals.css 中的 CSS 变量，
        // 切换主题只需切换变量，组件里不用写任何 dark: 变体
        page: "rgb(var(--c-page) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        raised: "rgb(var(--c-raised) / <alpha-value>)",
        fg: "rgb(var(--c-fg) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        subtle: "rgb(var(--c-subtle) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
        "accent-soft": "rgb(var(--c-accent-soft) / <alpha-value>)",
        footer: "rgb(var(--c-footer) / <alpha-value>)",
        code: "rgb(var(--c-code) / <alpha-value>)",
      },
      typography: {
        DEFAULT: {
          css: {
            code: {
              backgroundColor: "transparent",
              padding: "0",
              "&::before": {
                content: '""',
              },
              "&::after": {
                content: '""',
              },
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            pre: {
              backgroundColor: "transparent",
              padding: "0",
              margin: "0",
              "&::before": {
                content: '""',
              },
              "&::after": {
                content: '""',
              },
            },
            "pre::before": {
              content: '""',
            },
            "pre::after": {
              content: '""',
            },
            "pre code": {
              backgroundColor: "transparent",
              padding: "0",
              "&::before": {
                content: '""',
              },
              "&::after": {
                content: '""',
              },
            },
            "pre code::before": {
              content: '""',
            },
            "pre code::after": {
              content: '""',
            },
          },
        },
        sm: {
          css: {
            code: {
              backgroundColor: "transparent",
              padding: "0",
              "&::before": {
                content: '""',
              },
              "&::after": {
                content: '""',
              },
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            pre: {
              backgroundColor: "transparent",
              padding: "0",
              margin: "0",
              "&::before": {
                content: '""',
              },
              "&::after": {
                content: '""',
              },
            },
            "pre::before": {
              content: '""',
            },
            "pre::after": {
              content: '""',
            },
            "pre code": {
              backgroundColor: "transparent",
              padding: "0",
              "&::before": {
                content: '""',
              },
              "&::after": {
                content: '""',
              },
            },
            "pre code::before": {
              content: '""',
            },
            "pre code::after": {
              content: '""',
            },
          },
        },
        lg: {
          css: {
            code: {
              backgroundColor: "transparent",
              padding: "0",
              "&::before": {
                content: '""',
              },
              "&::after": {
                content: '""',
              },
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            pre: {
              backgroundColor: "transparent",
              padding: "0",
              margin: "0",
              "&::before": {
                content: '""',
              },
              "&::after": {
                content: '""',
              },
            },
            "pre::before": {
              content: '""',
            },
            "pre::after": {
              content: '""',
            },
            "pre code": {
              backgroundColor: "transparent",
              padding: "0",
              "&::before": {
                content: '""',
              },
              "&::after": {
                content: '""',
              },
            },
            "pre code::before": {
              content: '""',
            },
            "pre code::after": {
              content: '""',
            },
          },
        },
        xl: {
          css: {
            code: {
              backgroundColor: "transparent",
              padding: "0",
              "&::before": {
                content: '""',
              },
              "&::after": {
                content: '""',
              },
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            pre: {
              backgroundColor: "transparent",
              padding: "0",
              margin: "0",
              "&::before": {
                content: '""',
              },
              "&::after": {
                content: '""',
              },
            },
            "pre::before": {
              content: '""',
            },
            "pre::after": {
              content: '""',
            },
            "pre code": {
              backgroundColor: "transparent",
              padding: "0",
              "&::before": {
                content: '""',
              },
              "&::after": {
                content: '""',
              },
            },
            "pre code::before": {
              content: '""',
            },
            "pre code::after": {
              content: '""',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};
export default config;