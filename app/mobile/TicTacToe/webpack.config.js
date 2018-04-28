const path = require('path');

module.exports = {
    context: __dirname,
    devtool: '',
    entry: [
        'polyfill-qml',
        './src/tictactoe.js',
    ],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'tictactoe.js',
        libraryTarget: 'this'
    },
    node: {
        console: false,
        global: true,
        process: false,
        __filename: 'mock',
        __dirname: 'mock',
        Buffer: false,
        setImmediate: false
    },
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
        ]
    },
};
