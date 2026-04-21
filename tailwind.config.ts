import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07090C",
          900: "#0B0E13",
          800: "#12161D",
          700: "#1A2028",
          600: "#232B36",
          500: "#323C4A",
          400: "#4A5564",
          300: "#697384",
          200: "#9AA3B1",
          100: "#D6DAE1",
        },
        rust: {
          50: "#FFF4EA",
          100: "#FFE4C9",
          200: "#FFC58C",
          300: "#FF9F4A",
          400: "#F47D1D",
          500: "#DD5B0C",
          600: "#B84207",
          700: "#8E3109",
          800: "#65250E",
        },
        signal: {
          green: "#4ADE80",
          amber: "#FACC15",
          red: "#F87171",
          blue: "#38BDF8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "panel": "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px -20px rgba(0,0,0,0.7)",
        "inset-hairline": "inset 0 0 0 1px rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "grid-lines":
          "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "diagonal-hatch":
          "repeating-linear-gradient(45deg, rgba(244,125,29,0.08) 0 2px, transparent 2px 8px)",
      },
    },
  },
  plugins: [],
};

export default config;
