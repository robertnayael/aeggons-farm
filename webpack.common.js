const path = require('path');

module.exports = {
  entry:  ['babel-polyfill', './app/index.js'],
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      exclude: '/node_modules/',
      loader: 'babel-loader'
    }]
  }
};
