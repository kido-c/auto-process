/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#f5f5f5",
        card: "#ffffff",
        muted: "#6b7280",
        primary: "#1f2937",
      },
    },
  },
  plugins: [],
};
