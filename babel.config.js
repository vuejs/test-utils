module.exports = {
  plugins: ['@vue/babel-plugin-jsx'],
  presets: [
    ['@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ]
}
