import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#7c3aed",
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