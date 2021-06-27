const originalJestConfig = require('../jest.config')

module.exports = {
  ...originalJestConfig,
  moduleNameMapper: {
    '^vue$': '@vue/compat'
  }
}
