var path = require('path');
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var QmlPragmaLibraryWebpackPlugin = require('../qmlpragmalibrary-webpack-plugin');

var baseConfig = {
    output: {
        path: path.resolve(__dirname, 'build')
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

var clientConfig = webpackMerge(baseConfig, {
    entry: './lib/tictactoeclient.js',
    output: {
        library: 'TicTacToe',
        libraryTarget: 'umd',
        libraryExport: 'default',
        filename: 'tictactoeclient.js',
    }
});

var serverConfig = webpackMerge(clientConfig, {
    entry: './lib/tictactoeserver.js',
    output: {
        filename: 'tictactoeserver.js',
    }
});

var qmlClientConfig = webpackMerge(clientConfig, {
    entry: ['./lib/timers.js', './lib/tictactoeclient.js'],
    output: {
        filename: 'tictactoeclient.qml.js'
    },
    plugins: [
        new QmlPragmaLibraryWebpackPlugin()
    ]
});

var appConfig = webpackMerge(baseConfig, {
    entry: './app/web/index.js',
    output: {
        filename: 'tictactoeapp.js',
    },
});

module.exports = [
    clientConfig,
    qmlClientConfig,
    serverConfig,
    appConfig
];
