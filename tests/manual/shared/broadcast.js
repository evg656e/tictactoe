(function loader(root, fac, id, deps) {
    if (typeof bootstrap === 'function') { // browser dynamic loader
        bootstrap(root, fac, id, deps);
        return;
    }
    deps = (deps || []).map(function(dep) {
        return {
            id: dep.substring(dep.lastIndexOf('/') + 1),
            path: dep.substring(0, dep.lastIndexOf('/') + 1),
            filePath: dep.substring(0, dep.lastIndexOf('/') + 1) + dep.substring(dep.lastIndexOf('/') + 1).toLowerCase() + '.js'
        };
    });
    if (typeof module === 'object' && module.exports) // node.js loader
        module.exports = fac.apply(root, deps.map(function(dep) { return require(dep.filePath); }));
    else if (typeof Qt === 'object' && Qt.include) // qml loader
        root[id] = fac.apply(root, deps.map(function(dep) {
            if (!root[dep.id])
                Qt.include(dep.filePath);
            return root[dep.id];
        }));
    else // browser static loader
        root[id] = fac.apply(root, deps.map(function(dep) { return root[dep.id]; }));
/*loader.*/}(this, function(Timers, Observer, WebSocket) {

'use strict';

console.log('defining Broadcast');

var message = Observer.message;

/*!
    \class Broadcast
*/
function Broadcast() {
}

/*!
    \class Server
*/
function Server(httpServer) {
    this.wss = new WebSocket.Server({ server: httpServer });
    this.wss.on('connection', this.onConnection.bind(this));
}

Server.prototype.onConnection = function(ws) {
    ws.on('message', this.onClientMessage.bind(this));
//    ws.on('close', this.onClientClose.bind(this)); // by default 'close' will be called with ws object as this and close code as single argument
};

Server.prototype.onClientMessage = function(data) {
    this.wss.clients.forEach(function(client) {
        if (client.readyState === WebSocket.OPEN)
            client.send(data);
    });
};

//Server.prototype.onClientClose = function(code) {
//};

Broadcast.Server = Server;

/*!
    \class Client
*/
function Client(url) {
    this.url = url;
    this.ready = false;
    this.messageReceived = message();
    this.readyChanged = message();
    this.connect();
}

Client.RECONNECT_INTERVAL = 5000;

Client.prototype.connect = function() {
    console.log('Client.connect()');
    if (this.ws == null) {
        this.ws = new WebSocket(this.url);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onopen    = this.onOpen.bind(this);
        this.ws.onclose   = this.onClose.bind(this);
        this.ws.onerror   = this.onError.bind(this);
        this.closed = false;
    }
};

Client.prototype.diconnect = function() {
    if (this.ws != null) {
        this.closed = true;
        this.ws.close();
    }
};

Client.prototype.reconnect = function() {
    Timers.setTimeout(this.connect.bind(this), Client.RECONNECT_INTERVAL);
};

Client.prototype.onMessage = function(e) {
    this.messageReceived(e.data);
};

Client.prototype.onOpen = function(e) {
    console.log('Client.onOpen()', e);
    if (!this.ready) {
        this.ready = true;
        this.readyChanged(this.ready);
    }
};

Client.prototype.onClose = function(e) {
    console.log('Client.onClose()', e);
    if (this.ready) {
        this.ready = false;
        this.readyChanged(this.ready);
    }
    if (this.ws != null) {
        this.ws.onmessage = null;
        this.ws.onopen    = null;
        this.ws.onclose   = null;
        this.ws.onerror   = null;
        delete this.ws;
    }
    if (!this.closed)
        this.reconnect();
};

Client.prototype.onError = function(e) {
    console.log('Client.onError()', e);
//    if (this.ready
//        && this.ws.readyState !== WebSocket.OPEN) {
//        this.ready = false;
//        this.readyChanged(this.ready);
//    }
};

Client.prototype.send = function(text) {
    this.ws.send(text);
};

Broadcast.Client = Client;

return Broadcast;

}, 'Broadcast', ['../../../lib/Timers', '../../../lib/Observer', '../../../lib/WebSocket']));
