const express   = require('express');
const http      = require('http');
const url       = require('url');
const path      = require('path');
const WebSocket = require('ws');
const TicTacToe = require('./build/tictactoe.js');

const port = process.env.PORT || 3000;

const app        = express();
const httpServer = http.createServer(app);
const gameServer = new TicTacToe.GameServer(httpServer, WebSocket);

app.use(function (req, res, next) {
    console.log('app.use()', req.url);
    next();
});

app.get('/', function (req, res) {
    console.log('app.get()', req.url);
    res.sendFile(path.resolve(path.join(__dirname, 'public/index.html')));
});

app.use('/public', express.static(path.resolve(path.join(__dirname, 'public'))));

httpServer.listen(port);

console.log('Server running at ' + httpServer.address().address + ':' + httpServer.address().port + '/');
