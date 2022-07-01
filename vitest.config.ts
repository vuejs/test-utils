import path from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    __USE_BUILD__: process.argv.indexOf('-use-build') >= 0,
    __BROWSER__: true,
    __USE_PREFIX_IDENTIFIERS__: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, './setup.ts')]
  },
  resolve: {
    extensions: ['.vue', '.js', '.json', '.jsx', '.ts', '.tsx', '.node']
  }
})
