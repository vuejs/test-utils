module.exports = {
  preset: 'ts-jest',
  globals: {},
  testEnvironment: 'jsdom',
  transform: {
    "^.+\\.vue$": "@lmiller1990/vue-jest-transformer",
    "^.+\\js$": "babel-jest"
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!vue/.*)"
  ],
  moduleFileExtensions: ['vue', 'js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  moduleNameMapper: {
    "^vue$": "<rootDir>/node_modules/vue/dist/vue.esm.js"
  },
  setupFiles: ['./setup.js']
}
