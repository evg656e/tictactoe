import EventEmitter from 'events';
import { Signal } from '../../core/Signal';
import { testFlag, setFlag } from '../../core/flags';
import * as TicTacToe from '../base/TicTacToe';
import { Player } from '../base/Player';
import { Match } from '../base/Match';
import { Action } from '../actions/Action';
import { StatusQueue } from './StatusQueue';
import { AiPlayer } from './AiPlayer';
import { ProxyPlayer } from './ProxyPlayer';

/*!
    \class GameClient
    \extends EventEmitter
*/
export class GameClient extends EventEmitter {
    constructor(url, WebSocket) {
        super();
        this.url = url;
        this.WebSocket = WebSocket;
        this.state = TicTacToe.NotConnectedState;
        this.closed = true;
        this.matchReady = new Signal();
        this.stateChanged = new Signal();
        this.statusQueue = new StatusQueue(this);

        this.removePlayer = this.removePlayer.bind(this);
        this.connect = this.connect.bind(this);

        this.setMatch(new Match());
        this.setPlayer(new Player());

        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.handleMatchFound = this.handleMatchFound.bind(this);
        this.handleUpdatePlayer = this.handleUpdatePlayer.bind(this);
        this.handleMovePlayer = this.handleMovePlayer.bind(this);
        this.handleQuitPlayer = this.handleQuitPlayer.bind(this);

        this.on('matchFound', this.handleMatchFound);
        this.on('updatePlayer', this.handleUpdatePlayer);
        this.on('movePlayer', this.handleMovePlayer);
        this.on('quit', this.handleQuitPlayer);
    }

    connect() {
        this.closed = false;
        if (this.socket == null) {
            this.statusQueue.push({ text: 'Connecting to server...', permanent: true });
            this.socket = new this.WebSocket(this.url);
            this.socket.addEventListener('open', this.handleOpen);
            this.socket.addEventListener('close', this.handleClose);
            this.socket.addEventListener('error', this.handleError);
            this.socket.addEventListener('message', this.handleMessage);
        }
    }

    disconnect() {
        this.closed = true;
        if (this.socket != null)
            this.socket.close();
        if (this.timerId != null) {
            clearTimeout(this.timerId);
            delete this.timerId;
        }
    }

    reconnect() {
        this.timerId = setTimeout(this.connect, GameClient.ReconnectInterval);
    }

    setState(stateFlag, on) {
        const state = setFlag(this.state, stateFlag, on);
        if (this.state !== state) {
            this.state = state;
            this.stateChanged(this.state);
        }
    }

    testState(stateFlag) {
        return testFlag(this.state, stateFlag);
    }

    setMode(mode) {
        if (this.mode !== mode) {
            switch (mode) {
            case TicTacToe.SoloMode:
                this.startMatch([this.player, new Player()]);
                break;
            case TicTacToe.AiMode:
                this.startMatch([this.player, new AiPlayer()]);
                break;
            case TicTacToe.MultiplayerMode:
                this.startMatch([new ProxyPlayer(this, this.player)]);
                this.findMatch();
                break;
            default: break;
            }
            this.mode = mode;
        }
    }

    send(action) {
        if (this.testState(TicTacToe.ConnectedState)) {
            const data = action.stringify();
            console.log('GameClient.send()', data, action);
            this.socket.send(data);
        }
    }

    setMatch(match) {
        if (this.match != null) {
            this.match.playerRemoved.disconnect(this.removePlayer);
        }
        this.match = match;
        if (this.match != null) {
            this.match.playerRemoved.connect(this.removePlayer);
        }
    }

    startMatch(players) {
        this.match.clear();
        this.matchReady(this.match);
        players.forEach((player) => {
            this.match.addPlayer(player);
        });
    }

    setPlayer(player) {
        this.player = player;
    }

    removePlayer(player) {
        console.log('GameClient.removePlayer()', player, this.player, player instanceof ProxyPlayer, player.equals(this.player));
        if (player instanceof ProxyPlayer) {
            if (player.player === this.player
                && !(this.testState(TicTacToe.GameRunningState | TicTacToe.FindingMatchState, true))) // matchFoundState
                this.quit();
            player.setPlayer();
        }
    }

    findMatch() {
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
        this.send(Action.create('findMatch', this.player.name));
    }

    updatePlayer(player, propertyName, propertyValue) {
        console.log('GameClient.updatePlayer()', player, propertyName, propertyValue);
        this.send(Action.create('updatePlayer', player.index, propertyName, propertyValue));
    }

    movePlayer(player, row, column) {
        console.log('GameClient.movePlayer()', player, row, column);
        if (this.testState(TicTacToe.GameRunningState))
            this.send(Action.create('movePlayer', player.index, row, column));
        else
            this.findMatch();
    }

    quit() {
        console.log('GameClient.quit()', this.state);
        this.statusQueue.push({ text: 'Quit match.' });
        this.send(Action.create('quit', this.player.index));
        this.setState(TicTacToe.GameRunningState, false);
        this.setState(TicTacToe.FindingMatchState, false);
        this.disconnect();
    }

    sync() {
        console.log('GameClient.sync()');
        this.send(Action.create('sync', this.match, this.player));
    }

    move(row, column) {
        console.log('GameClient.move()', row, column);
        const player = this.match.currentPlayer() || this.player;
        player.move(row, column);
    }


    handleOpen(e) {
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
    }

    handleClose(e) {
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
    }

    handleMatchFound(action) {
        this.statusQueue.push({ text: 'Match found.' });
        this.setState(TicTacToe.GameRunningState, true);
        const players = action.playersInfo.map((playerInfo) => {
            return new ProxyPlayer(this, playerInfo.self ? this.player : new Player(playerInfo.name), !playerInfo.self);
        });
        this.startMatch(players);
        this.setState(TicTacToe.FindingMatchState, false);
        this.sync();
    }

    handleUpdatePlayer(action) {
        const player = this.match.findPlayer(TicTacToe.playerByIndex(action.playerIndex));
        if (player)
            player.updatePlayer(action);
    }

    handleMovePlayer(action) {
        const player = this.match.findPlayer(TicTacToe.playerByIndex(action.playerIndex));
        if (player)
            player.movePlayer(action);
        this.sync();
    }

    handleQuitPlayer(action) {
        const player = this.match.findPlayer(TicTacToe.playerByIndex(action.playerIndex));
        console.log('GameClient.handleQuitPlayer()', action, player);
        if (player) {
            this.statusQueue.push({ text: 'Player ' + player.name + ' left.' });
            this.match.removePlayer(player);
            this.setState(TicTacToe.GameRunningState, false);
            this.findMatch();
        }
    }

    handleError(e) {
        console.error('GameClient.handleError()', e.message, e);
    }

    handleMessage(e) {
        try {
            const action = Action.parse(e.data);
            console.log('GameClient.handleMessage()', e.data, action);
            this.emit(action.type(), action);
        }
        catch (err) {
            console.error('GameClient.handleMessage()', err);
        }
    }
}

GameClient.ReconnectInterval = 5000;
