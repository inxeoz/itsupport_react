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
  outDir: "./static_ui",
  emptyOutDir: true,
  rollupOptions: {
    output: {
      manualChunks: () => "everything.js", // disable splitting
      entryFileNames: "main.js",
      assetFileNames: "[name].[ext]",      // css/images
    },
  },
},

});
