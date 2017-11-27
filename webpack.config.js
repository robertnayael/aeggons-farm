const path = require('path');

module.exports = {
  entry:  ['babel-polyfill', './app/index.js'], //'./app/index.js',
  output: {
    //path: distDir,
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      exclude: '/node_modules/',
      loader: 'babel-loader'
    }]
  },
  devServer: {
    contentBase: __dirname + '/dist',
  }
}
