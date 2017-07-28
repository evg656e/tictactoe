const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const QmlPragmaLibraryWebpackPlugin = require('qmlpragmalibrary-webpack-plugin');

let baseConfig = {
    output: {
        path: path.resolve(__dirname, 'build')
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin()
    ],
    externals: 'ws'
//    module: {
//        rules: [{
//            test: /websocket\.js$/,
//            parser: {
//                commonjs: false,
//                node: false
//            }
//        }]
//    }
};

let clientConfig = webpackMerge(baseConfig, {
    entry: './lib/tictactoeclient.js',
    output: {
        library: 'TicTacToe',
        libraryTarget: 'umd',
        libraryExport: 'default',
        filename: 'tictactoeclient.js',
    }
});

let serverConfig = webpackMerge(clientConfig, {
    entry: './lib/tictactoeserver.js',
    output: {
        filename: 'tictactoeserver.js',
    }
});

var qmlClientConfig = webpackMerge(clientConfig, {
    entry: ['qml-polyfill/lib/timers.js', './lib/tictactoeclient.js'],
    output: {
        filename: 'tictactoeclient.qml.js'
    },
    plugins: [
        new QmlPragmaLibraryWebpackPlugin()
    ]
});

let appConfig = webpackMerge(baseConfig, {
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
