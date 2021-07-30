const path = require('path')

module.exports = {
  preset: 'ts-jest',
  globals: {
    __USE_BUILD__: process.argv.indexOf('-use-build') >= 0,
    __BROWSER__: true,
    __USE_PREFIX_IDENTIFIERS__: true,
    'ts-jest': {
      babelConfig: true
    }
  },
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\js$': 'babel-jest'
  },
  moduleFileExtensions: ['vue', 'js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  setupFiles: [path.resolve(__dirname, './setup.js')]
}
