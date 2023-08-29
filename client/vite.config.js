import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  plugins: [react(), legacy(), eslint({ failOnError: false })],
  build: {
    outDir: "../priv/static",
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      "/auth": "http://127.0.0.1:4000",
    },
  },
});
