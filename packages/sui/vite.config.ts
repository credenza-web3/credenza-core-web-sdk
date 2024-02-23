import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ entryRoot: 'src' })],
  build: {
    lib: {
      fileName: 'main',
      name: 'CredenzaSuiExtension',
      entry: resolve(__dirname, 'src/main.ts'),
    },
    rollupOptions: {
      external: ['@mysten/sui.js'],
    },
  },
  resolve: {
    alias: {
      '@packages': resolve(__dirname, '../../packages'),
    },
  },
})
