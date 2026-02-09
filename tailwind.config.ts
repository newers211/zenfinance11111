import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Позволяет переключать тему через класс .dark на <html>
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Светлая тема: белый основной цвет и его оттенки
        'light-bg': '#FFFFFF',
        'light-bg-secondary': '#F8F9FB',
        'light-border': '#E5E7EB',
        'light-text': '#1F2937',
        'light-text-secondary': '#6B7280',
        // Акцентные цвета для светлой темы
        'primary-light': '#3B82F6',
        'primary-light-hover': '#2563EB',
      }
    },
  },
  plugins: [],
};
export default config;