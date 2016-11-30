const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    background: './src/common/js/background.js',
    content: './src/common/js/content.js',
    edit: './src/common/js/edit.js',
    options: './src/common/js/options.js'
  },
  output: {
    path: './build/chrome',
    filename: 'js/[name].js'
  },
  plugins: [
    new CopyWebpackPlugin([
        { from: './src/browser/chrome/' },
        { from: './src/common/' }
      ],
      { ignore: [ '*.js' ] }
    )
  ]
}
