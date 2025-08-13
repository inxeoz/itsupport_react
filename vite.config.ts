// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'path'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// })

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env": {}, // Prevent "process is not defined"
  },
  build: {
    outDir: "../public/static_ui",
    emptyOutDir: true,
    lib: {
      entry: "./src/main.tsx",
      formats: ["es"],
      fileName: () => `main.js`, // no hashing
    },
    rollupOptions: {
      external: [],
      output: {
        entryFileNames: `main.js`, // no hash
        assetFileNames: `main.css`, // no hash
      },
    },
  },
});
