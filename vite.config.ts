import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env": {},
  },
  build: {
    outDir: "../public/static_ui",
    emptyOutDir: true,
    lib: {
      entry: "./src/main.tsx",
      formats: ["es"],
      fileName: () => `main.js`,
    },
    rollupOptions: {
      external: [],
      output: {
        entryFileNames: `main.js`,
        assetFileNames: `main.css`,
      },
    },
  },
});
