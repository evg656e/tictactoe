import EventEmitter from 'events';
import WebSocket    from './websocket.js';
import TicTacToe    from './tictactoe.js';

console.log('defining TicTacToe.GameServer');

/*!
    \class ServerClient
    \extends EventEmitter
*/
function ServerClient(server, socket) {
    console.log('ServerClient()');

    EventEmitter.call(this);

    this.server      = server;
    this.socket      = socket;
    this.match       = null;
    this.playerName  = '';
    this.playerIndex = -1;

    this.handleClose   = this.handleClose.bind(this);
    this.handleMessage = this.handleMessage.bind(this)

    socket.on('close',   this.handleClose);
    socket.on('message', this.handleMessage);

    this.on('findMatch',    this.handleFindMatch.bind(this));
    this.on('updatePlayer', this.handleUpdatePlayer.bind(this));
    this.on('movePlayer',   this.handleMove.bind(this));
    this.on('quit',         this.handleQuit.bind(this));
    this.on('sync',         this.handleSync.bind(this));
}

ServerClient.prototype = Object.create(EventEmitter.prototype);
ServerClient.prototype.constructor = ServerClient;

ServerClient.prototype.handleClose = function() {
    console.log('ServerClient.handleClose()');
    if (this.match)
        this.match.quitPlayer(this, TicTacToe.QuitAction.Disconnected);
    this.server.removeClient(this);
    this.socket.removeListener('close',   this.handleClose);
    this.socket.removeListener('message', this.handleMessage);
    this.socket = null;
};

ServerClient.prototype.handleMessage = function(data) {
    try {
        var action = TicTacToe.Action.parse(data);
        console.log('ServerClient.handleMessage()', data, action);
        this.emit(action.type(), action);
    }
    catch (err) {
        console.error('ServerClient.handleMessage()', err);
    }
};

ServerClient.prototype.send = function(action) {
    if (this.socket.readyState !== WebSocket.OPEN)
        return;
    var data = action.stringify();
    console.log('ServerClient.send()', data, action);
    this.socket.send(data);
};

ServerClient.prototype.handleFindMatch = function(action) {
    this.server.findMatch(this, action);
};

ServerClient.prototype.handleUpdatePlayer = function(action) {
    if (this.match)
        this.match.updatePlayer(this, action);
    else {
        if (action.propertyName === 'name')
            this.playerName = action.propertyValue;
        this.send(action);
    }
};

ServerClient.prototype.handleMove = function(action) {
    if (this.match)
        this.match.movePlayer(this, action);
};

ServerClient.prototype.handleQuit = function(action) {
    if (this.match)
        this.match.quitPlayer(this, action);
};

ServerClient.prototype.handleSync = function(action) {
    if (this.match)
        this.match.syncPlayer(this, action);
};

ServerClient.prototype.matchFound = function(playersInfo) {
    console.log('ServerClient.matchFound()', playersInfo);
    this.send(TicTacToe.Action.create('matchFound', playersInfo));
};

ServerClient.prototype.quit = function(code) {
    console.log('ServerClient.quit()', this.playerIndex, code);
    this.send(TicTacToe.Action.create('quit', this.playerIndex, code));
    this.playerIndex = -1;
};

/*!
    \class ServerMatch
*/
function ServerMatch(server, clients) {
    console.log('ServerMatch()');
    this.server = server;
    this.clients = clients;
    this.current = -1;
    this.syncActions = {};
    this.state = ServerMatch.InitState;
    if (this.clients.length === TicTacToe.MaxPlayers) {
        this.clients.forEach(function(client) {
            client.match = this;
            var playersInfo = this.clients.map(function(otherClient) {
                return new TicTacToe.PlayerInfo(otherClient.playerName, client === otherClient);
            });
            client.matchFound(playersInfo);
        }.bind(this));
        this.state = ServerMatch.SyncState;
    }
}

ServerMatch.InitState = 0;
ServerMatch.SyncState = 1;
ServerMatch.MoveState = 1;

ServerMatch.prototype.updatePlayer = function(client, action) {
    this.clients.forEach(function(otherClient) {
        otherClient.send(action);
    });
};

ServerMatch.prototype.movePlayer = function(client, action) {
    console.log('ServerMatch.movePlayer()', client.playerIndex, action.playerIndex);
    if (this.state === ServerMatch.MoveState
        && (this.current === client.playerIndex || this.current === -1)) { // this.current === -1 for game over state
        this.clients.forEach(function(otherClient) {
            otherClient.send(action);
        });
        this.state = ServerMatch.SyncState;
    }
};

ServerMatch.prototype.syncPlayer = function(client, action) {
    if (this.state === ServerMatch.SyncState) {
        var index = this.clients.indexOf(client);
        if (index !== -1) {
            client.playerIndex = action.playerIndex;
            this.syncActions[index] = action;
            if (Object.keys(this.syncActions).length === this.clients.length) {
                for (var i = 1; i < this.clients.length; i++) {
                    var prevAction = this.syncActions[i - 1],
                        currAction = this.syncActions[i];
                    if (prevAction.stateHash !== currAction.stateHash) {
                        console.error('ServerMatch.syncPlayer(): state desynchronized.', prevAction, currAction);
                        this.clients.forEach(function(client) {
                            client.quit(TicTacToe.QuitAction.Desynchronized);
                        });
                        this.close();
                        return;
                    }
                }
                console.log('ServerMatch.syncPlayer(): state synchronized.');
                this.current = action.current;
                this.syncActions = {};
                this.state = ServerMatch.MoveState;
            }
        }
    }
};

ServerMatch.prototype.quitPlayer = function(client, code) {
    var index = this.clients.indexOf(client);
    console.log('ServerMatch.quitPlayer()', index, client.playerIndex);
    if (index !== -1) {
        this.clients.splice(index, 1);
        this.clients.forEach(function(otherClient) {
            otherClient.send(TicTacToe.Action.create('quit', client.playerIndex, code));
        });
        this.close();
        client.quit(code);
    }
};

ServerMatch.prototype.close = function() {
    console.log('ServerMatch.close()');
    this.clients.forEach(function(client) {
        client.match = null;
    });
    this.clients = [];
    this.server = null;
    this.current = -1;
    this.syncActions = {};
    this.state = ServerMatch.InitState;
};

/*!
    \class GameServer
*/
function GameServer(httpServer) {
    console.log('GameServer()');
    this.socketServer = new WebSocket.Server({ server: httpServer });
    this.socketServer.on('connection', this.handleConnection.bind(this));
    this.findingQueue = [];
}

GameServer.prototype.handleConnection = function(socket) {
    console.log('GameServer.handleConnection()');
    new ServerClient(this, socket);
};

GameServer.prototype.findMatch = function(client, action) {
    console.log('GameServer.findMatch()', action);
    client.playerName = action.playerName;
    this.findingQueue.push(client);
    if (this.findingQueue.length < TicTacToe.MaxPlayers)
        return;
    var clients = [],
        count = TicTacToe.MaxPlayers;
    while (count-- > 0)
        clients.push(this.findingQueue.shift());
    new ServerMatch(this, clients);
};

GameServer.prototype.removeClient = function(client) {
    var index = this.findingQueue.indexOf(client);
    console.log('GameServer.removeClient()', index);
    if (index !== -1)
        this.findingQueue.splice(index, 1);
};

TicTacToe.GameServer = GameServer;

export default TicTacToe;
