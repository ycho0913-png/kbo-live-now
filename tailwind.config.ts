import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#141414",
        grass: "#116149",
        line: "#d7ded9",
        paper: "#fbfcfb",
        warning: "#b42318"
      },
      boxShadow: {
        soft: "0 12px 36px rgba(20, 20, 20, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
