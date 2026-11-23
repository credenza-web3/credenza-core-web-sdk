import devtoolsJson from 'vite-plugin-devtools-json'
import adapter from '@sveltejs/adapter-static'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({
        pages: 'dist',
        assets: 'dist',
        fallback: 'index.html',
        precompress: false,
        strict: true,
      }),
    }),
    devtoolsJson(),
  ],
  resolve: {
    alias: {
      '@packages': path.resolve(import.meta.dirname, '../../packages'),
    },
  },
  test: { include: ['src/**/*.{test,spec}.{js,ts}'] },
  build: {
    commonjsOptions: { include: [/node_modules/] },
  },
})
