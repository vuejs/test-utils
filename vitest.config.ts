import path from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    jsx(),
    // We need this plugin to test for stubbing a script setup component
    // imported by it.
    // https://github.com/antfu/unplugin-vue-components/issues/429
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
    pool: 'threads',
    setupFiles: [path.resolve(__dirname, './setup.js')],
    include: ['tests/**/*.spec.ts'],
    server: {
      deps: {
        inline: ['vue', '@vue/compat']
      }
    },
    sequence: {
      shuffle: true
    }
  },
  resolve: {
    extensions: ['.vue', '.js', '.json', '.jsx', '.ts', '.tsx', '.node'],
    dedupe: ['vue', '@vue/compat'],
    alias: {
      '@vue/compat': '@vue/compat/dist/vue.esm-bundler.js'
    }
  }
})
