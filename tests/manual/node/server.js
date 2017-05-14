var express   = require('express'),
    http      = require('http'),
    url       = require('url'),
    path      = require('path'),
    Broadcast = require('../shared/broadcast.js');

var app             = express(),
    httpServer      = http.createServer(app),
    broadcastServer = new Broadcast.Server(httpServer);

app.use(function (req, res, next) {
    console.log(req.url);
    next();
});

app.get('/', function (req, res) {
    res.sendFile(path.resolve(path.join(__dirname, 'www/index.html')));
});

app.use('/shared', express.static(path.resolve(path.join(__dirname, '../shared'))));
app.use('/lib',    express.static(path.resolve(path.join(__dirname, '../../../lib'))));

httpServer.listen(8080);
