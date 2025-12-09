import { defineConfig } from "vite"
import handlebars from "vite-plugin-handlebars"
import { resolve } from "path"
import basicSsl from "@vitejs/plugin-basic-ssl"

export default defineConfig({
  base: process.env.BASE_URL,
  server: {
    port: 8443, // Set your desired port here
  },
  plugins: [
    basicSsl(),
    handlebars({
      partialDirectory: [
        resolve(__dirname, "src/partials/pages"),
        resolve(__dirname, "src/partials/components"),
      ],
    }),
  ],
  root: "./",
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        scan: resolve(__dirname, "scan.html"),
      },
    },
  },
})
