import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ include: ['src'] })],
  build: {
    lib: {
      fileName: 'main',
      name: 'CredenzaSDKCore',
      entry: resolve(__dirname, 'src/main.ts'),
    }
  }
})
