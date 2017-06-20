var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
      lib: './lib/tictactoe.js',
      app: './app/www/index.js'
  },
  output: {
    library: 'TicTacToe',
    libraryTarget: 'umd',
    libraryExport: 'default',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  externals: {
      ws: 'ws'
  }
};
