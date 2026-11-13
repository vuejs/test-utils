import path from 'path'
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'

export default defineConfig(({ mode }) => ({
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
    __USE_BUILD__: mode !== 'test-build',
    __BROWSER__: true,
    __USE_PREFIX_IDENTIFIERS__: true
  },
  test: {
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, './setup.js')],
    projects: [
      {
        extends: true,
        test: {
          name: 'jsdom',
          pool: 'vmThreads',
          include: ['tests/**/*.spec.ts']
        }
      },
      {
        extends: true,
        // The browser compiler emits `with` statements. In compileSlots,
        // __BROWSER__ adds strict mode, which would reject that generated code.
        define: {
          __BROWSER__: false,
          __USE_PREFIX_IDENTIFIERS__: false
        },
        optimizeDeps: {
          // Keep the browser compiler from being prebundled with Node compiler dependencies.
          exclude: ['@vue/compiler-core', '@vue/compiler-dom']
        },
        resolve: {
          alias: [
            // Inline template fixtures need the compiler-enabled Vue runtime.
            { find: /^vue$/, replacement: 'vue/dist/vue.esm-bundler.js' }
          ]
        },
        test: {
          name: 'browser',
          include: ['tests/**/*.spec.ts'],
          exclude: [
            // SSR requires the Node environment.
            'tests/renderToString.spec.ts',
            // These tests assume document.body starts empty, unlike the browser runner.
            'tests/mount.spec.ts'
          ],
          browser: {
            enabled: true,
            headless: true,
            screenshotFailures: false,
            provider: playwright(),
            instances: [{ browser: 'chromium' }]
          }
        }
      }
    ],
    coverage: {
      include: ['src/**']
    },
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
}))
