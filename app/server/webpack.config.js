const path = require('path');

module.exports = {
    context: __dirname,
    entry: './src/tictactoe.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'tictactoe.js',
        libraryTarget: 'commonjs'
    },
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
        ]
    },
};
