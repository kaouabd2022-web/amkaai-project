/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",        // 🔥 app router
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",      // (اختياري)
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // 🔥 مهم جدا
  ],
  theme: {
    extend: {
      colors: {
        primary: "#06b6d4",   // cyan
        dark: "#0f0f0f",
      },
    },
  },
  plugins: [],
};