import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import legacy from "@vitejs/plugin-legacy";

import fs from "fs/promises";

export default defineConfig({
  plugins: [react(), legacy(), eslint({ failOnError: false })],
  build: {
    outDir: "../priv/static",
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
  // TODO: rename .js to .jsx, see https://github.com/vitejs/vite/discussions/3448#discussioncomment-747542
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: "load-js-files-as-jsx",
          setup(build) {
            build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => ({
              loader: "jsx",
              contents: await fs.readFile(args.path, "utf8"),
            }));
          },
        },
      ],
    },
  },
});
