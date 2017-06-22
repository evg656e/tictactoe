var path = require('path');
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var QmlPragmaLibraryWebpackPlugin = require('../qmlpragmalibrary-webpack-plugin');

var baseConfig = {
    output: {
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin()
    ],
    module: {
        rules: [{
            test: /websocket\.js$/,
            parser: {
                commonjs: false,
                node: false
            }
        }]
    }
};

var libConfig = webpackMerge(baseConfig, {
    entry: './lib/tictactoe.js',
    output: {
        library: 'TicTacToe',
        libraryTarget: 'umd',
        libraryExport: 'default',
        filename: 'lib.js',
    }
});

var qmlLibConfig = webpackMerge(libConfig, {
    entry: ['./lib/timers.js', './lib/tictactoe.js'],
    output: {
        filename: 'lib.qml.js'
    },
    plugins: [
        new QmlPragmaLibraryWebpackPlugin()
    ]
});

var appConfig = webpackMerge(baseConfig, {
    entry: './app/www/index.js',
    output: {
        filename: 'app.js',
    },
});

module.exports = [
    libConfig,
    qmlLibConfig,
    appConfig
];
