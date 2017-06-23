import EventEmitter          from 'events';
import WebSocket             from './websocket.js';
import signal                from './signal.js';
import { testFlag, setFlag } from './flags.js';
import TicTacToe             from './tictactoe.js';

console.log('defining TicTacToe.GameClient');

/*
    \class StatusQueue
*/
function StatusQueue(parent) {
    this.parent = parent;
    parent.showStatus = signal();
    parent.hideStatus = signal();
    this.queue = [];
    this.locked = false;
    this.minDisplayTime = StatusQueue.MinDisplayTime;
    this.maxDisplayTime = StatusQueue.MaxDisplayTime;
    this.unlock = this.unlock.bind(this);
}

StatusQueue.MinDisplayTime = 500;
StatusQueue.MaxDisplayTime = 3000;

StatusQueue.prototype.lock = function() {
    this.locked = true;
    setTimeout(this.unlock, this.minDisplayTime);
};

StatusQueue.prototype.unlock = function() {
    this.locked = false;
    this.pop();
};

StatusQueue.prototype.startHideTimer = function() {
    if (this.timerId == null) {
        this.timerId = setTimeout(function() {
            this.parent.hideStatus();
            this.timerId = null;
        }.bind(this), this.maxDisplayTime);
    }
};

StatusQueue.prototype.stopHideTimer = function() {
    if (this.timerId != null) {
        clearTimeout(this.timerId);
        this.timerId = null;
    }
};

StatusQueue.prototype.push = function(status) {
    this.queue.push(status);
    this.pop();
};

StatusQueue.prototype.pop = function() {
    if (this.locked)
        return;
    var status = this.queue.shift();
    if (!status)
        return;
    this.parent.showStatus(status);
    this.lock();
    this.stopHideTimer();
    if (!status.permanent)
        this.startHideTimer();
};

/*!
    \class GameClient
    \extends EventEmitter
*/
function GameClient(url) {
    EventEmitter.call(this);

    this.url = url;
    this.state = TicTacToe.NotConnectedState;
    this.closed = true;

    this.matchReady = signal();
    this.stateChanged = signal();

    this.statusQueue = new StatusQueue(this);

    this.removePlayer = this.removePlayer.bind(this);

    this.setMatch(new TicTacToe.Match());
    this.setPlayer(new TicTacToe.Player());

    this.handleOpen    = this.handleOpen.bind(this);
    this.handleClose   = this.handleClose.bind(this);
    this.handleError   = this.handleError.bind(this)
    this.handleMessage = this.handleMessage.bind(this);

    this.handleMatchFound   = this.handleMatchFound.bind(this);
    this.handleUpdatePlayer = this.handleUpdatePlayer.bind(this);
    this.handleMovePlayer   = this.handleMovePlayer.bind(this);
    this.handleQuitPlayer   = this.handleQuitPlayer.bind(this);

    this.on('matchFound',   this.handleMatchFound);
    this.on('updatePlayer', this.handleUpdatePlayer);
    this.on('movePlayer',   this.handleMovePlayer);
    this.on('quit',         this.handleQuitPlayer);
}

GameClient.ReconnectInterval = 5000;

GameClient.prototype = Object.create(EventEmitter.prototype);
GameClient.prototype.constructor = GameClient;

GameClient.prototype.connect = function() {
    this.closed = false;
    if (this.socket == null) {
        this.statusQueue.push({ text: 'Connecting to server...', permanent: true });
        this.socket = new WebSocket(this.url);
        this.socket.addEventListener('open',    this.handleOpen);
        this.socket.addEventListener('close',   this.handleClose);
        this.socket.addEventListener('error',   this.handleError);
        this.socket.addEventListener('message', this.handleMessage);
    }
};

GameClient.prototype.disconnect = function() {
    this.closed = true;
    if (this.socket != null)
        this.socket.close();
    if (this.timerId != null) {
        clearTimeout(this.timerId);
        delete this.timerId;
    }
};

GameClient.prototype.reconnect = function() {
    this.timerId = setTimeout(this.connect.bind(this), GameClient.ReconnectInterval);
};

GameClient.prototype.setState = function(stateFlag, on) {
    var state = setFlag(this.state, stateFlag, on);
    if (this.state !== state) {
        this.state = state;
        this.stateChanged(this.state);
    }
};

GameClient.prototype.testState = function(stateFlag) {
    return testFlag(this.state, stateFlag);
};

GameClient.prototype.setMode = function(mode) {
    if (this.mode !== mode) {
        switch (mode) {
        case TicTacToe.SoloMode:        this.startMatch([this.player, new TicTacToe.Player()]); break;
        case TicTacToe.AiMode:          this.startMatch([this.player, new TicTacToe.AiPlayer()]); break;
        case TicTacToe.MultiplayerMode: this.startMatch([new TicTacToe.ProxyPlayer(this, this.player)]); this.findMatch(); break;
        default: break;
        }
        this.mode = mode;
    }
};

GameClient.prototype.handleOpen = function(e) {
    console.log('GameClient.handleOpen()');
    if (!this.testState(TicTacToe.ConnectedState)) {
        this.statusQueue.push({ text: 'Connection established.' });
        this.setState(TicTacToe.ConnectedState, true);
        if (this.testState(TicTacToe.GameRunningState)) {
            this.setState(TicTacToe.GameRunningState, false);
            this.setState(TicTacToe.FindingMatchState, true);
        }
        if (this.testState(TicTacToe.FindingMatchState)) {
            this.setState(TicTacToe.FindingMatchState, false);
            this.findMatch();
        }
    }
};

