import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#182026",
        line: "#d8dee5",
        cloud: "#f4f7fa",
        brand: "#0f766e",
        cherry: "#b4235a",
        gold: "#b7791f"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(24, 32, 38, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
