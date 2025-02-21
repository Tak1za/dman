import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
console.log("Alias @ resolves to:", path.resolve(__dirname, "src"));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
  },
});
