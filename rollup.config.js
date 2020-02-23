import ts from 'rollup-plugin-typescript2'

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
    external: ['vue'],
    plugins: [],
    output: {
      banner,
      file: 'dist/vue-router.other.js',
      format
    }
  }

  if (format === 'es') {
    config.output.file = isBrowser ? pkg.browser : pkg.module 
  }
  console.log('file is', config.output.file)

  config.plugins.push(
    ts({
      check: format === 'es' && isBrowser,
      tsconfigOverride: {
        compilerOptions: {
          declaration: format === 'es' && isBrowser,
          target: 'es6' // not sure what this should be?
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
]
