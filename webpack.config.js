var path = require('path');
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var QmlPragmaLibraryWebpackPlugin = require('./tools/qmlpragmalibrary-webpack-plugin.js');

var baseConfig = {
    output: {
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin()
    ],
    externals: {
        ws: 'ws'
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
