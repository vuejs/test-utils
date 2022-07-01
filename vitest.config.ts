import path from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), jsx()],
  define: {
    __USE_BUILD__: process.argv.indexOf('-use-build') >= 0,
    __BROWSER__: true,
    __USE_PREFIX_IDENTIFIERS__: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, './setup.js')]
  },
  resolve: {
    extensions: ['.vue', '.js', '.json', '.jsx', '.ts', '.tsx', '.node']
  }
})
