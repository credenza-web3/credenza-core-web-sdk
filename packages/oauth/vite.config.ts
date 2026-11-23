import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',
      include: ['src'],
      // Sources from sibling packages are inlined via the `@packages` alias, so the TS root must span `packages/`.
      compilerOptions: { rootDir: resolve(__dirname, '..') },
    }),
  ],
  build: {
    lib: {
      fileName: 'main',
      name: 'CredenzaOAuthExtension',
      entry: resolve(__dirname, 'src/main.ts'),
    },
  },
  resolve: {
    alias: {
      '@packages': resolve(__dirname, '../../packages'),
    },
  },
})
