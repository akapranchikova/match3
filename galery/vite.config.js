import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

import { defineConfig } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  server: {
    https: {
      key: readFileSync(join(__dirname, 'certs', 'localhost-key.pem')),
      cert: readFileSync(join(__dirname, 'certs', 'localhost-cert.pem')),
    },
    open: true,
  },
})
