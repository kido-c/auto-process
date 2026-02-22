import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    host: true, // 같은 Wi‑Fi의 iPhone에서 http://MacIP:5173 으로 접속 가능
  },
});
