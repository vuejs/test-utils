import ts from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'

import pkg from './package.json'

const banner = `
/**
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} Lachlan Miller
 * Released under the MIT License
 */
`

function createEntry(options) {
  const {
    format,
    input,
    isBrowser
  } = options

  const config = {
    input,
    external: ['vue', 'lodash/mergeWith'],
    plugins: [resolve()],
    output: {
      banner,
      file: 'dist/vue-test-utils.other.js',
      format
    }
  }

  if (format === 'es') {
    config.output.file = isBrowser ? pkg.browser : pkg.module 
  }
  if (format === 'cjs') {
    config.output.file = pkg.main
  }
  console.log('file is', config.output.file)

  config.plugins.push(
    ts({
      check: format === 'es' && isBrowser,
      tsconfigOverride: {
        compilerOptions: {
          declaration: format === 'es' && isBrowser,
          target: 'es5', // not sure what this should be?
          module: format === 'cjs' ? 'es2015' : 'esnext'
        },
        exclude: ['tests']
      }
    })
  )

  return config
}

export default [
  createEntry({ format: 'es', input: 'src/index.ts', isBrowser: false }),
  createEntry({ format: 'es', input: 'src/index.ts', isBrowser: true }),
  createEntry({ format: 'cjs', input: 'src/index.ts', isBrowser: false }),
]
