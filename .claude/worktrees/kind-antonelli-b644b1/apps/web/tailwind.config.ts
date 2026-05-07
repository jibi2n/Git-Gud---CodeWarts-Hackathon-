import type { Config } from "tailwindcss";

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
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
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
        md: "8px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "glow-ring": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(37, 99, 235, 0.4)" },
          "50%": { boxShadow: "0 0 0 6px rgba(37, 99, 235, 0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "pulse-dot": "pulse-dot 1.2s ease-in-out infinite",
        "glow-ring": "glow-ring 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
