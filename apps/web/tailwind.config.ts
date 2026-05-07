import type { Config } from "tailwindcss";

// Palette derived from DESIGN.md §8.4 (GitHub Primer light_high_contrast).
// Colors map to CSS variables defined in app/globals.css.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fg: {
          DEFAULT: "var(--fg-default)",
          muted: "var(--fg-muted)",
          subtle: "var(--fg-subtle)",
          onEmphasis: "var(--fg-on-emphasis)",
        },
        bg: {
          canvas: "var(--bg-canvas)",
          DEFAULT: "var(--bg-default)",
          subtle: "var(--bg-subtle)",
          muted: "var(--bg-muted)",
          emphasis: "var(--bg-emphasis)",
        },
        border: {
          DEFAULT: "var(--border-default)",
          muted: "var(--border-muted)",
          subtle: "var(--border-subtle)",
        },
        accent: {
          fg: "var(--accent-fg)",
          emphasis: "var(--accent-emphasis)",
          muted: "var(--accent-muted)",
          subtle: "var(--accent-subtle)",
        },
        success: {
          fg: "var(--success-fg)",
          emphasis: "var(--success-emphasis)",
          subtle: "var(--success-subtle)",
        },
        attention: {
          fg: "var(--attention-fg)",
          emphasis: "var(--attention-emphasis)",
          subtle: "var(--attention-subtle)",
        },
        danger: {
          fg: "var(--danger-fg)",
          emphasis: "var(--danger-emphasis)",
          subtle: "var(--danger-subtle)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SF Mono",
          "Cascadia Code",
          "Roboto Mono",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        md: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