GameClient.prototype.handleClose = function(e) {
    if (this.testState(TicTacToe.ConnectedState)) {
        console.log('GameClient.handleClose()', e);
        this.setState(TicTacToe.ConnectedState, false);
        this.statusQueue.push({ text: 'Connection closed.' });
    }
    if (this.socket != null) {
        // this.socket.removeEventListener('open',    this.handleOpen);
        // this.socket.removeEventListener('close',   this.handleClose);
        // this.socket.removeEventListener('error',   this.handleError);
        // this.socket.removeEventListener('message', this.handleMessage);
        delete this.socket;
    }
    if (!this.closed)
        this.reconnect();
};

GameClient.prototype.handleError = function(e) {
    console.error('GameClient.handleError()', e.message, e);
};

GameClient.prototype.handleMessage = function(e) {
    try {
        var action = TicTacToe.Action.parse(e.data);
        console.log('GameClient.handleMessage()', e.data, action);
        this.emit(action.type(), action);
    }
    catch (err) {
        console.error('GameClient.handleMessage()', err);
    }
};

GameClient.prototype.send = function(action) {
    if (this.testState(TicTacToe.ConnectedState)) {
        var data = action.stringify();
        console.log('GameClient.send()', data, action);
        this.socket.send(data);
    }
};

GameClient.prototype.setMatch = function(match) {
    if (this.match != null) {
        this.match.playerRemoved.disconnect(this.removePlayer);
    }
    this.match = match;
    if (this.match != null) {
        this.match.playerRemoved.connect(this.removePlayer);
    }
};

GameClient.prototype.startMatch = function(players) {
    this.match.clear();
    this.matchReady(this.match);
    players.forEach(function(player) {
        this.match.addPlayer(player);
    }.bind(this));
};

GameClient.prototype.setPlayer = function(player) {
    this.player = player;
};

GameClient.prototype.removePlayer = function(player) {
    console.log('GameClient.removePlayer()', player, this.player, player instanceof TicTacToe.ProxyPlayer, player.equals(this.player));
    if (player instanceof TicTacToe.ProxyPlayer) {
        if (player.player === this.player
            && !(this.testState(TicTacToe.GameRunningState | TicTacToe.FindingMatchState, true))) // matchFoundState
            this.quit();
        player.setPlayer();
    }
};

GameClient.prototype.findMatch = function() {
    console.log('GameClient.findMatch()', this.state);
    if (this.testState(TicTacToe.FindingMatchState)
        || this.testState(TicTacToe.GameRunningState))
        return;
    this.setState(TicTacToe.FindingMatchState, true);
    if (!this.testState(TicTacToe.ConnectedState)) {
        this.connect();
        return;
    }
    this.statusQueue.push({ text: 'Finding match...', permanent: true });
    this.send(TicTacToe.Action.create('findMatch', this.player.name));
};

GameClient.prototype.updatePlayer = function(player, propertyName, propertyValue) {
    console.log('GameClient.updatePlayer()', player, propertyName, propertyValue);
    this.send(TicTacToe.Action.create('updatePlayer', player.index, propertyName, propertyValue));
};

GameClient.prototype.movePlayer = function(player, row, column) {
    console.log('GameClient.movePlayer()', player, row, column);
    if (this.testState(TicTacToe.GameRunningState))
        this.send(TicTacToe.Action.create('movePlayer', player.index, row, column));
    else
        this.findMatch();
};

GameClient.prototype.quit = function() {
    console.log('GameClient.quit()', this.state);
    this.statusQueue.push({ text: 'Quit match.' });
    this.send(TicTacToe.Action.create('quit', this.player.index));
    this.setState(TicTacToe.GameRunningState, false);
    this.setState(TicTacToe.FindingMatchState, false);
    this.disconnect();
};

GameClient.prototype.sync = function() {
    console.log('GameClient.sync()');
    this.send(TicTacToe.Action.create('sync', this.match, this.player));
};

GameClient.prototype.move  = function(row, column) {
    console.log('GameClient.move()', row, column);
    var player = this.match.currentPlayer() || this.player;
    player.move(row, column);
};

GameClient.prototype.handleMatchFound = function(action) {
    this.statusQueue.push({ text: 'Match found.' });
    this.setState(TicTacToe.GameRunningState, true);
    var players = action.playersInfo.map(function(playerInfo) {
        return new TicTacToe.ProxyPlayer(this, playerInfo.self ? this.player : new TicTacToe.Player(playerInfo.name), !playerInfo.self);
    }.bind(this));
    this.startMatch(players);
    this.setState(TicTacToe.FindingMatchState, false);
    this.sync();
};

GameClient.prototype.handleUpdatePlayer = function(action) {
    var player = this.match.findPlayer(TicTacToe.playerByIndex(action.playerIndex));
    if (player)
        player.updatePlayer(action);
};

GameClient.prototype.handleMovePlayer = function(action) {
    var player = this.match.findPlayer(TicTacToe.playerByIndex(action.playerIndex));
    if (player)
        player.movePlayer(action);
    this.sync();
};

GameClient.prototype.handleQuitPlayer = function(action) {
    var player = this.match.findPlayer(TicTacToe.playerByIndex(action.playerIndex));
    console.log('GameClient.handleQuitPlayer()', action, player);
    if (player) {
        this.statusQueue.push({ text: 'Player ' + player.name + ' left.' });
        this.match.removePlayer(player);
        this.setState(TicTacToe.GameRunningState, false);
        this.findMatch();
    }
};

TicTacToe.GameClient = GameClient;

export default TicTacToe;
