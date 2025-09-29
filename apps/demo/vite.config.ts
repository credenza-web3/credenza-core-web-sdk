import devtoolsJson from 'vite-plugin-devtools-json'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  plugins: [sveltekit(), devtoolsJson()],
  test: { include: ['src/**/*.{test,spec}.{js,ts}'] },
  resolve: {
    alias: {
      '@packages': path.resolve(__dirname, '../../packages'),
    },
  },
  build: {
    commonjsOptions: { include: [/node_modules/] },
  },
})
