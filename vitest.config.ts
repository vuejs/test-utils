import path from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    jsx(),
    Components({
      dts: false,
      include: /AutoImportScriptSetup\.vue$/,
      dirs: ['tests/components']
    })
  ],
  define: {
    __USE_BUILD__: process.env.NODE_ENV !== 'test-build',
    __BROWSER__: true,
    __USE_PREFIX_IDENTIFIERS__: true
  },
  test: {
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, './setup.js')],
    include: ['tests/**/*.spec.ts'],
    deps: {
      inline: ['vue', '@vue/compat']
    },
    sequence: {
      shuffle: true
    }
  },
  resolve: {
    extensions: ['.vue', '.js', '.json', '.jsx', '.ts', '.tsx', '.node'],
    dedupe: ['vue', '@vue/compat']
  }
})
