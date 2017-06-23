var port      = process.env.PORT || 3000,
    express   = require('express'),
    http      = require('http'),
    url       = require('url'),
    path      = require('path'),
    TicTacToe = require('./tictactoeserver.js');

var app        = express(),
    httpServer = http.createServer(app),
    gameServer = new TicTacToe.GameServer(httpServer);

app.use(function(req, res, next) {
    console.log('app.use()', req.url);
    next();
});

app.get('/', function(req, res) {
    console.log('app.get()', req.url);
    res.sendFile(path.resolve(path.join(__dirname, 'public/index.html')));
});

app.use('/public', express.static(path.resolve(path.join(__dirname, 'public'))));

httpServer.listen(port);

console.log('Server running at ' + httpServer.address().address + ':' + httpServer.address().port + '/');
