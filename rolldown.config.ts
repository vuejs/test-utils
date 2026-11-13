import { type ModuleFormat, type RolldownOptions, defineConfig } from 'rolldown'

import pkg from './package.json'

const banner = `
/**
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} Lachlan Miller
 * Released under the MIT License
 */
`

function createEntry(options: {
  format: ModuleFormat
  input: string
  isBrowser: boolean
}): RolldownOptions {
  const { format, input, isBrowser } = options

  const isEsmBrowser = format === 'es' && isBrowser

  let file = 'dist/vue-test-utils.browser.js'
  if (format === 'es') {
    file = isBrowser ? 'dist/vue-test-utils.esm-browser.js' : pkg.module
  }
  if (format === 'cjs') {
    file = pkg.main
  }
  console.log(`Building ${format}: ${file}`)

  return {
    input,
    // resolve like @rollup/plugin-node-resolve's defaults: prefer ESM builds,
    // don't use the "browser" field or node/browser export conditions
    platform: 'neutral',
    resolve: {
      mainFields: ['module', 'main'],
      conditionNames: ['default', 'module', 'import']
    },
    external: [
      'vue',
      isEsmBrowser
        ? '@vue/compiler-dom/dist/compiler-dom.esm-browser'
        : '@vue/compiler-dom',
      '@vue/server-renderer'
    ],
    // renderToString is not available in the browser builds (see __SSR__),
    // so they must not keep an import of @vue/server-renderer
    treeshake: { moduleSideEffects: 'no-external' },
    transform: {
      target: 'es2015',
      define: {
        'process.env.NODE_ENV': 'true',
        __BROWSER__: String(isEsmBrowser),
        __SSR__: String(!isBrowser),
        __USE_PREFIX_IDENTIFIERS__: String(isEsmBrowser || format === 'cjs')
      }
    },
    output: {
      banner,
      name: 'VueTestUtils',
      file,
      format,
      globals: {
        vue: 'Vue',
        '@vue/compiler-dom': 'VueCompilerDOM',
        '@vue/server-renderer': 'VueServerRenderer'
      }
    }
  }
}

export default defineConfig([
  createEntry({ format: 'es', input: 'src/index.ts', isBrowser: false }),
  createEntry({ format: 'es', input: 'src/index.ts', isBrowser: true }),
  createEntry({ format: 'iife', input: 'src/index.ts', isBrowser: true }),
  createEntry({ format: 'cjs', input: 'src/index.ts', isBrowser: false })
])
