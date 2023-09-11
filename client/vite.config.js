import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    minify: false,
    outDir: "../api/static",
  },
  server: {
    open: false,
    origin: "http://localhost:5000",
    proxy: {
      "/api": "http://localhost:5000",
    }
  },

});
