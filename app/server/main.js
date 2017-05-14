var port      = process.env.PORT || 3000,
	express   = require('express'),
    http      = require('http'),
    url       = require('url'),
    path      = require('path'),
    TicTacToe = require('../../lib/tictactoe.js');

var app        = express(),
    httpServer = http.createServer(app),
    gameServer = new TicTacToe.GameServer(httpServer);

app.use(function(req, res, next) {
    console.log('app.use()', req.url);
    next();
});

app.get('/', function(req, res) {
	console.log('app.get()', req.url);
    res.sendFile(path.resolve(path.join(__dirname, 'www/index.html')));
});

app.use('/lib', express.static(path.resolve(path.join(__dirname, '../../lib'))));

httpServer.listen(port);

console.log('Server running at ' + httpServer.address().address + ':' + httpServer.address().port + '/');
